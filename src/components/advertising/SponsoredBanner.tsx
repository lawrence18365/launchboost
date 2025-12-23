"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Crown, Eye, Star, Megaphone } from "lucide-react"

interface SponsoredBannerProps {
  position: string
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function SponsoredBanner({ position, className = "", size = 'medium' }: SponsoredBannerProps) {
  const sizeClasses = {
    small: "h-16 text-sm",
    medium: "h-24 text-base", 
    large: "h-32 text-lg"
  }
  
  const priceBySize = {
    small: "$5",
    medium: "$15", 
    large: "$25"
  }
  
  return (
    <Link href="/advertise" className="block group">
      <div
        className={`bg-white border-2 border-black rounded-lg ${sizeClasses[size]} hover:shadow-professional-lg transition-all duration-300 cursor-pointer relative overflow-hidden ${className}`}
      >
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse opacity-60" />
        </div>

        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">
                Your Brand Here
              </h4>
              <p className="text-sm text-foreground/70">Reach deal hunters when they're most engaged</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className="bg-brand text-brand-foreground border-2 border-black px-3 py-1 mb-2">
              {position}
            </Badge>
            <div className="text-sm font-bold text-foreground">
              {priceBySize[size]} • 7 days
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default SponsoredBanner
