"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/ui/logo"
import { X, Check, Mail, Zap, Trophy, Star } from "lucide-react"
import { getCurrentUser } from "@/lib/client/auth"
// Removed complex tracking for simple approach

// Extend Window interface for global modal state management
declare global {
  interface Window {
    __indiesaasdeals_modal_active?: boolean
    __indiesaasdeals_modal_triggered?: boolean
  }
}

export function BirdDogEmailModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pageStartTime = useRef(Date.now())
  const minimumTimeOnPage = 15000 // 15 seconds minimum
  
  // Simple approach without complex tracking

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setIsLoggedIn(!!currentUser)
        
        // Don't show modal if user is logged in
        if (currentUser) return
        
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    checkAuth()
    
    const hasSeenModal = localStorage.getItem("indiesaasdeals-email-capture-seen")
    const hasEmailSubmitted = localStorage.getItem("indiesaasdeals-email-submitted")
    const marketingConsent = localStorage.getItem("indiesaasdeals-marketing-consent")
    
    // Don't show if already seen, submitted, user is logged in, or they've already made marketing choice
    if (hasSeenModal || hasEmailSubmitted || isLoggedIn || marketingConsent !== null) return

    // Prevent multiple instances with a global flag
    if (window.__indiesaasdeals_modal_active) return
    window.__indiesaasdeals_modal_active = true

    // Require meaningful interaction AFTER minimum time on page
    const handleInteraction = () => {
      // Check if user has been on page long enough
      const timeOnPage = Date.now() - pageStartTime.current
      if (timeOnPage < minimumTimeOnPage) return
      
      if (!hasInteracted && !window.__indiesaasdeals_modal_triggered) {
        window.__indiesaasdeals_modal_triggered = true
        setHasInteracted(true)
        // Show modal after longer delay to ensure user is engaged
        setTimeout(() => {
          setIsOpen(true)
        }, 6000) // 6 second delay after interaction
      }
    }

    // More meaningful interaction detection
    const handleScrollInteraction = (e) => {
      // Require significant scrolling (400px = meaningful engagement)
      if (window.scrollY < 400) return
      handleInteraction()
    }
    
    const handleClickInteraction = (e) => {
      // Any click after minimum time on page
      handleInteraction()
    }

    // Add separate event listeners for better control
    document.addEventListener('scroll', handleScrollInteraction, { once: true, passive: true })
    document.addEventListener('click', handleClickInteraction, { once: true })

    return () => {
      window.__indiesaasdeals_modal_active = false
      document.removeEventListener('scroll', handleScrollInteraction)
      document.removeEventListener('click', handleClickInteraction)
    }
  }, [isLoggedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: 'homepage_modal' 
        }),
      });

      if (response.ok) {
        setHasSubmitted(true)
        localStorage.setItem("indiesaasdeals-email-submitted", "true")
        localStorage.setItem("indiesaasdeals-marketing-consent", "true")

        // Simple success tracking

        setTimeout(() => {
          setIsOpen(false)
        }, 2500)
      } else {
        console.error('Email submission failed')
      }
    } catch (error) {
      console.error("Email submission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem("indiesaasdeals-email-capture-seen", "true")
    window.__indiesaasdeals_modal_active = false
  }

  // Don't render if user is logged in
  if (isLoggedIn) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="font-sans sm:max-w-md p-0 gap-0 bg-white border-2 border-black rounded-2xl overflow-hidden shadow-2xl"
        data-modal="email-capture"
        style={{ zIndex: 100 }} // Lower z-index than preference quiz
      >
        {hasSubmitted ? (
          <div className="text-center p-10 bg-brand">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-3">Welcome, Deal Hunter!</h3>
            <p className="text-black/80 font-medium">You've earned 25 XP! Start building your streak for exclusive rewards.</p>
          </div>
        ) : (
          <>
            {/* Yellow Header */}
            <div className="text-center p-8 pb-6 bg-brand">
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 text-black/60 hover:text-black transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 p-2">
                <Logo width={48} height={48} showText={false} />
              </div>
              <h2 className="text-2xl font-bold text-black mb-3">Join the Deal Hunter Community</h2>
              <p className="text-black/80 font-medium">Get exclusive deals + earn rewards for being an active member!</p>
            </div>

            {/* White Content Area */}
            <div className="p-8 pt-6">
              {/* Gamification bonus banner */}
              <div className="rounded-lg p-4 mb-6 bg-brand text-brand-foreground border-2 border-black">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold text-sm">BONUS: +25 Hunter XP</span>
                </div>
                <p className="text-xs opacity-90">
                  Start your Deal Hunter journey and unlock exclusive rewards.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-yellow-400" />
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Exclusive discounts</strong> up to 90% off premium SaaS tools
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mt-0.5">
                    <Trophy className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Deal Hunter rewards</strong> - earn XP and unlock tiers (Bronze → Platinum)
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-yellow-400" />
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Early access</strong> to featured deals (24h before public release)
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Daily streak rewards</strong> and exclusive member-only deals
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-yellow-400" />
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Weekly digest</strong> of the best deals. No spam, ever.
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-base h-12 border-2 border-gray-200 focus:border-black"
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-bold bg-black text-yellow-400 hover:bg-gray-800"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                      Joining Hunters...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-4 w-4" />
                      Start Deal Hunting (+25 XP)
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
