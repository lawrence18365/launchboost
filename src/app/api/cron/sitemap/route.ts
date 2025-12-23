import { NextRequest, NextResponse } from 'next/server'
import { triggerSitemapUpdate, logSitemapUpdate } from '@/lib/sitemap-utils'

// This endpoint can be called by a cron service (like Vercel Cron, GitHub Actions, etc.)
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Scheduled sitemap update starting...')

    // Trigger sitemap regeneration
    await triggerSitemapUpdate()
    logSitemapUpdate('manual')

    console.log('Scheduled sitemap update completed')

    return NextResponse.json({
      success: true,
      message: 'Sitemap updated via cron job',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron sitemap update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update sitemap',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST method for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
