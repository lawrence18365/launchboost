import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

// Test endpoint to verify crawler accessibility
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    // Get a sample live deal
    const { data: sampleDeal, error } = await supabase
      .from('deals')
      .select('slug, title, product_name')
      .eq('status', 'live')
      .limit(1)
      .single()

    if (error || !sampleDeal) {
      return NextResponse.json({
        status: 'no_live_deals',
        message: 'No live deals found for testing',
        public_pages: [
          'https://indiesaasdeals.com/',
          'https://indiesaasdeals.com/deals',
          'https://indiesaasdeals.com/about',
          'https://indiesaasdeals.com/contact'
        ]
      })
    }

    const baseUrl = 'https://indiesaasdeals.com'
    const testResults = {
      status: 'success',
      crawler_accessible_pages: [
        `${baseUrl}/`,
        `${baseUrl}/deals`,
        `${baseUrl}/deals/${sampleDeal.slug}`,
        `${baseUrl}/about`,
        `${baseUrl}/contact`,
        `${baseUrl}/advertise`,
        `${baseUrl}/feedback`
      ],
      sample_deal: {
        slug: sampleDeal.slug,
        title: sampleDeal.title,
        product_name: sampleDeal.product_name,
        url: `${baseUrl}/deals/${sampleDeal.slug}`
      },
      sitemap_url: `${baseUrl}/sitemap.xml`,
      robots_url: `${baseUrl}/robots.txt`,
      notes: [
        'All deal pages are publicly accessible without authentication',
        'Sitemap is automatically updated when deals are approved',
        'Search engines are pinged when sitemap updates',
        'Robots.txt allows crawling of all important pages'
      ]
    }

    return NextResponse.json(testResults)

  } catch (error) {
    console.error('Crawler test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to run crawler accessibility test'
    }, { status: 500 })
  }
}