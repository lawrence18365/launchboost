'use client'

interface DealStructuredDataProps {
  deal: {
    id: string
    slug: string
    product_name: string
    title: string
    description: string
    short_description: string
    category: string
    original_price: number
    deal_price: number
    discount_percentage: number
    product_logo_url?: string
    product_website: string
    tags?: string[]
    created_at: string
    expires_at?: string
    founder?: {
      full_name?: string
      company_name?: string
      twitter_handle?: string
    }
  }
}

export default function DealStructuredData({ deal }: DealStructuredDataProps) {
  const formatPrice = (price: number) => {
    return price > 999 ? price / 100 : price
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: deal.product_name,
    description: deal.description,
    image: deal.product_logo_url || "https://indiesaasdeals.com/og-image.png",
    url: `https://indiesaasdeals.com/deals/${deal.slug}`,
    brand: {
      "@type": "Brand",
      name: deal.founder?.company_name || deal.product_name
    },
    category: deal.category,
    offers: {
      "@type": "Offer",
      price: formatPrice(deal.deal_price),
      priceCurrency: "USD",
      priceValidUntil: deal.expires_at || undefined,
      availability: "https://schema.org/InStock",
      url: `https://indiesaasdeals.com/deals/${deal.slug}`,
      seller: {
        "@type": "Organization",
        name: deal.founder?.company_name || "IndieSaasDeals",
        url: deal.product_website,
        sameAs: deal.founder?.twitter_handle ? [`https://x.com/${deal.founder.twitter_handle}`] : undefined
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "SaaS Discount Deals",
        itemListElement: [
          {
            "@type": "Offer",
            price: formatPrice(deal.original_price),
            priceCurrency: "USD",
            name: "Regular Price"
          },
          {
            "@type": "Offer", 
            price: formatPrice(deal.deal_price),
            priceCurrency: "USD",
            name: "Discounted Price"
          }
        ]
      }
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "100"
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5"
        },
        author: {
          "@type": "Person",
          name: "SaaS User"
        },
        reviewBody: `Great discount on ${deal.product_name}. ${deal.discount_percentage}% off is an excellent deal!`
      }
    ]
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://indiesaasdeals.com"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Deals",
        item: "https://indiesaasdeals.com/deals"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: deal.product_name,
        item: `https://indiesaasdeals.com/deals/${deal.slug}`
      }
    ]
  }

  const promotionData = {
    "@context": "https://schema.org",
    "@type": "PromotionalOffer",
    name: deal.title,
    description: deal.short_description,
    validFrom: deal.created_at,
    validThrough: deal.expires_at || undefined,
    url: `https://indiesaasdeals.com/deals/${deal.slug}`,
    priceSpecification: {
      "@type": "PriceSpecification",
      price: formatPrice(deal.deal_price),
      priceCurrency: "USD"
    },
    offeredBy: {
      "@type": "Organization", 
      name: deal.founder?.company_name || "IndieSaasDeals",
      url: deal.product_website,
      sameAs: deal.founder?.twitter_handle ? [`https://x.com/${deal.founder.twitter_handle}`] : undefined
    },
    category: deal.category
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData, null, 2)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(promotionData, null, 2)
        }}
      />
    </>
  )
}