import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createServerComponentClient } from '@/lib/server/db';
import CategoryDealsBrowser from '@/components/category/CategoryDealsBrowser';

// Category mapping
const categoryMap: Record<string, string> = {
  'ai-machine-learning': 'AI & Machine Learning',
  'analytics-data': 'Analytics & Data',
  'business-finance': 'Business & Finance',
  'communication-collaboration': 'Communication & Collaboration',
  'design-creative': 'Design & Creative',
  'developer-tools': 'Developer Tools',
  'ecommerce-retail': 'E-commerce & Retail',
  'education-learning': 'Education & Learning',
  'healthcare-wellness': 'Healthcare & Wellness',
  'hr-recruiting': 'HR & Recruiting',
  'marketing-growth': 'Marketing & Growth',
  'productivity-organization': 'Productivity & Organization',
  'sales-crm': 'Sales & CRM',
  'security-privacy': 'Security & Privacy',
  'social-community': 'Social & Community'
};

async function getCategoryDeals(categoryName: string) {
  const supabase = createServerComponentClient();
  
  const { data: deals, error } = await supabase
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
    .eq('category', categoryName)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching category deals:', error);
    return [];
  }

  // Process deals (calculate ratings, etc) - similar to API route
  return deals.map(deal => {
    const reviews = deal.deal_reviews || [];
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
      : 0;

    // Convert prices from cents to dollars for display
    return {
      ...deal,
      logo_url: deal.product_logo_url,
      // Ensure we don't divide by 100 twice if the DB stores cents but API logic was different
      // Assuming DB stores cents based on API route logic
      original_price: deal.original_price, 
      deal_price: deal.deal_price,
      avg_rating: Number(avgRating.toFixed(1)),
      review_count: reviewCount
    };
  });
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categoryName = categoryMap[params.category];

  if (!categoryName) {
    return {
      title: 'Category Not Found | IndieSaasDeals',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${categoryName} SaaS Deals | Best Discounts & Lifetime Offers`,
    description: `Discover the best ${categoryName} SaaS deals, discounts, and lifetime offers. Curated for indie hackers, startups, and founders. Save on ${categoryName} tools today.`,
    openGraph: {
      title: `Best ${categoryName} SaaS Deals - Up to 90% OFF`,
      description: `Find exclusive discounts on ${categoryName} software. Verified deals directly from founders.`,
    }
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryName = categoryMap[params.category];

  if (!categoryName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Category Not Found</h1>
          <p className="text-black/80 font-medium mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/categories" className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const deals = await getCategoryDeals(categoryName);

  return (
    <div className="min-h-screen bg-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/categories" className="inline-flex items-center text-black/80 hover:text-black font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            {categoryName}
          </h1>
          <p className="text-lg md:text-xl text-black/80 font-medium max-w-3xl mx-auto leading-relaxed">
            Discover exclusive deals on the best {categoryName.toLowerCase()} tools and platforms. 
            Get early-bird pricing and lifetime offers from innovative SaaS companies.
          </p>
        </div>

        {/* Browser Component (Client Side) */}
        <CategoryDealsBrowser initialDeals={deals} categoryName={categoryName} />
      </div>
    </div>
  );
}
