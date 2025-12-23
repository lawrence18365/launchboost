'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  // Track page views on route changes
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return
    
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href
      })
      
      console.log('GA4 page view tracked:', url)
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID])
  
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not found')
    return null
  }
  
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href
          });
          console.log('GA4 initialized with ID: ${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}

// Helper functions for tracking
declare global {
  interface Window {
    gtag: any;
  }
}

/**
 * Tracks a custom event in GA4.
 * Common events: 'sign_up_newsletter', 'view_item', 'purchase', 'generate_lead'
 */
export const trackGoogleEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

export const trackGooglePurchase = (transactionId: string, value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency
    })
  }
}