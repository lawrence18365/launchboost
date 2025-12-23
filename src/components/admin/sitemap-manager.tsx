'use client'

import { useState } from 'react'

export function SitemapManager() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleRefreshSitemap = async () => {
    setIsRefreshing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'regenerate' }),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage('Sitemap regenerated and search engines notified!')
        setLastRefresh(new Date().toLocaleString())
      } else {
        setMessage('Failed to refresh sitemap')
      }
    } catch (error) {
      console.error('Sitemap refresh error:', error)
      setMessage('Error refreshing sitemap')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewSitemap = () => {
    window.open('/sitemap.xml', '_blank')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">SEO Sitemap Management</h3>
        <div className="flex gap-2">
          <button
            onClick={handleViewSitemap}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Sitemap
          </button>
          <button
            onClick={handleRefreshSitemap}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              'Refresh Sitemap'
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            The sitemap is automatically updated when deals are approved, but you can manually refresh it here.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Automatic updates happen when deals are approved</li>
            <li>Search engines are automatically notified of changes</li>
            <li>Manual refresh is useful after bulk operations</li>
          </ul>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.toLowerCase().includes('regenerated') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {lastRefresh && (
          <div className="text-xs text-gray-500">
            Last manual refresh: {lastRefresh}
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Links</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Google Search Console
            </a>
            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Bing Webmaster Tools
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Robots.txt
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
