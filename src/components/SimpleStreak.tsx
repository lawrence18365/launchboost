"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Flame } from 'lucide-react'

export function SimpleStreak() {
  const [streak, setStreak] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Simple localStorage streak tracking
    const today = new Date().toDateString()
    const lastVisit = localStorage.getItem('indiesaasdeals-last-streak-visit')
    const currentStreak = parseInt(localStorage.getItem('indiesaasdeals-streak') || '0')
    
    if (lastVisit === today) {
      // Already visited today
      setStreak(currentStreak)
      setShow(currentStreak >= 3) // Only show after 3+ days
      return
    }
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toDateString()
    
    let newStreak = 1
    
    if (lastVisit === yesterdayString) {
      // Consecutive day
      newStreak = currentStreak + 1
    } else if (lastVisit && lastVisit !== yesterdayString) {
      // Streak broken
      newStreak = 1
    }
    
    // Update localStorage
    localStorage.setItem('indiesaasdeals-last-streak-visit', today)
    localStorage.setItem('indiesaasdeals-streak', newStreak.toString())
    
    setStreak(newStreak)
    setShow(newStreak >= 3) // Only show after 3+ days
  }, [])

  if (!show) return null

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🏆'
    if (days >= 14) return '🔥'
    if (days >= 7) return '⚡'
    return '✨'
  }

  const getStreakMessage = (days: number) => {
    if (days >= 30) return 'Deal Master!'
    if (days >= 14) return 'Deal Hunter!'
    if (days >= 7) return 'On Fire!'
    return 'Keep it up!'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden sm:block">
      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 text-sm shadow-lg">
        <span className="mr-1">{getStreakEmoji(streak)}</span>
        <Flame className="h-4 w-4 mr-1" />
        <span className="font-bold">{streak} day streak</span>
        <span className="ml-2 text-xs opacity-90">{getStreakMessage(streak)}</span>
      </Badge>
    </div>
  )
}