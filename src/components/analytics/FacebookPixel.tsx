'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function FacebookPixel() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
    if (!pixelId) {
      console.warn('Facebook Pixel ID not found in environment variables')
      return
    }
    
    // Prevent duplicate initialization (handles StrictMode + GTM scenarios)
    if (window.fbq && window.fbq.loaded) {
      // Already initialized elsewhere; just track a page view once
      try { window.fbq('track', 'PageView') } catch {}
      return
    }

    // If a previous script tag exists, do not inject another
    const existingScript = document.querySelector('script[src*="connect.facebook.net/en_US/fbevents.js"]')
    if (existingScript && window.fbq) {
      try { window.fbq('track', 'PageView') } catch {}
      return
    }
    
    // Facebook Pixel Code
    ;(function(f: any, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    
    // Initialize with proper error handling
    try {
      window.fbq('init', pixelId)
      // Track one pageview on load; subsequent navigations should be handled by hooks/routers
      window.fbq('track', 'PageView')
      console.log('Facebook Pixel initialized successfully:', pixelId)
    } catch (error) {
      console.error('Facebook Pixel initialization error:', error)
    }
  }, [])
  
  // Avoid rendering noscript beacon in client environment to prevent unwanted preloads
  return null
}

// Helper functions for tracking events with proper validation
export const trackFacebookEvent = (event: string, data?: any) => {
  if (!event || typeof event !== 'string') {
    console.error('Facebook Pixel: Invalid event name provided')
    return
  }
  
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', event, data || {})
      console.log(`Facebook Pixel: ${event} event tracked`, data)
    } catch (error) {
      console.error(`Facebook Pixel: Error tracking ${event} event:`, error)
    }
  } else {
    console.warn('Facebook Pixel: fbq not available, event not tracked:', event)
  }
}

export const trackFacebookPurchase = (value: number, currency: string = 'USD') => {
  if (!value || value <= 0) {
    console.error('Facebook Pixel: Invalid purchase value')
    return
  }
  trackFacebookEvent('Purchase', { value, currency })
}

export const trackFacebookLead = (content_name?: string) => {
  trackFacebookEvent('Lead', content_name ? { content_name } : {})
}

// Additional standard events with validation
export const trackFacebookAddToCart = (content_name: string, value?: number, currency: string = 'USD') => {
  if (!content_name) {
    console.error('Facebook Pixel: content_name required for AddToCart event')
    return
  }
  trackFacebookEvent('AddToCart', { content_name, value, currency })
}

export const trackFacebookInitiateCheckout = (value?: number, currency: string = 'USD') => {
  trackFacebookEvent('InitiateCheckout', { value, currency })
}

export const trackFacebookCompleteRegistration = (content_name?: string) => {
  trackFacebookEvent('CompleteRegistration', content_name ? { content_name } : {})
}

export const trackFacebookViewContent = (content_name: string, content_type?: string) => {
  if (!content_name) {
    console.error('Facebook Pixel: content_name required for ViewContent event')
    return
  }
  trackFacebookEvent('ViewContent', { content_name, content_type })
}
