import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const url = new URL(req.url)

  try {
    // Look up destination
    const { data, error } = await supabase
      .from('deal_links')
      .select('target_url, deal_id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.error('Deal link not found:', slug, error)
      return NextResponse.redirect('https://indiesaasdeals.com', 302)
    }

    const target = new URL(data.target_url)

    // Carry through incoming UTM params (src/med/camp/content aliases allowed)
    const utm_source = url.searchParams.get('src') || url.searchParams.get('utm_source') || 'indiesaasdeals'
    const utm_medium = url.searchParams.get('med') || url.searchParams.get('utm_medium') || 'referral'
    const utm_campaign = url.searchParams.get('camp') || url.searchParams.get('utm_campaign') || 'deal'
    const utm_content = url.searchParams.get('cont') || url.searchParams.get('utm_content') || ''

    // Add UTM parameters to target URL
    target.searchParams.set('utm_source', utm_source)
    target.searchParams.set('utm_medium', utm_medium)
    target.searchParams.set('utm_campaign', utm_campaign)
    if (utm_content) target.searchParams.set('utm_content', utm_content)

    // Hash IP for privacy compliance
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.ip || ''
    const ip_hash = ip ? crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'salt').digest('hex') : ''

    // Extract device/browser info from user agent
    const user_agent = req.headers.get('user-agent') || ''
    const device_type = getDeviceType(user_agent)
    const browser = getBrowser(user_agent)

    // Geo data (best-effort via headers)
    const country = req.headers.get('x-vercel-ip-country') || 
                   req.headers.get('cf-ipcountry') || ''
    const city = req.headers.get('x-vercel-ip-city') || ''

    // Persist click event (fire-and-forget for performance)
    supabase.from('deal_clicks').insert({
      slug,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content: utm_content || null,
      referer: req.headers.get('referer') || null,
      user_agent,
      ip_hash: ip_hash || null,
      country: country || null,
      city: city || null,
      device_type,
      browser
    }).then(() => {
      // Update deal clicks count if deal_id exists
      if (data.deal_id) {
        supabase.from('deals')
          .update({ 
            clicks_count: supabase.rpc('increment_clicks', { deal_id: data.deal_id })
          })
          .eq('id', data.deal_id)
          .then(() => {})
          .catch(() => {})
      }
    }).catch((error) => {
      console.error('Failed to log click:', error)
    })

    // Redirect to target with UTM parameters
    return NextResponse.redirect(target.toString(), 302)

  } catch (error) {
    console.error('Error in /go redirect:', error)
    return NextResponse.redirect('https://indiesaasdeals.com', 302)
  }
}

function getDeviceType(userAgent: string): string | null {
  if (!userAgent) return null
  
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

function getBrowser(userAgent: string): string | null {
  if (!userAgent) return null
  
  const ua = userAgent.toLowerCase()
  if (ua.includes('chrome') && !ua.includes('edge')) {
    return 'chrome'
  } else if (ua.includes('firefox')) {
    return 'firefox'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'safari'
  } else if (ua.includes('edge')) {
    return 'edge'
  } else if (ua.includes('opera')) {
    return 'opera'
  } else {
    return 'other'
  }
}