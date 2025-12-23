import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = 'https://indiesaasdeals.com'
  const currentDate = new Date().toISOString().split('T')[0]

  // Static pages with their importance and update frequency
  const staticPages = [
    { path: '/', lastmod: currentDate },
    { path: '/deals', lastmod: currentDate },
    { path: '/categories', lastmod: currentDate },
    { path: '/categories/AI%20%26%20Machine%20Learning', lastmod: currentDate },
    { path: '/categories/Analytics%20%26%20Data', lastmod: currentDate },
    { path: '/categories/Business%20%26%20Finance', lastmod: currentDate },
    { path: '/categories/Communication%20%26%20Collaboration', lastmod: currentDate },
    { path: '/categories/Design%20%26%20Creative', lastmod: currentDate },
    { path: '/categories/Developer%20Tools', lastmod: currentDate },
    { path: '/categories/E-commerce%20%26%20Retail', lastmod: currentDate },
    { path: '/categories/Education%20%26%20Learning', lastmod: currentDate },
    { path: '/categories/Healthcare%20%26%20Wellness', lastmod: currentDate },
    { path: '/categories/HR%20%26%20Recruiting', lastmod: currentDate },
    { path: '/categories/Marketing%20%26%20Growth', lastmod: currentDate },
    { path: '/categories/Productivity%20%26%20Organization', lastmod: currentDate },
    { path: '/categories/Sales%20%26%20CRM', lastmod: currentDate },
    { path: '/categories/Security%20%26%20Privacy', lastmod: currentDate },
    { path: '/categories/Social%20%26%20Community', lastmod: currentDate },
    { path: '/advertise', lastmod: currentDate },
    { path: '/about', lastmod: currentDate },
    { path: '/contact', lastmod: currentDate },
    { path: '/feedback', lastmod: currentDate },
    { path: '/terms', lastmod: currentDate },
    { path: '/privacy', lastmod: currentDate },
  ]

  // Generate XML sitemap for static pages
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours (static pages change less frequently)
    },
  })
}