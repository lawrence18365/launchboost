'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackFacebookEvent } from '@/components/analytics/FacebookPixel'

// Hook to track page views automatically
export function useFacebookPixelPageView() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view when route changes
    if (pathname) {
      trackFacebookEvent('PageView')
    }
  }, [pathname])
}

// Hook to track deal interactions
export function useFacebookPixelDeals() {
  const trackDealView = (dealSlug: string, dealTitle: string) => {
    trackFacebookEvent('ViewContent', {
      content_name: dealTitle,
      content_type: 'deal',
      content_ids: [dealSlug]
    })
  }

  const trackDealClaim = (dealSlug: string, dealTitle: string, dealPrice?: number) => {
    trackFacebookEvent('InitiateCheckout', {
      content_name: dealTitle,
      content_type: 'deal',
      content_ids: [dealSlug],
      value: dealPrice,
      currency: 'USD'
    })
  }

  const trackDealPurchase = (dealSlug: string, dealTitle: string, dealPrice: number) => {
    trackFacebookEvent('Purchase', {
      content_name: dealTitle,
      content_type: 'deal',
      content_ids: [dealSlug],
      value: dealPrice,
      currency: 'USD'
    })
  }

  return {
    trackDealView,
    trackDealClaim,
    trackDealPurchase
  }
}

// Hook to track user authentication events
export function useFacebookPixelAuth() {
  const trackSignUp = (method: string = 'email') => {
    trackFacebookEvent('CompleteRegistration', {
      content_name: 'User Registration',
      method
    })
  }

  const trackLogin = (method: string = 'email') => {
    trackFacebookEvent('Login', {
      content_name: 'User Login',
      method
    })
  }

  return {
    trackSignUp,
    trackLogin
  }
}