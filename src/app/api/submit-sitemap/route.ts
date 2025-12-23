import { NextRequest, NextResponse } from 'next/server'

// Manual sitemap submission helper
export async function POST(request: NextRequest) {
  try {
    const sitemapUrl = 'https://indiesaasdeals.com/api/sitemap'
    
    // For manual testing - you'll need to submit manually to GSC
    console.log('Sitemap URL to submit to Google Search Console:', sitemapUrl)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap ready for submission',
      sitemapUrl,
      instructions: [
        '1. Go to Google Search Console',
        '2. Navigate to Sitemaps in the left sidebar',
        '3. Enter: api/sitemap',
        '4. Click Submit'
      ]
    })
    
  } catch (error) {
    console.error('Sitemap submission helper error:', error)
    return NextResponse.json({ error: 'Failed to prepare sitemap submission' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    sitemap: 'https://indiesaasdeals.com/api/sitemap',
    instructions: 'Use POST to get submission instructions'
  })
}