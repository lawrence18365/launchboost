import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Get all active deals
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, slug, product_name, product_website, short_description')
      .eq('status', 'live')

    if (dealsError) {
      console.error('Error fetching deals:', dealsError)
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      )
    }

    const results = {
      created: 0,
      existing: 0,
      errors: []
    }

    for (const deal of deals) {
      try {
        // Check if deal link already exists
        const { data: existingLink } = await supabase
          .from('deal_links')
          .select('id')
          .eq('deal_id', deal.id)
          .single()

        if (existingLink) {
          results.existing++
          continue
        }

        // Create new deal link
        const slug = deal.slug || sanitizeSlug(deal.product_name) || deal.id
        const targetUrl = deal.product_website || '#'

        const { error: insertError } = await supabase
          .from('deal_links')
          .insert({
            deal_id: deal.id,
            slug,
            target_url: targetUrl,
            title: deal.product_name,
            description: deal.short_description,
            is_active: true
          })

        if (insertError) {
          results.errors.push(`Failed to create link for ${deal.product_name}: ${insertError.message}`)
        } else {
          results.created++
        }

      } catch (error) {
        results.errors.push(`Error processing deal ${deal.product_name}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${results.created} created, ${results.existing} existing`,
      results
    })

  } catch (error) {
    console.error('Error in sync deal links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get stats on current deal links
    const { data: linkStats, error: statsError } = await supabase
      .from('deal_links')
      .select('*')

    const { data: dealsCount, error: dealsError } = await supabase
      .from('deals')
      .select('id', { count: 'exact' })
      .eq('status', 'live')

    if (statsError || dealsError) {
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      stats: {
        total_deal_links: linkStats?.length || 0,
        total_live_deals: dealsCount?.length || 0,
        active_links: linkStats?.filter(link => link.is_active).length || 0,
        deal_links: linkStats
      }
    })

  } catch (error) {
    console.error('Error getting deal links stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function sanitizeSlug(name: string): string {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with dashes
    .replace(/-+/g, '-')          // Replace multiple dashes with single
    .replace(/^-|-$/g, '')        // Remove leading/trailing dashes
}