'use client'

import { claimDealAction } from '../../app/(main)/deals/actions'
import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { trackFacebookEvent } from '@/components/analytics/FacebookPixel'

interface DealClaimButtonProps {
  dealCodeId: string;
  user: User | null;
  dealTitle?: string;
  dealSlug?: string;
  dealPrice?: number;
}

export function DealClaimButton({ dealCodeId, user, dealTitle, dealSlug, dealPrice }: DealClaimButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClaim = async () => {
    if (!user) {
      // Track sign-in prompt
      trackFacebookEvent('InitiateCheckout', {
        content_name: dealTitle || 'Deal',
        content_type: 'deal',
        value: dealPrice,
        currency: 'USD'
      })
      
      // Redirect to sign in with return URL
      router.push('/sign-in?returnUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setError(null)
    
    // Track deal claim attempt
    trackFacebookEvent('InitiateCheckout', {
      content_name: dealTitle || 'Deal',
      content_type: 'deal',
      content_ids: dealSlug ? [dealSlug] : [],
      value: dealPrice,
      currency: 'USD'
    })
    
    startTransition(async () => {
      const result = await claimDealAction(dealCodeId)
      if (result?.error) {
        setError(result.error)
        
        // Track failed claim
        trackFacebookEvent('AddPaymentInfo', {
          content_name: dealTitle || 'Deal',
          content_type: 'deal',
          success: false
        })
      } else {
        alert(`Deal code claimed successfully! Check your email for details.`)
        
        // Track successful claim (conversion)
        trackFacebookEvent('Purchase', {
          content_name: dealTitle || 'Deal',
          content_type: 'deal',
          content_ids: dealSlug ? [dealSlug] : [],
          value: dealPrice || 0,
          currency: 'USD'
        })
        
        // The page will automatically show the updated data because of revalidatePath.
      }
    })
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <Button onClick={handleClaim} className="w-full" size="lg">
          Sign In to Claim Deal
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Join IndieSaasDeals to claim exclusive deals
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClaim} disabled={isPending} className="w-full" size="lg">
        {isPending ? 'Claiming...' : 'Claim Deal'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}