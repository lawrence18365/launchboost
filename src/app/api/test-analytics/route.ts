import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const ga_id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const fb_id = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
  
  return NextResponse.json({
    analytics_status: {
      google_analytics: {
        measurement_id: ga_id || 'NOT_SET',
        environment: process.env.NODE_ENV,
        app_url: process.env.NEXT_PUBLIC_APP_URL,
      },
      facebook_pixel: {
        pixel_id: fb_id || 'NOT_SET',
      },
      instructions: [
        '1. Deploy this to production',
        '2. Visit your live site (not localhost)', 
        '3. Check GA Real-Time reports in 15-30 minutes',
        '4. If still no data, check GA property settings for filters'
      ]
    }
  })
}