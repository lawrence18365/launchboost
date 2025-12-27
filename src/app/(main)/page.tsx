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
    <div className="mb-4">
      <div className="w-full border-2 border-black bg-white text-black rounded-lg px-3 py-2 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Community savings:</span>
          <span className="sm:ml-1">${Number(totalSavings).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[40vw] sm:max-w-[50vw]">Hot now: {d?.product_name ?? 'Deal'}</span>
          {d?.discount_percentage ? (
            <Badge className="bg-black text-yellow-400">{d.discount_percentage}% OFF</Badge>
          ) : null}
          {saved > 0 ? (
            <span className="text-black/80">Save ${saved.toFixed(0)}</span>
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
        <div className={`${heroMode ? 'text-left' : 'text-center'} mb-8`}>
          {heroMode ? (
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-black mb-4">
              Hot Deals Right Now
            </h2>
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Hot Deals Right Now
            </h2>
          )}
          <p className={`text-base md:text-lg text-black/70 ${heroMode ? '' : 'font-medium'}`}>
            Fresh, verified discounts from indie SaaS founders — save on tools to build, launch, and grow.
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={`${heroMode || !showHeader ? 'justify-start' : 'justify-center'} flex mb-8 overflow-x-auto no-scrollbar -mx-2 px-2 md:mx-0 md:px-0 w-full`}>
        <div className="bg-white border-2 border-black rounded-full p-1 inline-flex whitespace-nowrap gap-1 shadow-lg w-max">
          {tabs.map(tab => {
            const TabIcon = tab.icon
            const tabDeals = getFilteredDeals(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-full font-bold transition-all text-xs md:text-sm ${
                  activeTab === tab.id 
                    ? 'bg-black text-yellow-400 shadow-md' 
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tabDeals.length > 0 && (
                  <Badge className={`ml-1 px-2 py-0.5 text-[10px] md:text-xs md:px-2.5 ${
                    activeTab === tab.id 
                      ? 'bg-yellow-400 text-black' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tabDeals.length}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Tab Content - Grid of exactly 4 deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {filteredDeals.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500 mb-2">
              {activeTab === 'ending' ? 'No deals ending soon' : 
               activeTab === 'new' ? 'Loading fresh deals...' :
               activeTab === 'discounts' ? 'Calculating biggest savings...' :
               ' Loading trending deals...'}
            </div>
            <p className="text-sm text-gray-400">Check back soon for updates!</p>
          </div>
        ) : (
          filteredDeals.slice(0, 4).map((deal, i) => (
            <div
              key={deal.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <QuickDealCard deal={deal} isLoggedIn={isLoggedIn} showVotes={activeTab === 'trending'} />
            </div>
          ))
        )}
      </div>
      
      {/* Show All Button */}
      {filteredDeals.length > 8 && (
        <div className="text-center mt-8">
          <Link 
            href={activeTab === 'ending' ? '/deals?filter=ending' : 
                  activeTab === 'new' ? '/deals?filter=new' :
                  activeTab === 'discounts' ? '/deals?sort=discount' :
                  '/deals?sort=popular'}
            className="bg-black text-yellow-400 px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            View All {tabs.find(t => t.id === activeTab)?.label} 
            <Badge className="bg-yellow-400 text-black ml-2">
              {filteredDeals.length}
            </Badge>
          </Link>
        </div>
      )}
    </div>
  )
}

// Above-the-fold hero wrapper combining intro + live deals with subtle animations
const AboveFoldHero = ({ allDeals, isLoggedIn }) => {
  return (
    <section className="relative bg-brand">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-14 md:pt-20 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live: {allDeals.length > 0 ? allDeals.length : '12'} Active Deals
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-black mb-6">
              SaaS Deals That <span className="underline decoration-yellow-400 decoration-4 underline-offset-4">Actually Work.</span>
            </h1>
            <p className="text-base md:text-lg text-black/80 max-w-xl mb-8 leading-relaxed font-medium">
              Stop buying "lifetime deals" for tools that die in a month. We manually verify every founder. No abandonedware. No fake markups. Just legitimate tools for builders who ship.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/deals" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Browse Verified Deals
              </Link>
              <Link 
                href="/dashboard/deals/new" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black bg-transparent border-2 border-black rounded-lg hover:bg-black/5 transition-all"
              >
                Submit a Deal
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-xs font-medium text-black/60">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Founder Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>30-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Direct Support</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 animate-fade-in">
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
    <Card className={`group relative overflow-hidden bg-white border-2 hover:shadow-2xl transition-all duration-300 h-full flex flex-col ${
      isUrgent ? 'border-red-500 animate-pulse' : 'border-black'
    }`}>
      {isUrgent && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-red-600 text-white text-xs py-1 px-2 text-center font-bold">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          ENDING SOON!
        </div>
      )}
      
      <CardContent className={`p-6 ${isUrgent ? 'pt-8' : ''} flex flex-col h-full`}>
        <div className="flex items-start justify-between mb-4">
          <Badge className={`font-bold px-3 py-1 ${
            isUrgent ? 'bg-red-600 text-white' : 'bg-black text-yellow-400'
          }`}>
            {deal.discount_percentage}% OFF
          </Badge>
          
          {/* Product Icon */}
          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center">
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
        
        <h3 className="text-xl font-bold text-black mb-2 line-clamp-2 min-h-[3.5rem]">{deal.product_name}</h3>
        <p className="text-gray-700 mb-4 text-sm line-clamp-2 min-h-[2.5rem]">{deal.short_description}</p>
        
        <div className="flex items-center gap-3 mb-4 min-h-[1.25rem]">
          <Badge variant="outline" className="text-xs">{deal.category}</Badge>
          {deal.review_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{deal.avg_rating}</span>
              <span>({deal.review_count})</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black">{formatPrice(deal.deal_price)}</span>
            <span className="text-lg text-gray-400 line-through">{formatPrice(deal.original_price)}</span>
          </div>
          {timeLeft && timeLeft > 0 && (
            <div className={`flex items-center gap-1 text-xs ${
              isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'
            }`}>
              <Clock className={`w-3 h-3 ${isUrgent ? 'animate-pulse' : ''}`} />
              {timeLeft}d left
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 text-xs">
          {/* Only show codes left if we have real data */}
          {realCodesLeft ? (
            <span className="text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {realCodesLeft} left
            </span>
          ) : (
            <span className="text-gray-500">
              Deal Active
            </span>
          )}
          <span className="text-green-600 font-semibold">
            Save ${(deal.original_price - deal.deal_price).toFixed(0)}
          </span>
        </div>
        
        <div className="space-y-3 mt-auto">
          <Link href={`/deals/${deal.slug || deal.id}`} className="block w-full">
            <button className={`w-full font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
              isUrgent 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-black hover:bg-gray-800 text-yellow-400'
            }`}>
              {isUrgent ? 'View Deal!' : 'View Deal'} <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link 
            prefetch={false}
            href={deal.product_website ? getExternalDealURL(deal.product_website, 'featuredDeal') : `/deals/${deal.slug || deal.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full text-center text-sm text-gray-600 hover:text-gray-800 underline"
            onClick={() => trackGoogleEvent('outbound_click', 'conversion', `featured_${deal.product_name}`)}
          >
            Get Deal →
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
    <Link prefetch={false} href={`/deals/${deal.slug || deal.id}`} className="block h-full">
      <div className={`bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer relative h-full min-h-[220px] flex flex-col justify-between ${
        isUrgent ? 'border-red-500 hover:border-red-600' : 'border-black hover:border-gray-800'
      }`}>
        {isUrgent && (
          <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
            URGENT!
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2 min-h-[1.25rem]">
          <h4 className="font-bold text-black text-sm line-clamp-1 flex-1 mr-2">{deal.product_name}</h4>
          
          {/* Product Icon */}
          <div className="w-8 h-8 rounded-md overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
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
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-black">{formatPrice(deal.deal_price)}</span>
            <span className="text-sm text-gray-400 line-through">{formatPrice(deal.original_price)}</span>
          </div>
          <Badge className={`text-[11px] font-bold rounded-full px-2 py-1 ${
            isUrgent ? 'bg-red-600 text-white' : 'bg-black text-yellow-400'
          }`}>
            {deal.discount_percentage}% OFF
          </Badge>
        </div>
        
        <div className="flex items-center justify-between min-h-[1.25rem]">
          {/* Only show codes left if we have real data */}
          {realCodesLeft ? (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {realCodesLeft} left
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Deal Active
            </span>
          )}
          
          <div className="flex items-center gap-2">
            {deal.review_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{deal.avg_rating}</span>
              </div>
            )}
            <span className="text-xs text-green-600 font-semibold">
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
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-gray-200 rounded-lg p-4 mb-8">
      <div className="flex items-center justify-center gap-8 text-center">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-lg font-bold text-black">{formatNumber(totalSavings)}</div>
            <div className="text-xs text-gray-600">Total Savings</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          <div>
            <div className="text-lg font-bold text-black">{activeDeals}</div>
            <div className="text-xs text-gray-600">Active Deals</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-lg font-bold text-black">Live</div>
            <div className="text-xs text-gray-600">Platform Status</div>
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
    <div className="min-h-screen">
      {/* Deal Hunter Optimized Hero Section */}
      <section className="px-6 md:px-8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          <AboveFoldHero allDeals={allDeals} isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="px-6 md:px-8 py-8 bg-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-black mb-4 flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-red-500" />
              Featured Deals
            </h2>
            <p className="text-lg text-black/70 font-medium max-w-2xl mx-auto">
              Hand-picked premium tools with the biggest discounts and shortest time left
            </p>
          </div>
            
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-64 bg-white/80 border-2 border-black">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-300 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredDeals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {/* Show REAL deals only */}
              {featuredDeals.slice(0, 3).map((deal) => (
                <FeaturedDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-black mb-4">Loading Fresh Deals...</h3>
              <p className="text-black/80 mb-6">We're updating the hottest deals for you!</p>
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
      <section className="px-6 md:px-8 py-12 bg-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-black mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-black/70 font-medium max-w-2xl mx-auto">
              Find deals tailored to your specific needs and workflow
            </p>
          </div>
            
          {loading ? (
            <div className="space-y-12">
              {categories.map((category, i) => (
                <div key={i} className="space-y-6">
                  <div className="h-8 bg-gray-300 rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="bg-white/80 border-2 border-black rounded-lg p-4 h-32">
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
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
      <section className="px-6 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black text-yellow-400 mb-6">
                Don't Miss the Next Unicorn
              </h3>
              <p className="text-xl text-yellow-100/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Most deals last 7 days. If you're seeing this, you've already missed 3 deals this week. Stop paying full price for your stack.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href={isLoggedIn ? "/deals" : "/sign-in"}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-full font-black text-lg transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Flame className="w-6 h-6" />
                  {isLoggedIn ? "Access All Deals" : "Join for Free"}
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                100% Free for Hunters. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    {/* Email Capture Modal - DISABLED: Using SpinWheel instead */}
    {/* <BirdDogEmailModal /> */}
    
    
    
    </>
  )
}