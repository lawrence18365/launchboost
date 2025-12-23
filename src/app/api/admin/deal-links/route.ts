import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { deal_id, slug, target_url, title, description } = await req.json()

    // Validate required fields
    if (!slug || !target_url) {
      return NextResponse.json(
        { error: 'Slug and target_url are required' },
        { status: 400 }
      )
    }

    // Create deal link
    const { data, error } = await supabase
      .from('deal_links')
      .insert({
        deal_id: deal_id || null,
        slug,
        target_url,
        title: title || null,
        description: description || null,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating deal link:', error)
      return NextResponse.json(
        { error: 'Failed to create deal link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      deal_link: data 
    })

  } catch (error) {
    console.error('Error in deal links API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const dealId = url.searchParams.get('deal_id')

    let query = supabase
      .from('deal_links')
      .select(`
        *,
        deals!deal_links_deal_id_fkey (
          id,
          title,
          product_name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching deal links:', error)
      return NextResponse.json(
        { error: 'Failed to fetch deal links' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      deal_links: data 
    })

  } catch (error) {
    console.error('Error in deal links API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}