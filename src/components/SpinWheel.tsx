"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Sparkles } from 'lucide-react'

interface SpinWheelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WHEEL_PRIZES = [
  { id: 1, text: "10% OFF Next Deal", probability: 0.3 },
  { id: 2, text: "Early Access", probability: 0.25 },
  { id: 3, text: "Free Deal Alert", probability: 0.2 },
  { id: 4, text: "15% OFF Code", probability: 0.15 },
  { id: 5, text: "VIP Deal List", probability: 0.07 },
  { id: 6, text: "50% OFF Premium", probability: 0.03 }
]

export function SpinWheel({ open, onOpenChange }: SpinWheelProps) {
  const [email, setEmail] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [prize, setPrize] = useState<typeof WHEEL_PRIZES[0] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [canSpin, setCanSpin] = useState(true)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Check if user is eligible to spin when component opens
  useEffect(() => {
    if (open) {
      checkSpinEligibility()
    }
  }, [open])

  const checkSpinEligibility = async () => {
    try {
      setIsCheckingEligibility(true)
      const response = await fetch('/api/spin-wheel/check')
      const data = await response.json()
      
      if (response.ok) {
        setCanSpin(data.canSpin)
        if (data.hasSpun) {
          setHasSpun(true)
          setErrorMessage("You've already spun the wheel from this device/location!")
        }
      } else {
        console.error('Error checking spin eligibility:', data.error)
        setCanSpin(false)
        setErrorMessage("Unable to verify spin eligibility. Please try again later.")
      }
    } catch (error) {
      console.error('Error checking spin eligibility:', error)
      setCanSpin(false)
      setErrorMessage("Connection error. Please check your internet and try again.")
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  const selectRandomPrize = () => {
    const random = Math.random()
    let cumulative = 0
    
    for (const prizeOption of WHEEL_PRIZES) {
      cumulative += prizeOption.probability
      if (random <= cumulative) {
        return prizeOption
      }
    }
    
    return WHEEL_PRIZES[0] // Fallback
  }

  const handleSpin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || isSpinning || hasSpun || !canSpin) return

    setIsSpinning(true)
    setErrorMessage('')
    
    // Select prize first
    const selectedPrize = selectRandomPrize()
    
    // Calculate rotation to land on selected prize
    const prizeIndex = WHEEL_PRIZES.findIndex(p => p.id === selectedPrize.id)
    const degreesPerSlice = 360 / WHEEL_PRIZES.length
    const targetRotation = (prizeIndex * degreesPerSlice) + (degreesPerSlice / 2)
    const totalRotation = 360 * 3 + targetRotation // 3 full spins + target
    
    setRotation(totalRotation)
    
    // Submit spin while spinning
    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/spin-wheel/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          prize: selectedPrize.text
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("indiesaasdeals-email-submitted", "true")
        localStorage.setItem("indiesaasdeals-marketing-consent", "true")
        localStorage.setItem("indiesaasdeals-wheel-prize", JSON.stringify(selectedPrize))
      } else {
        setErrorMessage(data.error || "Failed to submit spin. Please try again.")
        setIsSpinning(false)
        return
      }
    } catch (error) {
      console.error("Spin submission failed:", error)
      setErrorMessage("Connection error. Please try again.")
      setIsSpinning(false)
      return
    } finally {
      setIsSubmitting(false)
    }
    
    // Show result after animation
    setTimeout(() => {
      setIsSpinning(false)
      setHasSpun(true)
      setPrize(selectedPrize)
    }, 3000)
  }

  const handleClose = () => {
    if (!hasSpun) {
      localStorage.setItem("indiesaasdeals-wheel-seen", "true")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="font-sans sm:max-w-md p-0 gap-0 bg-white border-2 border-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative text-center p-8 pb-6 bg-brand">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-black/60 hover:text-black transition-colors z-10"
            aria-label="Close wheel"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-black">Spin the wheel</h2>
          <p className="text-black/80 text-sm mt-1">Unlock an exclusive reward</p>
        </div>

        {isCheckingEligibility ? (
          <div className="text-center p-8 text-black">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2 text-black">Checking eligibility</h3>
              <p className="text-black/80">Please wait while we verify your spin status</p>
            </div>
          </div>
        ) : !canSpin && !hasSpun ? (
          <div className="text-center p-8 text-black">
            <div className="mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Sorry</h3>
              <p className="text-black/80 mb-4">{errorMessage}</p>
            </div>
            <Button 
              onClick={handleClose}
              className="w-full h-12 text-base font-semibold bg-black text-primary-foreground hover:bg-gray-900"
            >
              Continue Browsing
            </Button>
          </div>
        ) : !hasSpun ? (
          <div className="p-8 text-black">
            {/* Spinning Wheel */}
            <div className="relative mx-auto mb-8" style={{ width: '220px', height: '220px' }}>
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-black"></div>
              {/* Wheel */}
              <div 
                className="relative w-full h-full rounded-full transition-transform duration-3000 ease-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: (() => {
                    const sliceColors = [
                      'hsl(var(--brand-surface))', '#fffdf0',
                      'hsl(var(--brand-surface))', '#fffdf0',
                      'hsl(var(--brand-surface))', '#fffdf0',
                    ]
                    return `conic-gradient(${sliceColors.map((c, i) => `${c} ${(i * 60)}deg ${((i + 1) * 60)}deg`).join(', ')})`
                  })()
                }}
              >
                {/* Prize text */}
                {WHEEL_PRIZES.map((prize, i) => (
                  <div
                    key={prize.id}
                    className="absolute text-[11px] font-semibold text-black"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 60 + 30}deg) translateY(-78px) rotate(-${i * 60 + 30}deg)`,
                      width: '88px',
                      textAlign: 'center',
                      letterSpacing: '0.1px'
                    }}
                  >
                    {prize.text}
                  </div>
                ))}
                {/* Center cap */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-black border-2 border-black flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              </div>
              {/* Slice separators */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-[2px] h-[44%] bg-black origin-bottom"
                  style={{ transform: `rotate(${i * 60}deg) translate(-50%, -100%)` }}
                />
              ))}
              {/* Pointer */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-black"></div>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSpin} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email to spin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSpinning || isSubmitting || !canSpin}
                className="text-base h-12 border-2 border-gray-200 focus:border-black"
              />
              
              {errorMessage && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {errorMessage}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-black text-primary-foreground hover:bg-gray-900 disabled:opacity-50"
                disabled={isSpinning || isSubmitting || !email || !canSpin}
              >
                {isSpinning ? 'Spinning…' : 'Spin now'}
              </Button>
            </form>

            <p className="text-xs text-black/70 mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        ) : (
          /* Win Screen */
          <div className="text-center p-8 text-black">
            <div className="mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Congratulations</h3>
              <p className="text-sm text-black/80 mb-3">You’ve unlocked</p>
              <div className="inline-block px-4 py-2 rounded-lg font-semibold text-sm bg-black text-primary-foreground border-2 border-black">
                {prize?.text}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-black/80">Your reward will be sent to: <strong>{email}</strong></p>
              <p className="text-black/80">Check your email within a few minutes.</p>
              <p className="text-black/80">We’ll also send our best daily deals.</p>
            </div>

            <Button 
              onClick={handleClose}
              className="w-full mt-6 h-12 text-base font-semibold bg-black text-primary-foreground hover:bg-gray-900"
            >
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
