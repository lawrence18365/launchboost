import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/lib/server/db';
import DealView from '@/components/deal/DealView';
import { Metadata } from 'next';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Function to fetch deal data server-side
async function getDeal(slug: string) {
  const supabase = createServerComponentClient();
  
  // Try finding by slug first
  let { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      founder:users!founder_id (
        full_name,
        company_name,
        twitter_handle,
        bio
      )
    `)
    .eq('slug', slug)
    .single();

  // If not found by slug, try by ID (UUID format)
  if (!deal && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
    const { data: dealById, error: idError } = await supabase
      .from('deals')
      .select(`
        *,
        founder:users!founder_id (
          full_name,
          company_name,
          twitter_handle,
          bio
        )
      `)
      .eq('id', slug)
      .single();
      
    if (dealById) {
      deal = dealById;
    }
  }

  return deal;
}

// SEO: Generate dynamic metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const deal = await getDeal(params.slug);

  if (!deal) {
    return {
      title: 'Deal Not Found - IndieSaasDeals',
      description: 'The requested SaaS deal could not be found.',
    };
  }

  const discount = deal.discount_percentage ? `${deal.discount_percentage}% OFF` : 'Exclusive Deal';
  
  return {
    title: `${deal.product_name} - ${discount} | IndieSaasDeals`,
    description: `Get ${deal.product_name} for ${deal.deal_price ? `$${deal.deal_price/100}` : 'free'} (Save $${(deal.original_price - deal.deal_price)/100}). ${deal.short_description || deal.description?.substring(0, 120)}...`,
    openGraph: {
      title: `${deal.product_name} Deal - ${discount}`,
      description: deal.short_description,
      images: deal.product_logo_url ? [deal.product_logo_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${deal.product_name} - ${discount}`,
      description: deal.short_description,
    }
  };
}

export default async function DealPage({ params }: { params: { slug: string } }) {
  const deal = await getDeal(params.slug);

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-white border-2 border-black rounded-lg p-8">
            <div className="w-16 h-16 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-4">Deal Not Found</h1>
            <p className="text-black/80 mb-8 leading-relaxed">The deal you are looking for has been removed or does not exist.</p>
            <Link 
              href="/deals" 
              className="inline-flex items-center bg-black text-yellow-400 font-bold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <DealView deal={deal} />;
}