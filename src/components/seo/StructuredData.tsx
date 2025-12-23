"use client";

import { usePathname } from 'next/navigation';

export function StructuredData() {
  const pathname = usePathname();
  
  // Organization schema for homepage
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IndieSaasDeals",
    "url": "https://indiesaasdeals.com",
    "logo": "https://indiesaasdeals.com/logo.svg",
    "description": "Exclusive SaaS deals and discounts for indie hackers and startup founders",
    "sameAs": [
      "https://x.com/indiesaasdeals",
      "https://www.linkedin.com/company/indiesaasdeals"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://indiesaasdeals.com/contact"
    }
  };

  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "IndieSaasDeals",
    "url": "https://indiesaasdeals.com",
    "description": "Exclusive SaaS deals and discounts for indie hackers and startup founders",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://indiesaasdeals.com/search?q={query}",
      "query-input": "required name=query"
    }
  };

  // Blog article schema for blog posts
  const getArticleSchema = (pathname: string) => {
    const articles = {
      '/blog/startup-tools-2025': {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Best SaaS Tools for Startups in 2025 - Complete Guide with Exclusive Deals",
        "description": "Discover the essential SaaS tools every startup needs in 2025. Get project management, design, marketing & development tools with exclusive discounts up to 80% off.",
        "author": {
          "@type": "Organization",
          "name": "IndieSaasDeals Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "IndieSaasDeals",
          "logo": {
            "@type": "ImageObject",
            "url": "https://indiesaasdeals.com/logo.svg"
          }
        },
        "datePublished": "2025-08-18T00:00:00.000Z",
        "dateModified": "2025-08-18T00:00:00.000Z",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://indiesaasdeals.com/blog/startup-tools-2025"
        }
      },
      '/blog/appsumo-alternative': {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Best AppSumo Alternative for Indie Hackers 2025 - IndieSaasDeals vs AppSumo",
        "description": "Looking for an AppSumo alternative built for indie hackers? Compare features, deals quality, and community. Get exclusive SaaS discounts tailored for startup founders.",
        "author": {
          "@type": "Organization", 
          "name": "IndieSaasDeals Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "IndieSaasDeals",
          "logo": {
            "@type": "ImageObject",
            "url": "https://indiesaasdeals.com/logo.svg"
          }
        },
        "datePublished": "2025-08-18T00:00:00.000Z",
        "dateModified": "2025-08-18T00:00:00.000Z",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://indiesaasdeals.com/blog/appsumo-alternative"
        }
      }
    };

    return articles[pathname as keyof typeof articles];
  };

  const schemas = [organizationSchema, websiteSchema];
  const articleSchema = getArticleSchema(pathname);
  if (articleSchema) {
    schemas.push(articleSchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  );
}