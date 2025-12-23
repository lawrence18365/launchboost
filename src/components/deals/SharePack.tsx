'use client'

import { useState } from 'react'
import { Share2, Twitter, Linkedin, MessageCircle, Copy, Check } from 'lucide-react'

interface SharePackProps {
  deal: {
    product_name: string
    short_description: string
    slug: string
    deal_price: number
    original_price: number
  }
}

export function SharePack({ deal }: SharePackProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    const priceInDollars = price > 999 ? price / 100 : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInDollars)
  }

  const discountAmount = deal.original_price - deal.deal_price
  const savings = Math.round((discountAmount / deal.original_price) * 100)
  const dealUrl = `https://indiesaasdeals.com/deals/${deal.slug}`

  // Platform-specific copy
  const twitterCopy = `🔥 Found an amazing deal on ${deal.product_name}!\n\n${deal.short_description}\n\n💰 ${savings}% OFF - Only ${formatPrice(deal.deal_price)} (was ${formatPrice(deal.original_price)})\n\n${dealUrl}\n\n#SaaS #Deal #IndieHackers`

  const linkedinCopy = `🚀 Discovered a fantastic deal on ${deal.product_name}\n\n${deal.short_description}\n\nSpecial offer: ${savings}% OFF - Now ${formatPrice(deal.deal_price)} (originally ${formatPrice(deal.original_price)})\n\nPerfect for entrepreneurs and businesses looking to optimize their tech stack.\n\nCheck it out: ${dealUrl}`

  const redditCopy = `Found a great deal on ${deal.product_name} - ${savings}% off!\n\n${deal.short_description}\n\nPrice: ${formatPrice(deal.deal_price)} (was ${formatPrice(deal.original_price)})\n\nLink: ${dealUrl}`

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(platform)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterCopy)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dealUrl)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(dealUrl)}&title=${encodeURIComponent(`${deal.product_name} - ${savings}% OFF Deal`)}&text=${encodeURIComponent(redditCopy)}`
  }

  return (
    <div className="bg-white border-2 border-black rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-black" />
        <h3 className="text-xl font-bold text-black">Share this deal</h3>
      </div>

      {/* Social Share Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-black text-white font-bold px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Twitter className="w-4 h-4" />
          Share on X
        </a>

        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#0A66C2] text-white font-bold px-4 py-3 rounded-lg hover:bg-[#004182] transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          Share on LinkedIn
        </a>

        <a
          href={shareUrls.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#FF4500] text-white font-bold px-4 py-3 rounded-lg hover:bg-[#CC3600] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Share on Reddit
        </a>
      </div>

      {/* Copy Post Buttons */}
      <div className="space-y-3">
        <h4 className="font-bold text-black">Copy ready-to-post content:</h4>
        
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => copyToClipboard(twitterCopy, 'twitter')}
            className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="font-medium text-black">Copy X/Twitter post</span>
            {copied === 'twitter' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <button
            onClick={() => copyToClipboard(linkedinCopy, 'linkedin')}
            className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="font-medium text-black">Copy LinkedIn post</span>
            {copied === 'linkedin' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <button
            onClick={() => copyToClipboard(redditCopy, 'reddit')}
            className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="font-medium text-black">Copy Reddit post</span>
            {copied === 'reddit' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Copy URL */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        <button
          onClick={() => copyToClipboard(dealUrl, 'url')}
          className="flex items-center justify-between w-full bg-yellow-50 border-2 border-yellow-200 rounded-lg px-4 py-3 hover:bg-yellow-100 transition-colors"
        >
          <span className="font-bold text-black">Copy deal link</span>
          {copied === 'url' ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  )
}