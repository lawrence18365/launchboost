import { NextResponse } from 'next/server'

export function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Important pages
Allow: /deals/
Allow: /about/
Allow: /contact/
Allow: /advertise/
Allow: /feedback/
Allow: /blog/
Allow: /categories/

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /sign-in/

# Sitemaps
Sitemap: https://indiesaasdeals.com/api/sitemap

# Crawl delay
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}