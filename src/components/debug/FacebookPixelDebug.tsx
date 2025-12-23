'use client'

import { useEffect, useState } from 'react'

export function FacebookPixelDebug() {
  const [events, setEvents] = useState<string[]>([])
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    // Check if Facebook Pixel is loaded
    const checkPixelStatus = () => {
      if (typeof window !== 'undefined') {
        if (window.fbq) {
          setPixelStatus('ready')
          console.log('Facebook Pixel is loaded and ready')
        } else {
          setPixelStatus('error')
          console.error('Facebook Pixel not found')
        }
      }
    }

    // Initial check
    checkPixelStatus()

    // Recheck after a delay
    const timer = setTimeout(checkPixelStatus, 2000)

    // Override fbq to capture events
    if (typeof window !== 'undefined' && window.fbq) {
      const originalFbq = window.fbq
      window.fbq = function(command: string, eventName?: string, parameters?: any) {
        // Log the event
        const eventLog = `${command}${eventName ? ` - ${eventName}` : ''}${parameters ? ` - ${JSON.stringify(parameters)}` : ''}`
        setEvents(prev => [...prev.slice(-9), eventLog]) // Keep last 10 events
        console.log('Facebook Pixel Event:', eventLog)
        
        // Call original function
        return originalFbq.apply(this, arguments as any)
      }
    }

    return () => clearTimeout(timer)
  }, [])

  const testEvent = () => {
    if (window.fbq) {
      window.fbq('track', 'TestEvent', {
        test_parameter: 'debug_value',
        timestamp: new Date().toISOString()
      })
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="mb-2">
        <h3 className="font-bold text-yellow-400">FB Pixel Debug</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            pixelStatus === 'ready' ? 'bg-green-400' : 
            pixelStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
          }`}></div>
          <span className="text-xs">
            {pixelStatus === 'ready' ? 'Ready' : 
             pixelStatus === 'error' ? 'Error' : 'Loading'}
          </span>
        </div>
      </div>
      
      <button
        onClick={testEvent}
        className="bg-yellow-400 text-black px-2 py-1 rounded text-xs mb-2"
      >
        Test Event
      </button>
      
      <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
        <div className="font-semibold">Recent Events:</div>
        {events.length === 0 ? (
          <div className="text-gray-400">No events yet</div>
        ) : (
          events.map((event, index) => (
            <div key={index} className="font-mono text-xs break-all">
              {event}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
