import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch user's deals
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user deals:', error)
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
    }

    return NextResponse.json({ 
      deals: deals || [],
      success: true 
    })

  } catch (error) {
    console.error('Error in user deals endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}