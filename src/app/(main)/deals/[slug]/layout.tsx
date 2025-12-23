import { Metadata } from 'next'
import { createServerComponentClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

interface DealLayoutProps {
  params: { slug: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient(cookieStore)

    // Fetch deal data for meta tags
    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        founder:profiles!deals_founder_id_fkey(
          full_name,
          company_name
        )
      `)
      .eq('slug', params.slug)
      .eq('status', 'live')
      .single()

    if (error || !deal) {
      return {
        title: 'Deal Not Found | IndieSaasDeals',
        description: 'The deal you\'re looking for was not found. Browse other exclusive SaaS deals on IndieSaasDeals.',
      }
    }

    const formatPrice = (price: number) => {
      const priceInDollars = price > 999 ? price / 100 : price;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(priceInDollars);
    }

    const title = `${deal.product_name} - ${deal.discount_percentage}% OFF | IndieSaasDeals`
    const description = `Get ${deal.discount_percentage}% off ${deal.product_name}! ${deal.short_description} Originally ${formatPrice(deal.original_price)}, now just ${formatPrice(deal.deal_price)}. Limited time offer.`
    const url = `https://indiesaasdeals.com/deals/${deal.slug}`
    const imageUrl = deal.product_logo_url || 'https://indiesaasdeals.com/og-image.png'

    return {
      title,
      description,
      keywords: [
        deal.product_name,
        'SaaS discount',
        'software deal',
        'startup tools',
        deal.category,
        ...(deal.tags || [])
      ].join(', '),
      authors: [
        {
          name: deal.founder?.full_name || deal.founder?.company_name || 'IndieSaasDeals',
        }
      ],
      openGraph: {
        title,
        description,
        url,
        siteName: 'IndieSaasDeals',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${deal.product_name} - ${deal.discount_percentage}% OFF`,
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@indiesaasdeals',
      },
      alternates: {
        canonical: url,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'product:price:amount': (deal.deal_price / 100).toString(),
        'product:price:currency': 'USD',
        'product:original_price:amount': (deal.original_price / 100).toString(),
        'product:original_price:currency': 'USD',
        'product:discount_percentage': deal.discount_percentage.toString(),
        'product:category': deal.category,
        'product:availability': deal.codes_remaining > 0 ? 'in stock' : 'out of stock',
      }
    }
  } catch (error) {
    console.error('Error generating metadata for deal:', error)
    return {
      title: 'Exclusive SaaS Deals | IndieSaasDeals',
      description: 'Discover amazing discounts on the best indie SaaS tools. Limited-time offers from innovative founders.',
    }
  }
}

export default function DealLayout({ children }: DealLayoutProps) {
  return <>{children}</>
}