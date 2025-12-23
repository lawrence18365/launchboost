import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getOrCreateDealLink(deal: any): Promise<string> {
  try {
    // First check if deal link already exists
    const { data: existingLink } = await supabase
      .from('deal_links')
      .select('slug')
      .eq('deal_id', deal.id)
      .eq('is_active', true)
      .single()

    if (existingLink) {
      return `/go/${existingLink.slug}`
    }

    // Create new deal link using deal slug or product name
    const slug = deal.slug || deal.product_name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || deal.id
    const targetUrl = deal.product_website || '#'

    const { data: newLink, error } = await supabase
      .from('deal_links')
      .insert({
        deal_id: deal.id,
        slug,
        target_url: targetUrl,
        title: deal.product_name,
        description: deal.short_description,
        is_active: true
      })
      .select('slug')
      .single()

    if (error) {
      console.error('Error creating deal link:', error)
      // Fallback to direct link
      return deal.product_website || '#'
    }

    return `/go/${newLink.slug}`

  } catch (error) {
    console.error('Error in getOrCreateDealLink:', error)
    // Fallback to direct link
    return deal.product_website || '#'
  }
}

export async function getDealClickStats(slug: string, days: number = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('deal_clicks')
      .select('*')
      .eq('slug', slug)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching click stats:', error)
      return null
    }

    return {
      total_clicks: data.length,
      clicks_by_day: groupClicksByDay(data),
      top_sources: getTopSources(data),
      top_countries: getTopCountries(data),
      device_breakdown: getDeviceBreakdown(data)
    }

  } catch (error) {
    console.error('Error in getDealClickStats:', error)
    return null
  }
}

function groupClicksByDay(clicks: any[]) {
  const grouped: { [key: string]: number } = {}
  
  clicks.forEach(click => {
    const date = new Date(click.created_at).toISOString().split('T')[0]
    grouped[date] = (grouped[date] || 0) + 1
  })

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function getTopSources(clicks: any[]) {
  const sources: { [key: string]: number } = {}
  
  clicks.forEach(click => {
    const source = click.utm_source || 'direct'
    sources[source] = (sources[source] || 0) + 1
  })

  return Object.entries(sources)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function getTopCountries(clicks: any[]) {
  const countries: { [key: string]: number } = {}
  
  clicks.forEach(click => {
    if (click.country) {
      countries[click.country] = (countries[click.country] || 0) + 1
    }
  })

  return Object.entries(countries)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function getDeviceBreakdown(clicks: any[]) {
  const devices: { [key: string]: number } = {}
  
  clicks.forEach(click => {
    const device = click.device_type || 'unknown'
    devices[device] = (devices[device] || 0) + 1
  })

  return Object.entries(devices)
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count)
}