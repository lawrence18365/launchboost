"use client";

import { CheckCircle, Users, DollarSign, Zap, TrendingUp, Target, Code, Brain, Palette, Clock } from "lucide-react"
import Link from "next/link"

interface CategoryConfig {
  headline: string;
  subtext: string;
  socialProof: string;
  cta: string;
  browseCta: string;
  bgGradient: string;
  accentColor: string;
  targetAudience: string;
  keyMetrics: string[];
  icon: any;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  marketing: {
    headline: "Stop Wasting Budget on Tools That Don't Convert",
    subtext: "Exclusive deals on attribution, analytics & growth tools designed for marketing teams who need real ROI",
    socialProof: "Built for Marketing Teams",
    cta: "Find Tools That Drive ROI",
    browseCta: "Browse Marketing Deals",
    bgGradient: "from-blue-50 to-purple-50",
    accentColor: "text-blue-600",
    targetAudience: "Marketing Managers & Growth Teams",
    keyMetrics: ["Quality over quantity deals", "ROI-focused selection", "Easy integrations"],
    icon: Target
  },
  development: {
    headline: "Ship Faster with Tools That Actually Work",
    subtext: "DevOps, APIs & deployment tools at startup prices - no enterprise markup or vendor lock-in",
    socialProof: "Built for Developers",
    cta: "Build Better for Less",
    browseCta: "Browse Developer Tools",
    bgGradient: "from-green-50 to-blue-50",
    accentColor: "text-green-600", 
    targetAudience: "Developers & DevOps Teams",
    keyMetrics: ["Developer-first selection", "Startup-friendly pricing", "No vendor lock-in"],
    icon: Code
  },
  ai: {
    headline: "Automate the Boring Stuff, Focus on Strategy",
    subtext: "AI tools designed to save time without enterprise complexity or steep learning curves",
    socialProof: "Built for Productivity",
    cta: "Automate Your Workflow",
    browseCta: "Browse AI Tools",
    bgGradient: "from-purple-50 to-pink-50",
    accentColor: "text-purple-600",
    targetAudience: "Operations & Strategy Teams", 
    keyMetrics: ["Quick setup process", "No coding required", "Focus on results"],
    icon: Brain
  },
  design: {
    headline: "Create Like a Pro Without Pro Prices",
    subtext: "Design tools, assets & collaboration platforms for growing teams who need professional results",
    socialProof: "Built for Creatives",
    cta: "Design Better for Less",
    browseCta: "Browse Design Tools",
    bgGradient: "from-pink-50 to-orange-50",
    accentColor: "text-pink-600",
    targetAudience: "Designers & Creative Teams",
    keyMetrics: ["Professional quality tools", "Team collaboration focus", "Brand consistency"],
    icon: Palette
  },
  productivity: {
    headline: "Get More Done Without Burning Out",
    subtext: "Productivity tools that actually make your team more efficient instead of adding more complexity",
    socialProof: "Built for Efficiency",
    cta: "Work Smarter, Not Harder", 
    browseCta: "Browse Productivity Tools",
    bgGradient: "from-yellow-50 to-orange-50",
    accentColor: "text-orange-600",
    targetAudience: "Teams & Business Owners",
    keyMetrics: ["Simplicity focused", "Easy team adoption", "Workflow optimization"],
    icon: Clock
  }
};

// Default Deal Hunter Hero (fallback)
const DefaultDealHunterHero = ({ totalSavings, activeDeals, isLoggedIn }) => {
  return (
    <div className="mb-12 md:mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* Left: Copy */}
        <div>
          <div className="text-sm uppercase tracking-wide text-gray-500 mb-3">Exclusive SaaS Deals</div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-black leading-[1.1] max-w-2xl">
            Save big on tools that help you grow
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mt-6 max-w-2xl">
            Curated, verified discounts from independent SaaS founders. No fluff — just real savings on products you’ll actually use.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link 
              href={isLoggedIn ? '/deals?sort=discount' : '/sign-in'}
              className="inline-flex items-center justify-center rounded-lg bg-black text-yellow-400 px-6 py-3 font-semibold hover:bg-gray-900"
            >
              Browse Top Deals
            </Link>
            <Link 
              href={isLoggedIn ? '/categories' : '/sign-in'}
              className="inline-flex items-center justify-center rounded-lg border-2 border-black text-black px-6 py-3 font-semibold hover:bg-gray-50"
            >
              Explore by Category
            </Link>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            Join {Math.max(1, Math.round(totalSavings / 5000))} founders saving ${Math.round(totalSavings / 1000)}K+ across {activeDeals}+ live deals
          </div>
        </div>
        {/* Right: Visual collage */}
        <div className="order-first md:order-none">
          <div className="grid grid-cols-2 gap-4 max-w-md md:ml-auto">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-black">Verified Offer</div>
              <div className="mt-2 text-2xl font-bold text-black">40% OFF</div>
              <div className="mt-1 text-sm text-gray-500">Popular tool</div>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-black">Founding Member</div>
              <div className="mt-2 text-2xl font-bold text-black">Lifetime</div>
              <div className="mt-1 text-sm text-gray-500">Limited spots</div>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-black">Avg Savings</div>
              <div className="mt-2 text-2xl font-bold text-black">${Math.max(20, Math.round(totalSavings / (activeDeals || 1)))}+</div>
              <div className="mt-1 text-sm text-gray-500">Per deal</div>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-black">No Fake Hype</div>
              <div className="mt-2 text-2xl font-bold text-black">Real</div>
              <div className="mt-1 text-sm text-gray-500">Verified only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic Category Hero Component
export const CategoryAwareHero = ({ category = '', totalSavings = 0, activeDeals = 0, isLoggedIn = false }) => {
  const config = categoryConfigs[category];
  
  // If no specific category, use default deal hunter messaging
  if (!config) {
    return <DefaultDealHunterHero totalSavings={totalSavings} activeDeals={activeDeals} isLoggedIn={isLoggedIn} />;
  }
  
  return (
    <div className="mb-12 md:mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* Left: Copy */}
        <div>
          <div className={`text-sm uppercase tracking-wide mb-3 ${config.accentColor}`}>
            {config.targetAudience}
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-black leading-[1.1] max-w-2xl">
            {config.headline}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mt-6 max-w-2xl">
            {config.subtext}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link 
              href={isLoggedIn ? `/categories/${category}` : "/sign-in"}
              className="inline-flex items-center justify-center rounded-lg bg-black text-yellow-400 px-6 py-3 font-semibold hover:bg-gray-900"
            >
              {config.cta}
            </Link>
            <Link
              href={`/deals?category=${category}&sort=discount`}
              className="inline-flex items-center justify-center rounded-lg border-2 border-black text-black px-6 py-3 font-semibold hover:bg-gray-50"
            >
              {config.browseCta}
            </Link>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            ${Math.round(totalSavings / 1000)}K+ saved across {activeDeals}+ active {category} deals
          </div>
        </div>
        {/* Right: Visual collage */}
        <div className="order-first md:order-none">
          <div className="grid grid-cols-2 gap-4 max-w-md md:ml-auto">
            {config.keyMetrics.slice(0,4).map((metric, i) => (
              <div key={i} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-black">{metric}</div>
                <div className="mt-2 text-2xl font-bold text-black">
                  {i === 1 ? 'Lifetime' : i === 2 ? 'Fast' : i === 3 ? 'Simple' : 'Up to 60%'}
                </div>
                <div className="mt-1 text-sm text-gray-500">{i === 0 ? 'Popular picks' : i === 1 ? 'Limited spots' : i === 2 ? 'Setup' : 'Onboarding'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryAwareHero;
