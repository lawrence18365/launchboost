"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DealCard = ({ deal }: any) => {
  const formatPrice = (price: any) => {
    const priceInDollars = price > 999 ? price / 100 : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInDollars);
  };

  const isExpired = deal.expires_at && new Date(deal.expires_at) < new Date();
  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-white border-2 border-black rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant={deal.pricing_tier === 'free' ? 'secondary' : 'default'} className="bg-black text-yellow-400 font-bold">
              {deal.pricing_tier === 'free' ? 'Free' : 
               deal.pricing_tier === 'featured' ? 'Featured' : 'Premium'}
            </Badge>
            {isExpired && <Badge variant="destructive">Expired</Badge>}
          </div>
        </div>
        <CardTitle className="text-xl line-clamp-2 text-black">{deal.product_name}</CardTitle>
        <p className="text-black/80 text-sm line-clamp-3 font-medium">
          {deal.short_description}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(deal.deal_price)}
            </span>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(deal.original_price)}
            </span>
            <Badge className="ml-auto bg-green-100 text-green-800 font-bold">
              {deal.discount_percentage}% OFF
            </Badge>
          </div>

          {/* Deal Stats */}
          <div className="flex items-center justify-between text-sm text-black/60">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {deal.codes_remaining || 0} left
            </span>
            {timeLeft !== null && timeLeft > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeLeft} day{timeLeft !== 1 ? '&apos;s&apos;' : '&apos;&apos;'} left
              </span>
            )}
          </div>

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deal.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs border-black text-black">
                  {tag}
                </Badge>
              ))}
              {deal.tags.length > 3 && (
                <Badge variant="outline" className="text-xs border-black text-black">
                  +{deal.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* CTA Button */}
          <Link href={`/deals/${deal.slug || deal.id}`} className="block w-full">
            <Button className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-bold rounded-full">
              {isExpired ? 'View Deal' : 'Get Deal'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CollectionDealsBrowser({ initialDeals, title }: { initialDeals: any[], title: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredDeals = initialDeals.filter(deal => {
    const matchesSearch = deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'discount':
        return (b.discount_percentage || 0) - (a.discount_percentage || 0);
      case 'ending':
        if (!a.expires_at) return 1;
        if (!b.expires_at) return -1;
        return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
      case 'popular':
        return (b.views_count || 0) - (a.views_count || 0);
      default:
        return 0;
    }
  });

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 mb-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <option value="newest">Newest First</option>
            <option value="discount">Best Discount</option>
            <option value="ending">Ending Soon</option>
            <option value="popular">Most Popular</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-black/80 font-medium">
            <TrendingUp className="w-4 h-4" />
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      {sortedDeals.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-black mb-4">
            No deals found in {title}
          </h3>
          <p className="text-black/80 font-medium mb-8">
            Try adjusting your search criteria or check back later for new deals.
          </p>
          <Link href="/deals" className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-flex items-center">
            Browse All Deals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-black mb-4">
            Have a deal for this collection?
          </h2>
          <p className="text-black/80 font-medium mb-8">
            Join IndieSaasDeals and get your product in front of thousands of early adopters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard/deals/new" 
              className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-8 rounded-full transition-colors duration-200 inline-flex items-center justify-center"
            >
              Submit Your Deal
            </Link>
            <Link 
              href="/deals" 
              className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-8 rounded-full border-2 border-black transition-colors duration-200 inline-flex items-center justify-center"
            >
              Browse All Deals
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
