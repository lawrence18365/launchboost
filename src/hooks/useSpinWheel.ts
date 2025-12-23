"use client"

import { useState, useEffect } from 'react'

export function useSpinWheel() {
  const [showWheel, setShowWheel] = useState(false)
  const [visitCount, setVisitCount] = useState(0)

  useEffect(() => {
    // Check if user has already seen wheel or subscribed locally
    const hasSeenWheel = localStorage.getItem("indiesaasdeals-wheel-seen")
    const hasSubscribed = localStorage.getItem("indiesaasdeals-email-submitted")
    
    if (hasSeenWheel || hasSubscribed) {
      return // Don't show wheel
    }

    // Also check server-side eligibility
    checkServerEligibility()
  }, [])

  const checkServerEligibility = async () => {
    try {
      const response = await fetch('/api/spin-wheel/check')
      const data = await response.json()
      
      if (response.ok && data.hasSpun) {
        // User has already spun, don't show wheel
        localStorage.setItem("indiesaasdeals-wheel-seen", "true")
        return
      }
    } catch (error) {
      console.error('Error checking server eligibility:', error)
    }

    // If we get here, proceed with local visit tracking
    trackVisitAndShow()
  }

  const trackVisitAndShow = () => {
    // Track visit count
    const today = new Date().toDateString()
    const storedVisits = localStorage.getItem("indiesaasdeals-visit-count")
    const storedLastVisit = localStorage.getItem("indiesaasdeals-last-visit-date")
    
    let newVisitCount = 1
    
    if (storedVisits && storedLastVisit !== today) {
      newVisitCount = parseInt(storedVisits) + 1
    } else if (storedVisits && storedLastVisit === today) {
      newVisitCount = parseInt(storedVisits)
    }
    
    localStorage.setItem("indiesaasdeals-visit-count", newVisitCount.toString())
    localStorage.setItem("indiesaasdeals-last-visit-date", today)
    setVisitCount(newVisitCount)

    // Show wheel based on visit count and engagement (less annoying timing)
    const shouldShowWheel = () => {
      // Show on 3rd visit or later (give users more time)
      if (newVisitCount >= 3) return true
      
      // Or show after 60 seconds on 2nd visit (double the time)
      if (newVisitCount === 2) {
        setTimeout(() => {
          // Check again if they haven't subscribed in the meantime
          const hasSubscribedNow = localStorage.getItem("indiesaasdeals-email-submitted")
          const hasSeenWheelNow = localStorage.getItem("indiesaasdeals-wheel-seen")
          
          if (!hasSubscribedNow && !hasSeenWheelNow) {
            setShowWheel(true)
          }
        }, 60000) // 60 seconds (1 minute)
        return false
      }
      
      // Never show on first visit - let them explore first
      return false
    }

    if (shouldShowWheel()) {
      // Longer delay to let page fully load and user engage
      setTimeout(() => setShowWheel(true), 5000) // 5 seconds instead of 2
    }
  }

  const closeWheel = () => {
    setShowWheel(false)
    localStorage.setItem("indiesaasdeals-wheel-seen", "true")
  }

  const forceShowWheel = () => {
    setShowWheel(true)
  }

  // Add exit intent detection for a less annoying experience
  useEffect(() => {
    let exitIntentShown = false
    
    const handleExitIntent = (e: MouseEvent) => {
      // Check if mouse is leaving the viewport from the top
      if (e.clientY <= 0 && !exitIntentShown) {
        const hasSeenWheel = localStorage.getItem("indiesaasdeals-wheel-seen")
        const hasSubscribed = localStorage.getItem("indiesaasdeals-email-submitted")
        
        if (!hasSeenWheel && !hasSubscribed && visitCount >= 1) {
          exitIntentShown = true
          setShowWheel(true)
        }
      }
    }

    // Only add exit intent detection after user has been on page for at least 30 seconds
    const exitIntentTimer = setTimeout(() => {
      document.addEventListener('mouseleave', handleExitIntent)
    }, 30000)

    return () => {
      clearTimeout(exitIntentTimer)
      document.removeEventListener('mouseleave', handleExitIntent)
    }
  }, [visitCount])

  return {
    showWheel,
    closeWheel,
    forceShowWheel,
    visitCount
  }
}