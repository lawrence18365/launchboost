import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

// Input validation and sanitization utilities
function sanitizeText(input: string, maxLength: number = 255): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, (match) => {
      const htmlEntities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return htmlEntities[match] || match
    })
    .trim()
    .substring(0, maxLength)
}

function validateTwitterHandle(handle: string): boolean {
  if (!handle) return true // Optional field
  
  // Twitter handle validation: 1-15 characters, alphanumeric + underscores only
  const twitterRegex = /^[a-zA-Z0-9_]{1,15}$/
  return twitterRegex.test(handle)
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse and validate request body
    const profileData = await request.json()
    
    // Sanitize and validate inputs
    const fullName = sanitizeText(profileData.full_name || '', 100)
    const companyName = sanitizeText(profileData.company_name || '', 100)
    const bio = sanitizeText(profileData.bio || '', 500)
    const twitterHandle = profileData.twitter_handle ? sanitizeText(profileData.twitter_handle, 15) : null
    
    // Validate Twitter handle format
    if (twitterHandle && !validateTwitterHandle(twitterHandle)) {
      return NextResponse.json({
        error: 'Invalid Twitter handle. Must be 1-15 characters, letters/numbers/underscores only.'
      }, { status: 400 })
    }

    // Update profile in database
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        company_name: companyName || null,
        bio: bio || null,
        twitter_handle: twitterHandle,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update profile', 
        details: updateError.message 
      }, { status: 500 })
    }
    
    // Log successful update
    console.log('Profile updated successfully:', {
      userId: user.id,
      email: user.email,
      hasTwitterHandle: !!twitterHandle,
      timestamp: new Date().toISOString()
    })

    // Return success with sanitized profile data
    const safeProfile = {
      id: profile.id,
      full_name: profile.full_name,
      company_name: profile.company_name,
      bio: profile.bio,
      twitter_handle: profile.twitter_handle,
      updated_at: profile.updated_at
    }
    
    return NextResponse.json({ 
      success: true, 
      profile: safeProfile,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}