import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({
        user: null,
        profile: null,
        error: 'Not authenticated'
      })
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({
        user,
        profile: null,
        error: 'Profile not found'
      })
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      profile,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}