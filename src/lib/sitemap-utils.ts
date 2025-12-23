/**
 * Sitemap utilities for automatic SEO updates
 */

// Function to trigger sitemap regeneration
export async function triggerSitemapUpdate() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indiesaasdeals.com'
    
    // Call our sitemap regeneration API
    const response = await fetch(`${baseUrl}/api/sitemap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'regenerate' }),
    })
    
    if (response.ok) {
      console.log('Sitemap updated and search engines notified')
      return true
    } else {
      console.error('Failed to update sitemap:', await response.text())
      return false
    }
  } catch (error) {
    console.error('Error triggering sitemap update:', error)
    return false
  }
}

// Function to ping search engines directly
export async function pingSearchEngines() {
  const sitemapUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`
  
  const promises = [
    // Ping Google
    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
      .then(() => console.log('Google pinged successfully'))
      .catch((error) => console.error('Failed to ping Google:', error)),
    
    // Ping Bing
    fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
      .then(() => console.log('Bing pinged successfully'))
      .catch((error) => console.error('Failed to ping Bing:', error)),
  ]
  
  await Promise.allSettled(promises)
}

// Function to track sitemap updates (for analytics)
export function logSitemapUpdate(trigger: 'deal_created' | 'deal_updated' | 'deal_approved' | 'manual') {
  console.log(`Sitemap update triggered by: ${trigger} at ${new Date().toISOString()}`)
  
  // You can expand this to send to analytics services
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sitemap_update', {
      event_category: 'SEO',
      event_label: trigger,
    })
  }
}
