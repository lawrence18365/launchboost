import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { getPublishedPosts } from '@/lib/blog'

// Static pages that should always be in the sitemap
const STATIC_PAGES = [
  { url: '', priority: '1.0', changefreq: 'daily' }, // Homepage
  { url: 'deals', priority: '0.9', changefreq: 'daily' },
  { url: 'categories', priority: '0.8', changefreq: 'weekly' },
  { url: 'categories/productivity', priority: '0.7', changefreq: 'weekly' },
  { url: 'categories/marketing', priority: '0.7', changefreq: 'weekly' },
  { url: 'categories/design', priority: '0.7', changefreq: 'weekly' },
  { url: 'categories/development', priority: '0.7', changefreq: 'weekly' },
  { url: 'categories/business', priority: '0.7', changefreq: 'weekly' },
  { url: 'categories/analytics', priority: '0.7', changefreq: 'weekly' },
  { url: 'categories/finance', priority: '0.7', changefreq: 'weekly' },
  { url: 'categories/ai', priority: '0.7', changefreq: 'weekly' },
  { url: 'advertise', priority: '0.6', changefreq: 'monthly' },
  { url: 'advertise/purchase', priority: '0.5', changefreq: 'monthly' },
  { url: 'about', priority: '0.6', changefreq: 'monthly' },
  { url: 'contact', priority: '0.5', changefreq: 'monthly' },
  { url: 'feedback', priority: '0.4', changefreq: 'weekly' },
  { url: 'sign-in', priority: '0.3', changefreq: 'monthly' },
  { url: 'terms', priority: '0.3', changefreq: 'yearly' },
  { url: 'privacy', priority: '0.3', changefreq: 'yearly' },
  { url: 'blog', priority: '0.6', changefreq: 'weekly' },
]

export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://indiesaasdeals.com'
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    // Get all live deals with slugs
    const { data: deals, error } = await supabase
      .from('deals')
      .select('slug, updated_at, created_at')
      .eq('status', 'live')
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching deals for sitemap:', error)
    }

    // Build XML sitemap
    const currentDate = new Date().toISOString().split('T')[0]
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`

    // Add static pages
    for (const page of STATIC_PAGES) {
      sitemap += `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add dynamic deal pages
    if (deals && deals.length > 0) {
      sitemap += `
  <!-- Deal Pages -->
`
      for (const deal of deals) {
        const lastmod = deal.updated_at ? 
          new Date(deal.updated_at).toISOString().split('T')[0] : 
          new Date(deal.created_at).toISOString().split('T')[0]
        
        sitemap += `  <url>
    <loc>${baseUrl}/deals/${deal.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
      }
    }

    // Add blog posts
    try {
      const blogPosts = await getPublishedPosts()
      if (blogPosts && blogPosts.length > 0) {
        sitemap += `
  <!-- Blog Posts -->
`
        for (const post of blogPosts) {
          const lastmod = post.published_at ? 
            new Date(post.published_at).toISOString().split('T')[0] : 
            currentDate
          
          sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
        }
      }
    } catch (blogError) {
      console.error('Error fetching blog posts for sitemap:', blogError)
    }

    sitemap += '</urlset>'

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Sitemap generation error:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'regenerate') {
      // Trigger sitemap regeneration and ping search engines
      await regenerateAndPingSearchEngines()
      return NextResponse.json({ success: true, message: 'Sitemap regenerated and search engines notified' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Sitemap POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

// Function to regenerate sitemap and ping search engines
async function regenerateAndPingSearchEngines() {
  const sitemapUrl = 'https://indiesaasdeals.com/sitemap.xml'
  
  // Ping Google
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
    console.log('Successfully pinged Google for sitemap update')
  } catch (error) {
    console.error('Failed to ping Google:', error)
  }
  
  // Ping Bing
  try {
    await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
    console.log('Successfully pinged Bing for sitemap update')
  } catch (error) {
    console.error('Failed to ping Bing:', error)
  }
}