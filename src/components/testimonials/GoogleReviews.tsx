'use client';

import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: string;
  author: string;
  role: string;
  company: string;
  timeAgo: string;
  text: string;
  rating: number;
}

interface TrustedBusiness {
  name: string;
  logo?: string;
}

const reviews: Review[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    role: 'Founder',
    company: 'Ethereal Painters',
    timeAgo: '2 months ago',
    text: 'Our leads went from 2-3 per month to 47 in the first month. The scrollytelling approach made our services feel premium and trustworthy.',
    rating: 5
  },
  {
    id: '2',
    author: 'Marcus Rodriguez',
    role: 'CEO',
    company: 'Apex Landscaping',
    timeAgo: '3 months ago',
    text: 'Finally, a web designer who understands business. Our conversion rate tripled and the site loads instantly on mobile.',
    rating: 5
  },
  {
    id: '3',
    author: 'Lisa Thompson',
    role: 'Creative Director',
    company: 'Modern Interiors',
    timeAgo: '1 month ago',
    text: 'The attention to performance and user experience is incredible. We\'re booking more consultations than ever before.',
    rating: 5
  }
];

const trustedBusinesses: TrustedBusiness[] = [
  { name: 'Ethereal Painters' },
  { name: 'Apex Landscaping' },
  { name: 'Modern Interiors' },
  { name: 'Vancouver Coffee Co.' },
  { name: 'Peak Performance Gym' },
  { name: 'Coastal Real Estate' }
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ))}
  </div>
);

export default function GoogleReviews() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl md:text-5xl font-bold text-black">5.0</div>
            <div className="flex flex-col items-start">
              <StarRating rating={5} />
              <p className="text-sm text-gray-600 mt-1">Based on 28 reviews</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 font-medium">Vancouver, BC</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-16">
          {reviews.map((review) => (
            <Card key={review.id} className="h-full border-2 border-gray-100 hover:border-gray-200 transition-colors">
              <CardContent className="p-6 md:p-8 h-full flex flex-col">
                {/* Quote */}
                <div className="flex-1 mb-6">
                  <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                    "{review.text}"
                  </p>
                </div>
                
                {/* Author Info */}
                <div className="border-t pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {review.author}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {review.role}, {review.company}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {review.timeAgo}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trusted Businesses */}
        <div className="border-t border-gray-200 pt-12 md:pt-16">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Trusted by Vancouver businesses
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {trustedBusinesses.map((business, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 md:p-6 text-center hover:bg-gray-100 transition-colors"
              >
                <div className="text-sm md:text-base font-medium text-gray-700 leading-tight">
                  {business.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}