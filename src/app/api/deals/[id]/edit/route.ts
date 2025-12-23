import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { logSitemapUpdate } from '@/lib/sitemap-utils'

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

function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol) && 
           !urlObj.hostname.includes('localhost') &&
           !urlObj.hostname.includes('127.0.0.1') &&
           urlObj.hostname.length > 0
  } catch {
    return false
  }
}

function validatePrice(price: any): number | null {
  const numPrice = parseFloat(price)
  if (isNaN(numPrice) || numPrice < 0 || numPrice > 10000) {
    return null
  }
  return Math.round(numPrice * 100) // Convert to cents
}

function validateDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const maxFuture = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 year
  return !isNaN(date.getTime()) && date > now && date < maxFuture
}

function validateTags(tags: any): string[] {
  if (!Array.isArray(tags)) return []
  return tags
    .filter(tag => typeof tag === 'string')
    .map(tag => sanitizeText(tag, 50))
    .filter(tag => tag.length > 0)
    .slice(0, 10) // Max 10 tags
}

// GET: Fetch deal for editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params

    // Fetch deal - only return if user owns it
    const { data: deal, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .eq('founder_id', user.id)
      .single()

    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found or access denied' }, { status: 404 })
    }

    // Check if deal can be edited based on status
    const editableStatuses = ['draft', 'pending_review', 'rejected']
    if (!editableStatuses.includes(deal.status)) {
      return NextResponse.json({ 
        error: `Cannot edit deal with status: ${deal.status}. Only draft, pending review, or rejected deals can be edited.` 
      }, { status: 403 })
    }

    return NextResponse.json({ 
      deal: deal,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching deal for edit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params

    // First, verify the deal exists and user owns it
    const { data: existingDeal, error: fetchError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .eq('founder_id', user.id)
      .single()

    if (fetchError || !existingDeal) {
      return NextResponse.json({ error: 'Deal not found or access denied' }, { status: 404 })
    }

    // Check if deal can be edited based on status
    const editableStatuses = ['draft', 'pending_review', 'rejected']
    if (!editableStatuses.includes(existingDeal.status)) {
      return NextResponse.json({ 
        error: `Cannot edit deal with status: ${existingDeal.status}. Only draft, pending review, or rejected deals can be edited.` 
      }, { status: 403 })
    }
    
    // Parse and validate request body
    const dealData = await request.json()
    
    // Validate required fields with type checking
    const requiredFields = {
      productName: 'string',
      productWebsite: 'string', 
      title: 'string',
      description: 'string',
      shortDescription: 'string',
      category: 'string',
      originalPrice: 'number',
      dealPrice: 'number',
      expiresAt: 'string'
    }
    
    for (const [field, expectedType] of Object.entries(requiredFields)) {
      if (dealData[field] === undefined || dealData[field] === null) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
      
      if (expectedType === 'string' && typeof dealData[field] !== 'string') {
        return NextResponse.json({ 
          error: `Field ${field} must be a string` 
        }, { status: 400 })
      }
      
      if (expectedType === 'number' && (typeof dealData[field] !== 'number' && isNaN(Number(dealData[field])))) {
        return NextResponse.json({ 
          error: `Field ${field} must be a valid number` 
        }, { status: 400 })
      }
    }

    // Sanitize and validate all inputs
    const productName = sanitizeText(dealData.productName, 100)
    const title = sanitizeText(dealData.title, 200)
    const description = sanitizeText(dealData.description, 5000)
    const shortDescription = sanitizeText(dealData.shortDescription, 500)
    const redemptionInstructions = dealData.redemptionInstructions ? sanitizeText(dealData.redemptionInstructions, 1000) : null
    
    if (!productName || !title || !description || !shortDescription) {
      return NextResponse.json({
        error: 'Product name, title, description, and short description cannot be empty'
      }, { status: 400 })
    }

    // Validate URLs
    if (!validateURL(dealData.productWebsite)) {
      return NextResponse.json({
        error: 'Invalid product website URL'
      }, { status: 400 })
    }

    if (dealData.iconUrl && !validateURL(dealData.iconUrl)) {
      return NextResponse.json({
        error: 'Invalid icon URL'
      }, { status: 400 })
    }

    // Validate pricing
    const originalPrice = validatePrice(dealData.originalPrice)
    const dealPrice = validatePrice(dealData.dealPrice)
    
    if (originalPrice === null || dealPrice === null) {
      return NextResponse.json({
        error: 'Invalid pricing. Prices must be between $0 and $10,000'
      }, { status: 400 })
    }

    if (dealPrice >= originalPrice) {
      return NextResponse.json({
        error: 'Deal price must be less than original price'
      }, { status: 400 })
    }

    // Validate and sanitize tags
    const tags = validateTags(dealData.tags)

    // Validate expiration date
    if (!validateDate(dealData.expiresAt)) {
      return NextResponse.json({
        error: 'Invalid expiration date. Must be a future date within 1 year'
      }, { status: 400 })
    }
    
    // Validate category is in the allowed enum list
    const allowedCategories = [
      "AI & Machine Learning", "Analytics & Data", "Business & Finance", 
      "Communication & Collaboration", "Design & Creative", "Developer Tools",
      "E-commerce & Retail", "Education & Learning", "Healthcare & Wellness",
      "HR & Recruiting", "Marketing & Growth", "Productivity & Organization",
      "Sales & CRM", "Security & Privacy", "Social & Community"
    ]
    
    if (!allowedCategories.includes(dealData.category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${allowedCategories.join(', ')}` }, { status: 400 })
    }
    
    // Calculate discount percentage (prices already converted to cents above)
    const discountPercentage = Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
    
    // Validate discount is reasonable
    if (discountPercentage < 10) {
      return NextResponse.json({
        error: 'Discount must be at least 10%'
      }, { status: 400 })
    }

    // Generate new slug if title changed
    let slug = existingDeal.slug
    if (dealData.title !== existingDeal.title) {
      const generateSlug = (text: string): string => {
        return text
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      }
      
      slug = generateSlug(title) + '-' + Date.now() // Add timestamp for uniqueness
      
      // Check for duplicate slugs
      const { data: existingSlugDeal } = await supabase
        .from('deals')
        .select('id')
        .eq('slug', slug)
        .neq('id', id) // Exclude current deal
        .single()
      
      if (existingSlugDeal) {
        slug = slug + '-' + Math.random().toString(36).substr(2, 6) // Add random suffix
      }
    }

    // Determine new status - if deal was rejected, move back to pending_review
    let newStatus = existingDeal.status
    if (existingDeal.status === 'rejected') {
      newStatus = 'pending_review'
    }
    
    // Update deal in database with sanitized data
    const { data: deal, error: updateError } = await supabase
      .from('deals')
      .update({
        product_name: productName,
        product_website: dealData.productWebsite,
        title: title,
        slug: slug,
        description: description,
        short_description: shortDescription,
        category: dealData.category,
        original_price: originalPrice,
        deal_price: dealPrice,
        discount_percentage: discountPercentage,
        expires_at: dealData.expiresAt,
        tags: tags,
        product_logo_url: dealData.iconUrl || null,
        redemption_instructions: redemptionInstructions,
        status: newStatus,
        rejection_reason: newStatus === 'pending_review' ? null : existingDeal.rejection_reason, // Clear rejection reason if resubmitting
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('founder_id', user.id) // Double check ownership
      .select()
      .single()
    
    if (updateError) {
      console.error('Deal update error:', updateError)
      return NextResponse.json({ error: 'Failed to update deal', details: updateError.message }, { status: 500 })
    }
    
    // Log successful update
    console.log('Deal updated successfully:', {
      dealId: deal.id,
      userId: user.id,
      productName: productName,
      previousStatus: existingDeal.status,
      newStatus: newStatus,
      timestamp: new Date().toISOString()
    })

    // Log for sitemap update if needed
    if (newStatus === 'live' || (existingDeal.status === 'live' && newStatus === 'live')) {
      logSitemapUpdate('deal_updated')
    }

    // Return success with sanitized deal data
    const safeDeal = {
      id: deal.id,
      slug: deal.slug,
      title: deal.title,
      status: deal.status,
      updated_at: deal.updated_at
    }
    
    return NextResponse.json({ 
      success: true, 
      deal: safeDeal,
      message: 'Deal updated successfully'
    })
    
  } catch (error) {
    console.error('Deal update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}