'use client'

import { Share2 } from "lucide-react"

interface ShareButtonProps {
  url: string
}

export function ShareButton({ url }: ShareButtonProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch (error) {
      // Fallback for older browsers
      console.error('Failed to copy:', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopyLink}
      className="inline-flex items-center gap-2 bg-white text-black font-bold px-3 py-1 rounded-full border-2 border-black hover:bg-black hover:text-yellow-400 transition-colors"
      aria-label="Copy link"
    >
      <Share2 className="h-4 w-4" /> Copy link
    </button>
  )
}