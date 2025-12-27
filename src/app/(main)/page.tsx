"use client";

import { Suspense, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, TrendingUp, Clock, Users, ThumbsUp, Flame, Star, Timer, Trophy, AlertCircle, Heart, Bell, Filter, CheckCircle2 } from "lucide-react"
import Link from "next/link"
// import { BirdDogEmailModal } from "@/components/modals/EmailCaptureModal" // DISABLED: Using SpinWheel instead
import { getCurrentUser } from "@/lib/client/auth"
import { getExternalDealURL } from "@/lib/utm"
import { CategoryAwareHero } from "@/components/category/CategoryHero"

import { NewsletterSignup } from "@/components/marketing/NewsletterSignup"

import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics"

// Sticky Global Deal Bar Component
const StickyDealBar = ({ urgentDeals }) => {
  const [currentDeal, setCurrentDeal] = useState(0)
  
  useEffect(() => {
    if (urgentDeals.length === 0) return
    const interval = setInterval(() => {
      setCurrentDeal(prev => (prev + 1) % urgentDeals.length)
    }, 10000) // Rotate every 10 seconds
    return () => clearInterval(interval)
  }, [urgentDeals.length])
  
  if (urgentDeals.length === 0) return null
  
  const deal = urgentDeals[currentDeal]
  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60)) : null
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 z-50 animate-pulse" aria-live="polite">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 text-sm font-bold">
        <Flame className="w-4 h-4 animate-bounce" />
        <span className="sr-only">Flash deal</span>
        <span className="truncate">{deal.product_name} — {deal.discount_percentage}% OFF</span>
        <Timer className="w-3 h-3" />
        <span>Ends in {timeLeft}h</span>
        <Link href={`/deals/${deal.slug}`} className="bg-white text-red-600 px-3 py-1 rounded text-xs hover:bg-gray-100">
          Claim Now →
        </Link>
        <button onClick={() => setCurrentDeal((prev) => (prev + 1) % urgentDeals.length)} className="text-white/80 hover:text-white">
          Next Deal →
        </button>
      </div>
    </div>
  )
}



// Live Deal Ticker Component
const LiveDealTicker = ({ deals, totalSavings }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (deals.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deals.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [deals.length])

  if (deals.length === 0) return null

  const d = deals[currentIndex]
  const saved = Math.max(0, (d?.original_price ?? 0) - (d?.deal_price ?? 0))

  return (
    <div className="mb-6">
      <div className="w-full bg-white/80 backdrop-blur-md rounded-full px-4 py-2.5 flex items-center justify-between text-xs font-medium shadow-sm border border-gray-100/50">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="hidden sm:inline font-semibold">Community savings:</span>
          <span className="sm:ml-1 text-green-600 font-bold">${Number(totalSavings).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[40vw] sm:max-w-[50vw] text-gray-900"><span className="font-bold text-red-500">Hot now:</span> {d?.product_name ?? 'Deal'}</span>
          {d?.discount_percentage ? (
            <Badge className="bg-red-50 text-red-600 border-0 shadow-none font-bold px-1.5">{d.discount_percentage}% OFF</Badge>
          ) : null}
          {saved > 0 ? (
            <span className="text-gray-500 hidden sm:inline">Save ${saved.toFixed(0)}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Tabbed Navigation Hero Component  
const TabbedHero = ({ deals, isLoggedIn, heroMode = false, showHeader = true }) => {
  const [activeTab, setActiveTab] = useState('trending')
  
  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'ending', label: 'Ending Soon', icon: Clock },
    { id: 'new', label: 'Fresh', icon: Zap },
    { id: 'discounts', label: 'Best Discounts', icon: Trophy }
  ]
  
  const getFilteredDeals = (tabId) => {
    const currentTime = new Date()
    switch(tabId) {
      case 'trending': 
        return [...deals].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      case 'ending': 
        return deals.filter(d => {
          if (!d.expires_at) return false
          const timeLeft = Math.ceil((new Date(d.expires_at) - currentTime) / (1000 * 60 * 60 * 24))
          return timeLeft <= 3 && timeLeft > 0
        }).sort((a, b) => {
          const timeLeftA = Math.ceil((new Date(a.expires_at) - currentTime) / (1000 * 60 * 60 * 24))
          const timeLeftB = Math.ceil((new Date(b.expires_at) - currentTime) / (1000 * 60 * 60 * 24))
          return timeLeftA - timeLeftB
        })
      case 'new': 
        return [...deals].sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0
          const db = b.created_at ? new Date(b.created_at).getTime() : 0
          return db - da
        })
      case 'discounts': 
        return [...deals].sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
      default: 
        return deals
    }
  }
  
  const filteredDeals = getFilteredDeals(activeTab)
  
  return (
    <div className={`${heroMode ? 'mt-2' : 'mt-12 md:mt-16'} mb-16`}>
      {/* Section Header */}
      {showHeader && (
        <div className={`${heroMode ? 'text-left' : 'text-center'} mb-10`}>
          {heroMode ? (
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4 watercolor-text">
              Trending Opportunities
            </h2>
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 watercolor-text">
              Trending Opportunities
            </h2>
          )}
          <p className={`text-base md:text-lg text-gray-600 ${heroMode ? '' : 'font-medium'}`}>
            High-impact resources for scaling ventures, curated for performance and reliability.
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={`${heroMode || !showHeader ? 'justify-start' : 'justify-center'} flex mb-8 overflow-x-auto no-scrollbar -mx-2 px-2 md:mx-0 md:px-0 w-full`}>
        <div className="bg-gray-100/50 backdrop-blur-sm p-1.5 rounded-full inline-flex whitespace-nowrap gap-2 shadow-inner w-max">
          {tabs.map(tab => {
            const TabIcon = tab.icon
            const tabDeals = getFilteredDeals(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold transition-all text-xs md:text-sm ${
                  activeTab === tab.id 
                    ? 'bg-white text-gray-900 shadow-md transform scale-105' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tabDeals.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] md:text-xs ${
                    activeTab === tab.id 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tabDeals.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Tab Content - Grid of exactly 4 deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {filteredDeals.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="text-gray-400 mb-3">
              {activeTab === 'ending' ? 'No deals ending soon' : 
               activeTab === 'new' ? 'Loading fresh deals...' :
               activeTab === 'discounts' ? 'Calculating biggest savings...' :
               ' Loading trending deals...'}
            </div>
            <p className="text-sm text-gray-400 font-medium">Check back soon for updates!</p>
          </div>
        ) : (
          filteredDeals.slice(0, 4).map((deal, i) => (
            <div
              key={deal.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <QuickDealCard deal={deal} isLoggedIn={isLoggedIn} showVotes={activeTab === 'trending'} />
            </div>
          ))
        )}
      </div>
      
      {/* Show All Button */}
      {filteredDeals.length > 4 && (
        <div className="text-center mt-10">
          <Link 
            href={activeTab === 'ending' ? '/deals?filter=ending' : 
                  activeTab === 'new' ? '/deals?filter=new' :
                  activeTab === 'discounts' ? '/deals?sort=discount' :
                  '/deals?sort=popular'}
            className="group btn-organic bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            View All {tabs.find(t => t.id === activeTab)?.label} 
            <Badge className="bg-gray-100 text-gray-600 ml-1 group-hover:bg-gray-200 border-none">
              {filteredDeals.length}
            </Badge>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  )
}

// Above-the-fold hero wrapper combining intro + live deals with subtle animations
const AboveFoldHero = ({ allDeals, isLoggedIn }) => {
  return (
    <section className="relative watercolor-bg rounded-[3rem] overflow-hidden my-4 mx-4 md:mx-0">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-black/5 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Curated Enterprise-Grade Tools
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.0] text-black mb-8 watercolor-text">
              Premium Software <span className="relative inline-block text-black">
                Infrastructure.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-xl mb-10 leading-relaxed font-medium">
              Maximize your runway with exclusive negotiated rates on high-performance SaaS tools. Every listing is founder-verified to ensure long-term reliability and immediate ROI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/deals" 
                className="btn-organic inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black bg-yellow-400 hover:bg-yellow-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Explore Curated Catalog
              </Link>
              <Link 
                href="/dashboard/deals/new" 
                className="btn-organic inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all"
              >
                Submit a Product
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Verified Ecosystem</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Direct Founder Support</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 animate-fade-in relative">
            {/* Organic blob background for the grid */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100/50 to-purple-100/50 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] blur-3xl -z-10 opacity-60"></div>
            <TabbedHero deals={allDeals} isLoggedIn={isLoggedIn} heroMode={true} showHeader={false} />
          </div>
        </div>
      </div>
    </section>
  )
}

const FeaturedDealCard = ({ deal, isLoggedIn, showVotes = true }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = timeLeft && timeLeft <= 3
  
  // Only show real data, no fake numbers
  const realVotes = deal.upvotes || 0
  const realCodesLeft = deal.codes_remaining || null

  return (
    <Card className={`group relative overflow-hidden organic-card h-full flex flex-col border-none ${
      isUrgent ? 'ring-2 ring-red-100' : ''
    }`}>
      {isUrgent && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs py-1.5 px-2 text-center font-bold shadow-sm">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          ENDING SOON
        </div>
      )}
      
      <CardContent className={`p-6 ${isUrgent ? 'pt-10' : ''} flex flex-col h-full bg-white/50`}>
        <div className="flex items-start justify-between mb-5">
          <Badge className={`font-bold px-3 py-1 rounded-full shadow-sm border-0 ${
            isUrgent ? 'bg-red-50 text-red-600' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {deal.discount_percentage}% OFF
          </Badge>
          
          {/* Product Icon */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md bg-white flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            {deal.logo_url ? (
              <img 
                src={deal.logo_url} 
                alt={`${deal.product_name} icon`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'block'
                }}
              />
            ) : null}
            <Zap className={`w-6 h-6 text-gray-400 ${deal.logo_url ? 'hidden' : 'block'}`} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] tracking-tight">{deal.product_name}</h3>
        <p className="text-gray-600 mb-5 text-sm line-clamp-2 min-h-[2.5rem] leading-relaxed">{deal.short_description}</p>
        
        <div className="flex items-center gap-3 mb-5 min-h-[1.25rem]">
          <Badge variant="outline" className="text-xs rounded-full border-gray-200 text-gray-600 bg-gray-50">{deal.category}</Badge>
          {deal.review_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-700">{deal.avg_rating}</span>
              <span>({deal.review_count})</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(deal.deal_price)}</span>
            <span className="text-lg text-gray-400 line-through decoration-gray-300">{formatPrice(deal.original_price)}</span>
          </div>
          {timeLeft && timeLeft > 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isUrgent ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
            }`}>
              <Clock className={`w-3 h-3 ${isUrgent ? 'animate-pulse' : ''}`} />
              {timeLeft}d left
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-5 text-xs">
          {/* Only show codes left if we have real data */}
          {realCodesLeft ? (
            <span className="text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
              <Users className="w-3 h-3" />
              <span className="font-medium">{realCodesLeft} left</span>
            </span>
          ) : (
            <span className="text-gray-400 font-medium">
              Deal Active
            </span>
          )}
          <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">
            Save ${(deal.original_price - deal.deal_price).toFixed(0)}
          </span>
        </div>
        
        <div className="space-y-3 mt-auto">
          <Link href={`/deals/${deal.slug || deal.id}`} className="block w-full">
            <button className={`btn-organic w-full font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              isUrgent 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                : 'bg-gray-900 text-white hover:bg-black'
            }`}>
              {isUrgent ? 'Claim Deal' : 'View Deal'} <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link 
            prefetch={false}
            href={deal.product_website ? getExternalDealURL(deal.product_website, 'featuredDeal') : `/deals/${deal.slug || deal.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full text-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            onClick={() => trackGoogleEvent('outbound_click', 'conversion', `featured_${deal.product_name}`)}
          >
            Visit Website Directly
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

const QuickDealCard = ({ deal, isLoggedIn, showVotes = true }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = timeLeft && timeLeft <= 2
  
  // Only show real data, no fake numbers
  const realVotes = deal.upvotes || 0
  const realCodesLeft = deal.codes_remaining || null

  return (
    <Link prefetch={false} href={`/deals/${deal.slug || deal.id}`} className="block h-full group">
      <div className={`organic-card p-5 h-full min-h-[220px] flex flex-col justify-between ${
        isUrgent ? 'ring-1 ring-red-100' : ''
      }`}>
        {isUrgent && (
          <div className="absolute top-3 right-3 z-10 bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-100 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            URGENT
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4 min-h-[1.25rem]">
          <h4 className="font-bold text-gray-900 text-sm line-clamp-1 flex-1 mr-3 group-hover:text-blue-600 transition-colors">{deal.product_name}</h4>
          
          {/* Product Icon */}
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
            {deal.logo_url ? (
              <img 
                src={deal.logo_url} 
                alt={`${deal.product_name} icon`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'block'
                }}
              />
            ) : null}
            <Zap className={`w-4 h-4 text-gray-400 ${deal.logo_url ? 'hidden' : 'block'}`} />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(deal.deal_price)}</span>
            <span className="text-xs text-gray-400 line-through decoration-gray-300">{formatPrice(deal.original_price)}</span>
          </div>
          <Badge className={`text-[10px] font-bold rounded-full px-2 py-0.5 shadow-none border-0 ${
            isUrgent ? 'bg-red-50 text-red-600' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {deal.discount_percentage}% OFF
          </Badge>
        </div>
        
        <div className="flex items-center justify-between min-h-[1.25rem] mt-auto pt-3 border-t border-gray-50">
          {/* Only show codes left if we have real data */}
          {realCodesLeft ? (
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {realCodesLeft} left
            </span>
          ) : (
            <span className="text-[11px] text-gray-400">
              Deal Active
            </span>
          )}
          
          <div className="flex items-center gap-2">
            {deal.review_count > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{deal.avg_rating}</span>
              </div>
            )}
            <span className="text-[11px] text-green-600 font-bold">
              Save ${(deal.original_price - deal.deal_price).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Deal Hunter Stats Component
const DealHunterStats = ({ totalSavings, activeDeals }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="organic-card p-6 mb-10 bg-gradient-to-r from-green-50/50 to-blue-50/50">
      <div className="flex items-center justify-around gap-8 text-center">
        <div className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-white rounded-full shadow-sm mb-1 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{formatNumber(totalSavings)}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Capital Preserved</div>
          </div>
        </div>
        <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>
        <div className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-white rounded-full shadow-sm mb-1 group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{activeDeals}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active Opportunities</div>
          </div>
        </div>
        <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>
        <div className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-white rounded-full shadow-sm mb-1 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">Operational</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Platform Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Category Swim Lane Component
const CategorySwimLane = ({ category, deals, isLoggedIn }) => {
  // STRICT FILTERING: Only show deals where the category matches EXACTLY
  // This prevents the "Same deal everywhere" problem
  const categoryDeals = deals.filter(deal => {
    const categoryMatch = deal.category?.toLowerCase() === category.name.toLowerCase()
                       || deal.category?.toLowerCase() === category.slug.toLowerCase();
    
    // Only use strict matching for the swim lanes to ensure variety
    return categoryMatch;
  });
  
  // HIDE EMPTY SHELVES: If no deals, return null to hide the section
  if (categoryDeals.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <category.icon className="w-5 h-5 text-blue-600" />
          {category.name}
          {categoryDeals.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              {categoryDeals.length} deal{categoryDeals.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </h3>
          <Link 
            href={`/categories/${category.slug}`} 
            className="text-sm text-black/70 hover:text-black font-medium flex items-center gap-1"
          >
          See All →
          </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryDeals.slice(0, 4).map(deal => (
          <QuickDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} showVotes={false} />
        ))}
      </div>
    </div>
  )
}

// Personalization Block Component
const PersonalizationBlock = ({ title, deals, isLoggedIn, icon: Icon }) => {
  if (!isLoggedIn || deals.length === 0) return null
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deals.slice(0, 4).map(deal => (
          <QuickDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} showVotes={false} />
        ))}
      </div>
    </div>
  )
}

export default function DealHunterOptimizedHomepage() {
  const [featuredDeals, setFeaturedDeals] = useState([])
  const [quickDeals, setQuickDeals] = useState([])
  const [allDeals, setAllDeals] = useState([])
  const [urgentDeals, setUrgentDeals] = useState([])
  const [totalSavings, setTotalSavings] = useState(0)
  const [activeDeals, setActiveDeals] = useState(0)
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('') // Category detection state
  const [dealFilters, setDealFilters] = useState({
    category: 'all',
    sortBy: 'discount' // discount, expiring, popular
  })
  
  // Categories for swim lanes
  // Ensure names match database categories exactly for the strict filter to work
  const categories = [
    { name: 'Marketing & Growth', slug: 'marketing', icon: TrendingUp },
    { name: 'Developer Tools', slug: 'development', icon: Zap },
    { name: 'AI & Machine Learning', slug: 'ai', icon: Star },
    { name: 'Design & Creative', slug: 'design', icon: Trophy },
    { name: 'Productivity & Organization', slug: 'productivity', icon: Clock }
  ]

  // Category detection effect: only honor explicit URL param, avoid referrer-based switches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const categoryParam = urlParams.get('category')
      if (categoryParam) setCategory(categoryParam)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setIsLoggedIn(!!currentUser)

        // Fetch ALL deals first
        const allDealsResponse = await fetch('/api/deals?limit=50')
        if (allDealsResponse.ok) {
          const allData = await allDealsResponse.json()
          const deals = allData.deals || []
          
          // SMART FEATURED SORTING: Prioritize attractive impulse buys (Low Price + High Discount)
          // Score = (Discount % / Price) to find value
          // Boost "TaskFlow" specifically if found
          const sortedByAppeal = [...deals].sort((a, b) => {
            // Boost TaskFlow manually as requested
            if (a.product_name.includes('TaskFlow')) return -1;
            if (b.product_name.includes('TaskFlow')) return 1;
            
            // Otherwise sort by deal price (lower is better for impulse)
            return a.deal_price - b.deal_price;
          });
          
          const finalFeaturedDeals = sortedByAppeal.slice(0, 3);
          
          // Identify urgent deals (ending within 24 hours)
          const currentTime = new Date()
          const urgent = deals.filter(deal => {
            if (!deal.expires_at) return false
            const timeLeft = (new Date(deal.expires_at) - currentTime) / (1000 * 60 * 60)
            return timeLeft <= 24 && timeLeft > 0
          })
          
          setAllDeals(deals)
          setFeaturedDeals(finalFeaturedDeals)
          setUrgentDeals(urgent)
          setActiveDeals(deals.length)
          
          // Calculate total savings across all deals
          const savings = deals.reduce((total, deal) => {
            return total + (deal.original_price - deal.deal_price)
          }, 0)
          setTotalSavings(Math.round(savings))
        } else {
          console.error('Failed to fetch deals:', allDealsResponse.status)
        }

      } catch (error) {
        console.error('Error loading homepage data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Helper functions for personalization
  const getPersonalizedDeals = (user, deals) => {
    if (!user || deals.length === 0) return []
    // Simple personalization - return highest rated deals
    return deals.filter(deal => deal.review_count > 0).sort((a, b) => b.avg_rating - a.avg_rating)
  }
  
  const getUserWatchlist = (user) => {
    if (!user) return []
    // Mock watchlist - in real app, fetch from API
    return allDeals.slice(0, 2)
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50/30">
      {/* Deal Hunter Optimized Hero Section */}
      <section className="px-4 md:px-8 pt-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <AboveFoldHero allDeals={allDeals} isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="px-6 md:px-8 py-12 relative overflow-hidden">
        {/* Soft background blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-transparent via-yellow-50/30 to-transparent -z-10 blur-3xl rounded-full opacity-60 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3 watercolor-text">
              <Flame className="w-8 h-8 text-red-500 fill-red-100" />
              Featured Deals
            </h2>
            <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
              Hand-picked premium tools with the biggest discounts and shortest time left
            </p>
          </div>
            
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredDeals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {/* Show REAL deals only */}
              {featuredDeals.slice(0, 3).map((deal) => (
                <FeaturedDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Loading Fresh Deals...</h3>
              <p className="text-gray-500 mb-6">We're updating the hottest deals for you!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup - Above Fold / High Visibility */}
      <section className="px-6 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup location="homepage_mid" />
        </div>
      </section>

      {/* Category Swim Lanes Section */}
      <section className="px-6 md:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 watercolor-text">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
              Find deals tailored to your specific needs and workflow
            </p>
          </div>
            
          {loading ? (
            <div className="space-y-16">
              {categories.map((category, i) => (
                <div key={i} className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded-full w-48"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="bg-white rounded-2xl p-4 h-32 border border-gray-100 shadow-sm">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {categories.map((category) => (
                <CategorySwimLane 
                  key={category.slug} 
                  category={category} 
                  deals={allDeals} 
                  isLoggedIn={isLoggedIn} 
                />
              ))}
            </div>
          )}
        </div>
      </section>
        
      {/* Enhanced CTAs for Deal Hunters */}
      <section className="px-6 md:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Don't Miss the Next Unicorn
              </h3>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                Most deals last 7 days. If you're seeing this, you've already missed 3 deals this week. Stop paying full price for your stack.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link 
                  href={isLoggedIn ? "/deals" : "/sign-in"}
                  className="btn-organic bg-white hover:bg-gray-50 text-gray-900 px-10 py-4.5 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <Flame className="w-6 h-6 text-red-500" />
                  {isLoggedIn ? "Access All Deals" : "Join for Free"}
                </Link>
              </div>
              <p className="mt-8 text-sm text-gray-500 font-medium">
                100% Free for Hunters. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="px-6 md:px-8 py-16 bg-white">
        <div className="max-w-4xl mx-auto prose prose-lg text-gray-600">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 watercolor-text">Why Choose IndieSaasDeals?</h2>
          <p className="mb-4">
            Welcome to the premier marketplace for <strong>exclusive SaaS discounts</strong> tailored specifically for indie hackers, solopreneurs, and bootstrapped startup founders. We understand that every dollar counts when you're building a business from the ground up. That's why we partner directly with ambitious indie founders to bring you verified, high-value deals on the tools you need to ship faster.
          </p>
          <p className="mb-4">
            Unlike other deal sites that list abandonware or low-quality lifetime deals, <strong>IndieSaasDeals</strong> focuses on active, growing software products. Our rigorous verification process ensures that every tool listed on our platform is supported by a real team committed to long-term success. Whether you need marketing automation software, developer tools, design resources, or project management platforms, you'll find trusted solutions here at 50-80% off their regular price.
          </p>
          <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Curated for Builders, By Builders</h3>
          <p className="mb-4">
            Our community is built on trust and transparency. We manually vet every submission to guarantee it meets our high standards for quality and utility. By claiming a deal on our platform, you're not just saving money—you're supporting the indie maker ecosystem. Founders get early adopters and valuable feedback, while you get premium tools at a fraction of the cost. It's a win-win for the entire startup community.
          </p>
          <p>
            Join thousands of smart founders who use IndieSaasDeals to build their tech stack for less. From AI-powered writing assistants to no-code website builders, discover the next unicorn tool before it goes mainstream.
          </p>
        </div>
      </section>
    </div>
    
    {/* Email Capture Modal - DISABLED: Using SpinWheel instead */}
    {/* <BirdDogEmailModal /> */}
    
    </>
  )
}