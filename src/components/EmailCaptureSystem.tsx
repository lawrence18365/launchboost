"use client"

import { BirdDogEmailModal } from '@/components/modals/EmailCaptureModal'
import { SpinWheel } from '@/components/SpinWheel'
import { SimpleStreak } from '@/components/SimpleStreak'
import { useSpinWheel } from '@/hooks/useSpinWheel'
import { useState, useEffect } from 'react'

export function EmailCaptureSystem() {
  const { showWheel, closeWheel } = useSpinWheel()
  const [showOriginalModal, setShowOriginalModal] = useState(false)
  
  // Disable original modal if wheel is preferred
  useEffect(() => {
    // You can add logic here to A/B test between wheel and original modal
    // For now, let's prioritize the wheel
    const hasSubscribed = localStorage.getItem("indiesaasdeals-email-submitted")
    const hasSeenWheel = localStorage.getItem("indiesaasdeals-wheel-seen")
    
    // If they haven't seen wheel and haven't subscribed, show wheel
    // Otherwise, fall back to original modal logic
    if (!hasSubscribed && !hasSeenWheel) {
      // Wheel will handle its own showing logic
      setShowOriginalModal(false)
    }
  }, [])

  return (
    <>
      {/* Simple streak counter */}
      <SimpleStreak />
      
      {/* Spin wheel (prioritized) */}
      <SpinWheel open={showWheel} onOpenChange={closeWheel} />
      
      {/* Original modal (fallback) */}
      {/* <BirdDogEmailModal /> */}
    </>
  )
}