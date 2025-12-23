"use client";

interface Deal {
  id: string;
  slug: string;
  product_name: string;
}

interface CategoryStructuredDataProps {
  category: string;
  deals: Deal[];
}

export function CategoryStructuredData({ category, deals }: CategoryStructuredDataProps) {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category} SaaS Deals`,
    "description": `Curated SaaS deals and discounts in the ${category} category`,
    "itemListElement": deals.map((deal, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://indiesaasdeals.com/deals/${deal.slug}`,
      "name": deal.product_name
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(itemListSchema)
      }}
    />
  );
}