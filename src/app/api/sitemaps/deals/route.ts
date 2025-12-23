import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() {
            return undefined
          },
        },
      }
    )
    
    // Fetch all live deals with their update dates
    const { data: deals, error } = await supabase
      .from('deals')
      .select('slug, updated_at, created_at')
      .eq('status', 'live')
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching deals for sitemap:', error)
      return new NextResponse('Error fetching deals', { status: 500 })
    }

    // Generate XML sitemap for deals
    const baseUrl = 'https://indiesaasdeals.com'
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${deals?.map(deal => `  <url>
    <loc>${baseUrl}/deals/${deal.slug}</loc>
    <lastmod>${new Date(deal.updated_at || deal.created_at).toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n') || ''}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
    
  } catch (error) {
    console.error('Error generating deals sitemap:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}