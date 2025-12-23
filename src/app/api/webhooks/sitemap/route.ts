import { NextRequest, NextResponse } from 'next/server'
import { triggerSitemapUpdate, logSitemapUpdate, pingSearchEngines } from '@/lib/sitemap-utils'

// Webhook secret for security (you should set this in your environment)
const WEBHOOK_SECRET = process.env.SITEMAP_WEBHOOK_SECRET || 'your-secure-webhook-secret'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const providedSecret = authHeader?.replace('Bearer ', '')
    
    if (providedSecret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event, dealId, dealSlug, trigger } = body

    console.log(`Sitemap webhook received: ${event} for deal ${dealSlug || dealId}`)

    // Handle different events
    switch (event) {
      case 'deal.approved':
      case 'deal.live':
        await triggerSitemapUpdate()
        logSitemapUpdate('deal_approved')
        console.log(`Sitemap updated for approved deal: ${dealSlug}`)
        break
        
      case 'deal.updated':
        await triggerSitemapUpdate()
        logSitemapUpdate('deal_updated')
        console.log(`Sitemap updated for modified deal: ${dealSlug}`)
        break
        
      case 'manual.refresh':
        await triggerSitemapUpdate()
        logSitemapUpdate('manual')
        console.log(`Manual sitemap refresh triggered`)
        break
        
      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap updated successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sitemap webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET endpoint for manual sitemap regeneration (for admin panel)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const secret = url.searchParams.get('secret')
    
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await triggerSitemapUpdate()
    await pingSearchEngines()
    logSitemapUpdate('manual')

    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap manually regenerated and search engines notified',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Manual sitemap refresh error:', error)
    return NextResponse.json({ 
      error: 'Failed to refresh sitemap' 
    }, { status: 500 })
  }
}
