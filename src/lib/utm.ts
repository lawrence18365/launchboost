/**
 * Centralized UTM parameter management for tracking
 */

export interface UTMParams {
  source: string
  medium: string
  campaign: string
  content?: string
  term?: string
}

/**
 * Generate clean UTM parameters for external deal links
 */
export function generateUTM(params: UTMParams): string {
  const utm = new URLSearchParams()
  
  utm.set('utm_source', params.source)
  utm.set('utm_medium', params.medium)
  utm.set('utm_campaign', params.campaign)
  
  if (params.content) utm.set('utm_content', params.content)
  if (params.term) utm.set('utm_term', params.term)
  
  return utm.toString()
}

/**
 * Common UTM configurations for different sections
 */
export const UTM_CONFIGS = {
  // Deal cards
  dealCard: {
    source: 'indiesaasdeals',
    medium: 'deal-card',
    campaign: 'browse'
  },
  
  // Homepage sections
  featuredDeal: {
    source: 'indiesaasdeals', 
    medium: 'homepage',
    campaign: 'featured'
  },
  
  quickDeal: {
    source: 'indiesaasdeals',
    medium: 'homepage', 
    campaign: 'quick-deals'
  },
  
  urgentBar: {
    source: 'indiesaasdeals',
    medium: 'sticky-bar',
    campaign: 'urgent'
  },
  
  // Deal page
  dealPage: {
    source: 'indiesaasdeals',
    medium: 'deal-page',
    campaign: 'primary-cta'
  },
  
  dealPageSecondary: {
    source: 'indiesaasdeals',
    medium: 'deal-page', 
    campaign: 'secondary-cta'
  },
  
  // Social sharing
  socialShare: {
    source: 'indiesaasdeals',
    medium: 'social',
    campaign: 'share'
  }
}

/**
 * Build external deal URL with UTM tracking
 */
export function buildDealURL(productWebsite: string, utmConfig: UTMParams): string {
  if (!productWebsite) return '#'
  
  const url = new URL(productWebsite)
  const utmString = generateUTM(utmConfig)
  
  // Append UTM parameters
  const separator = url.search ? '&' : '?'
  return `${productWebsite}${separator}${utmString}`
}

/**
 * Get clean deal page URL (internal)
 */
export function getDealPageURL(slug: string): string {
  return `/deals/${slug}`
}

/**
 * Generate external deal link with proper tracking
 */
export function getExternalDealURL(productWebsite: string, location: keyof typeof UTM_CONFIGS): string {
  return buildDealURL(productWebsite, UTM_CONFIGS[location])
}