import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'resubmit-sitemap') {
      // Get all deal URLs for manual submission
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient(cookieStore)
      
      const { data: deals, error } = await supabase
        .from('deals')
        .select('slug, product_name')
        .eq('status', 'live')
        .not('slug', 'is', null)
      
      if (error) {
        throw error
      }
      
      const dealUrls = deals?.map(deal => 
        `https://indiesaasdeals.com/deals/${deal.slug}`
      ) || []
      
      return NextResponse.json({
        success: true,
        message: `Found ${dealUrls.length} deal pages to submit`,
        urls: dealUrls,
        instructions: [
          "1. Go to Google Search Console",
          "2. Use URL Inspection tool",
          "3. Submit each URL individually",
          "4. Request indexing for priority pages"
        ]
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Force indexing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}