"use client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published_at: string;
  updated_at?: string;
  author?: string;
  featured_image?: string;
  tags?: string[];
}

interface BlogStructuredDataProps {
  post: BlogPost;
}

export default function BlogStructuredData({ post }: BlogStructuredDataProps) {
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "author": {
      "@type": "Person",
      "name": post.author || "IndieSaasDeals Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IndieSaasDeals",
      "logo": {
        "@type": "ImageObject",
        "url": "https://indiesaasdeals.com/logo.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://indiesaasdeals.com/blog/${post.slug}`
    },
    "url": `https://indiesaasdeals.com/blog/${post.slug}`,
    "image": post.featured_image || "https://indiesaasdeals.com/logo.svg",
    "articleSection": "SaaS Deals & Startup Tools",
    "keywords": post.tags?.join(", ") || "saas deals, software discounts, indie hackers, startup tools",
    "wordCount": post.content?.length || 1000,
    "inLanguage": "en-US"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://indiesaasdeals.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://indiesaasdeals.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://indiesaasdeals.com/blog/${post.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  );
}