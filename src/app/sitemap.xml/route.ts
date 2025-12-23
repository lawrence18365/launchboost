import { NextRequest } from 'next/server'

// Redirect sitemap.xml to our API sitemap route
export async function GET(request: NextRequest) {
  const response = await fetch(`${request.nextUrl.origin}/api/sitemap`)
  const sitemapContent = await response.text()
  
  return new Response(sitemapContent, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}