'use client'

import { useEffect, useState } from 'react'

export default function DebugAnalytics() {
  const [envVars, setEnvVars] = useState<any>({})
  const [gtagLoaded, setGtagLoaded] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      GA_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NODE_ENV: process.env.NODE_ENV,
    })

    // Check if gtag script is loaded
    const checkGtag = () => {
      if (typeof window !== 'undefined') {
        setGtagLoaded(!!window.gtag)
        const gaScript = document.querySelector('script[src*="googletagmanager.com"]')
        setScriptLoaded(!!gaScript)
      }
    }

    checkGtag()
    
    // Check again after a delay
    const timer = setTimeout(checkGtag, 2000)
    return () => clearTimeout(timer)
  }, [])

  const testGAEvent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'test_event', {
        event_category: 'debug',
        event_label: 'manual_test',
        value: 1
      })
      alert('GA event sent! Check Network tab for outgoing requests.')
    } else {
      alert('Google Analytics not loaded!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google Analytics Debug</h1>
        
        <div className="grid gap-6">
          {/* Environment Variables */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </div>

          {/* GA Status */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Google Analytics Status</h2>
            <div className="space-y-2">
              <div className={`p-2 rounded ${scriptLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                GA Script Loaded: {scriptLoaded ? '✅ Yes' : '❌ No'}
              </div>
              <div className={`p-2 rounded ${gtagLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                gtag Function Available: {gtagLoaded ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </div>

          {/* Manual Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Manual Test</h2>
            <button 
              onClick={testGAEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send Test GA Event
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will send a test event to GA. Check the Network tab to see if requests are made to google-analytics.com
            </p>
          </div>

          {/* Scripts in DOM */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Scripts in DOM</h2>
            <div className="text-sm">
              {typeof window !== 'undefined' && (
                <pre className="bg-gray-100 p-4 rounded">
                  {Array.from(document.querySelectorAll('script[src*="google"]')).map((script, i) => 
                    `${i + 1}. ${(script as HTMLScriptElement).src}\n`
                  ).join('')}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}