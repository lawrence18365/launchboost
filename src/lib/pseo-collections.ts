import { createServerComponentClient } from '@/lib/server/db';

export type CollectionDefinition = {
  title: string;
  description: string;
  query: (supabase: any) => any;
};

// Map of simple slug -> Collection Definition
// This handles exact matches like "lifetime-deals"
export const staticCollections: Record<string, (supabase: any) => any> = {
  'lifetime-deals': (query) => query.eq('deal_type', 'lifetime'),
  'free-software': (query) => query.or('deal_price.eq.0,pricing_tier.eq.free'),
  'under-25': (query) => query.lt('deal_price', 2500), // Prices in cents
  'under-50': (query) => query.lt('deal_price', 5000),
  'black-friday': (query) => query.contains('tags', ['black-friday']),
  'cyber-monday': (query) => query.contains('tags', ['cyber-monday']),
};

const categoryMap: Record<string, string> = {
  'marketing': 'Marketing & Growth',
  'dev-tools': 'Developer Tools',
  'design': 'Design & Creative',
  'productivity': 'Productivity & Organization',
  'ai': 'AI & Machine Learning',
  'sales': 'Sales & CRM',
  'finance': 'Business & Finance',
  // Add more simplified slugs for mapping
};

// Helper to reverse map full category name to simple slug if needed, 
// but here we need simple slug -> full name
function getCategoryFromSlug(slug: string): string | null {
  // Try exact match first
  for (const [key, val] of Object.entries(categoryMap)) {
    if (slug === key) return val;
    if (slug === val.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')) return val;
  }
  return null;
}

export async function getCollectionDeals(slug: string) {
  const supabase = createServerComponentClient();
  let query = supabase
    .from('deals')
    .select(`
      *,
      product_logo_url,
      profiles:founder_id (
        full_name,
        avatar_url
      ),
      deal_reviews (
        rating
      )
    `)
    .eq('status', 'live')
    .gte('expires_at', new Date().toISOString());

  // 1. Check Static Collections
  if (staticCollections[slug]) {
    query = staticCollections[slug](query);
    return { 
      deals: await executeQuery(query),
      meta: {
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: `Best ${slug.replace(/-/g, ' ')} for indie hackers.`
      }
    };
  }

  // 2. Dynamic PSEO: "{category}-lifetime-deals"
  if (slug.endsWith('-lifetime-deals')) {
    const catSlug = slug.replace('-lifetime-deals', '');
    const category = getCategoryFromSlug(catSlug);
    if (category) {
      query = query.eq('category', category).eq('deal_type', 'lifetime');
      return {
        deals: await executeQuery(query),
        meta: {
          title: `Lifetime ${category} Deals`,
          description: `Pay once, use forever. Best lifetime deals on ${category} software.`
        }
      };
    }
  }

  // 3. Dynamic PSEO: "{category}-black-friday"
  if (slug.endsWith('-black-friday')) {
    const catSlug = slug.replace('-black-friday', '');
    const category = getCategoryFromSlug(catSlug);
    if (category) {
      query = query.eq('category', category).contains('tags', ['black-friday']);
      return {
        deals: await executeQuery(query),
        meta: {
          title: `Black Friday ${category} Deals`,
          description: `Huge savings on ${category} tools this Black Friday.`
        }
      };
    }
  }

  // 4. Dynamic PSEO: "best-{category}"
  if (slug.startsWith('best-')) {
    const catSlug = slug.replace('best-', '');
    const category = getCategoryFromSlug(catSlug);
    if (category) {
      // "Best" simply means sorting by rating or views, defaulting to just category filter here
      query = query.eq('category', category).order('avg_rating', { ascending: false, nullsFirst: false });
      return {
        deals: await executeQuery(query),
        meta: {
          title: `Best ${category} Software Deals`,
          description: `Top rated ${category} tools and SaaS deals.`
        }
      };
    }
  }

  return null;
}

async function executeQuery(query: any) {
  const { data: deals, error } = await query;
  
  if (error) {
    console.error('PSEO Query Error:', error);
    return [];
  }

  return deals.map((deal: any) => {
    const reviews = deal.deal_reviews || [];
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
      : 0;

    return {
      ...deal,
      logo_url: deal.product_logo_url,
      original_price: deal.original_price,
      deal_price: deal.deal_price,
      avg_rating: Number(avgRating.toFixed(1)),
      review_count: reviewCount
    };
  });
}
