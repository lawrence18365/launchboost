"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/client/auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Users, Star, Tag, Calendar, Zap, Shield, CheckCircle, Flame, Trophy, Timer } from 'lucide-react';
import { trackFacebookEvent } from '@/components/analytics/FacebookPixel';
import DealStructuredData from '@/components/seo/DealStructuredData';
import { XFollow } from '@/components/social/x-follow';
import { SharePack } from '@/components/deals/SharePack';
import { getExternalDealURL } from '@/lib/utm';
import { NewsletterSignup } from '@/components/marketing/NewsletterSignup';

import { trackGoogleEvent } from '@/components/analytics/GoogleAnalytics';

// --- UI Components ---
const Button = ({ children, variant = 'default', className = '', onClick, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants: any = {
    default: "bg-black text-yellow-400 hover:bg-gray-800 h-12 px-6 py-3",
    outline: "border-2 border-black bg-white hover:bg-gray-100 h-12 px-6 py-3 text-black",
    urgent: "bg-red-600 text-white hover:bg-red-700 h-12 px-6 py-3",
    primary: "bg-black text-yellow-400 hover:bg-gray-800 h-12 px-7 py-3 text-base"
  };
  return <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

interface DealViewProps {
  deal: any; // Using any to match existing loose typing, can be tightened later
}

export default function DealView({ deal }: DealViewProps) {
  const [claiming, setClaiming] = useState(false);
  const router = useRouter();

  const handleOutboundClick = (type: string) => {
    trackGoogleEvent('outbound_click', 'conversion', `${deal.product_name} - ${type}`);
  };

  // Track view on mount
  useState(() => {
    if (deal) {
      trackFacebookEvent('ViewContent', {
        content_name: deal.product_name || 'Deal',
        content_type: 'deal',
        content_ids: [deal.slug || deal.id],
        value: deal.deal_price ? parseFloat(deal.deal_price) / 100 : 0,
        currency: 'USD'
      });
    }
  });

  const handleClaimDeal = async () => {
    // Check if user is authenticated before claiming
    const user = await getCurrentUser()
    if (!user) {
      router.push('/sign-in')
      return
    }
    
    setClaiming(true);
    try {
      const response = await fetch(`/api/public/deals/${deal.slug}/claim`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Deal claimed successfully! Check your email for the code.');
        router.refresh(); // Refresh to update codes remaining
      } else {
        alert(result.error || 'Failed to claim deal');
      }
    } catch (error) {
      console.error('Error claiming deal:', error);
      alert('Failed to claim deal. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const formatPrice = (price: number) => {
    const priceInDollars = price > 999 ? price / 100 : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInDollars);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!deal) return null;

  const isExpired = deal.expires_at && new Date(deal.expires_at) < new Date();
  const canClaim = deal.status === 'live' && !isExpired && deal.codes_remaining > 0;
  const discountAmount = deal.original_price - deal.deal_price;
  const savings = Math.round((discountAmount / deal.original_price) * 100);
  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = timeLeft !== null && timeLeft <= 3;
  const codesLeft = deal.codes_remaining || 0;

  return (
    <>
      <DealStructuredData deal={deal} />
      <div className="min-h-screen bg-brand">
      {/* Navigation */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/deals" 
            className="inline-flex items-center text-black hover:text-black/80 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ← Back to All Deals
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Status Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge className={`font-bold px-3 py-1.5 text-sm ${isUrgent ? 'bg-red-600 text-white' : 'bg-black text-yellow-400'}`}>
                  {savings}% OFF
                </Badge>
                <Badge className="bg-white border-2 border-black text-black font-bold px-2.5 py-1 text-sm">
                  {deal.category}
                </Badge>
                {isExpired && (
                  <Badge className="bg-red-600 text-white font-bold px-2.5 py-1 text-sm">
                    Expired
                  </Badge>
                )}
                {isUrgent && (
                  <Badge className="bg-red-600 text-white font-bold px-2.5 py-1 text-sm">
                    <Timer className="w-3 h-3 mr-1" />
                    Ending soon
                  </Badge>
                )}
              </div>
              
              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-black leading-tight">
                  {deal.product_name}
                </h1>
                <p className="text-lg text-black/80 leading-relaxed font-medium">
                  {deal.short_description}
                </p>
              </div>
              
              {/* Pricing Card */}
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-3xl lg:text-4xl font-bold text-black">
                    {formatPrice(deal.deal_price)}
                  </div>
                  <div className="text-xl text-black/50 line-through">
                    {formatPrice(deal.original_price)}
                  </div>
                </div>
                <div className="bg-black text-yellow-400 font-bold px-2.5 py-1.5 text-sm rounded inline-block mb-2">
                  Save {formatPrice(discountAmount)}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-4">
                {canClaim ? (
                  <Link 
                    prefetch={false}
                    href={deal.product_website ? getExternalDealURL(deal.product_website, 'dealPage') : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                    onClick={() => handleOutboundClick('claim_button')}
                  >
                    <Button 
                      variant={isUrgent ? "urgent" : "primary"}
                      className="w-full sm:w-auto"
                    >
                      <div className="flex items-center gap-3">
                        <Flame className="w-6 h-6" />
                        {isUrgent ? 'Claim now' : 'Get this deal'}
                      </div>
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full sm:w-auto bg-gray-400 text-white">
                    {isExpired ? 'Deal Expired' : 
                     deal.codes_remaining === 0 ? 'Sold Out' : 
                     'Unavailable'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full sm:w-auto ml-0 sm:ml-4"
                  onClick={() => {
                    handleOutboundClick('website_button');
                    window.open(deal.product_website, '_blank');
                  }}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Visit Website
                </Button>
              </div>
              
              {/* Deal Stats */}
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-black">{codesLeft}</div>
                    <div className="text-sm text-black/70 font-medium">Codes Left</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">{timeLeft !== null && timeLeft >= 0 ? timeLeft : '∞'}</div>
                    <div className="text-sm text-black/70 font-medium">{timeLeft !== null ? 'Days Left' : 'No Expiry'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Product Visual */}
            <div className="relative">
              <div className="bg-white border-2 border-black rounded-lg p-6 h-64 flex items-center justify-center">
                {deal.product_logo_url ? (
                  <img 
                    src={deal.product_logo_url} 
                    alt={deal.product_name}
                    className="max-w-full max-h-56 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <Zap className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-black text-sm">Secure</div>
                </div>
                <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-black text-sm">Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Description */}
              <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow">
                <CardHeader className="border-b-2 border-black">
                  <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    About {deal.product_name || deal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-black/80 text-lg font-medium">{deal.description}</p>
                  </div>
                  
                  {deal.tags && deal.tags.length > 0 && (
                    <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 text-black">Features & Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {deal.tags.map((tag: string, index: number) => (
                          <Badge key={index} className="bg-white border-2 border-black text-black font-bold px-3 py-1 hover:bg-yellow-100 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deal Information */}
              <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow">
                <CardHeader className="border-b-2 border-black">
                  <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Deal Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-black font-bold">Available Codes</span>
                      <span className="font-bold text-black">{codesLeft}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 border border-black">
                      <div 
                        className="bg-black h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(10, Math.min(100, (codesLeft / 100) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-black/70 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Expires
                      </span>
                      <span className="font-bold text-black">
                        {deal.expires_at ? formatDate(deal.expires_at) : 'Never'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-black/70 font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Type
                      </span>
                      <span className="font-bold text-black capitalize">{deal.deal_type || 'Discount'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-black/70 font-medium">Tier</span>
                      <Badge className={`font-bold ${
                        deal.pricing_tier === 'free' ? 'bg-gray-100 text-gray-800 border border-gray-300' : 
                        deal.pricing_tier === 'featured' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                        'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {deal.pricing_tier === 'free' ? 'Free' : 
                         deal.pricing_tier === 'featured' ? 'Featured' : 'Premium'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Sidebar */}
              <NewsletterSignup location="deal_sidebar" variant="sidebar" />

              {/* Founder */}
              {deal.founder && (
                <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow">
                  <CardHeader className="border-b-2 border-black">
                    <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Meet the Founder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black border-2 border-black rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-yellow-400">
                            {(deal.founder.full_name || 'F').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-black text-lg">{deal.founder.full_name || 'Founder'}</h3>
                          {deal.founder.company_name && (
                            <p className="text-black/70 font-medium">{deal.founder.company_name}</p>
                          )}
                        </div>
                      </div>
                      {deal.founder.bio && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                          <p className="text-black/80 leading-relaxed font-medium">{deal.founder.bio}</p>
                        </div>
                      )}
                      {deal.founder.twitter_handle && (
                        <div>
                          <XFollow 
                            handle={deal.founder.twitter_handle}
                            displayName={deal.founder.full_name}
                            variant="card"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Share Pack */}
              <SharePack deal={deal} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
