"use client";

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/client/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Eye, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';

// Use shared Button from components/ui

const DealCard = ({ deal, onEdit, onView }) => {
  const formatPrice = (price) => {
    const priceInDollars = price > 999 ? price / 100 : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInDollars);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = deal.expires_at && new Date(deal.expires_at) < new Date();
  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const canEdit = ['draft', 'pending_review', 'rejected'].includes(deal.status);

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'paused': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'expired': return 'bg-gray-100 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={`font-bold border-2 ${getStatusColor(deal.status)}`}>
              {deal.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline" className="border">
              {deal.category}
            </Badge>
            {isExpired && <Badge className="bg-red-600 text-white border-2 border-red-700">EXPIRED</Badge>}
          </div>
        </div>
        
        <div className="space-y-2">
          <CardTitle className="text-xl line-clamp-2 text-foreground">
            {deal.product_name}
          </CardTitle>
          <p className="text-muted-foreground text-sm line-clamp-2 font-medium">
            {deal.short_description}
          </p>
        </div>

        {deal.status === 'rejected' && deal.rejection_reason && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-800 mb-1">Rejection Reason:</p>
                <p className="text-xs text-red-700">{deal.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(deal.deal_price)}
          </span>
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(deal.original_price)}
          </span>
          <Badge className="ml-auto bg-primary text-primary-foreground font-bold">
            {deal.discount_percentage}% OFF
          </Badge>
        </div>

        {/* Deal Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-medium">
              {deal.codes_remaining || 0} codes left
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-medium">
              {deal.views_count || 0} views
            </span>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 col-span-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="font-medium">
                {timeLeft > 0 ? `${timeLeft} days left` : 'Expired'}
              </span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Created:</strong> {formatDate(deal.created_at)}</p>
          <p><strong>Expires:</strong> {deal.expires_at ? formatDate(deal.expires_at) : 'Never'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onView(deal)} className="flex-1">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {canEdit && (
            <Button variant="default" size="sm" onClick={() => onEdit(deal)} className="flex-1">
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MyDealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/sign-in');
          return;
        }
        setUser(currentUser);

        // Fetch user's deals
        const response = await fetch('/api/user/deals');
        if (response.ok) {
          const data = await response.json();
          setDeals(data.deals || []);
        } else {
          console.error('Failed to fetch deals');
        }
      } catch (error) {
        console.error('Error loading deals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleEditDeal = (deal) => {
    router.push(`/dashboard/deals/${deal.id}/edit`);
  };

  const handleViewDeal = (deal) => {
    router.push(`/dashboard/deals/${deal.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-64 bg-foreground/10 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-card/80 border rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const draftDeals = deals.filter(deal => deal.status === 'draft');
  const pendingDeals = deals.filter(deal => deal.status === 'pending_review');
  const liveDeals = deals.filter(deal => deal.status === 'live');
  const rejectedDeals = deals.filter(deal => deal.status === 'rejected');
  const otherDeals = deals.filter(deal => !['draft', 'pending_review', 'live', 'rejected'].includes(deal.status));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Deals
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Manage your submitted deals and track their performance
            </p>
          </div>
          <Link href="/dashboard/deals/new">
            <Button size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Submit New Deal
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-black mb-2">{deals.length}</div>
              <div className="text-sm font-medium text-gray-600">Total Deals</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{liveDeals.length}</div>
              <div className="text-sm font-medium text-gray-600">Live Deals</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{pendingDeals.length}</div>
              <div className="text-sm font-medium text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-600 mb-2">{draftDeals.length}</div>
              <div className="text-sm font-medium text-gray-600">Drafts</div>
            </CardContent>
          </Card>
        </div>

        {deals.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="bg-card border rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted border rounded-full flex items-center justify-center mx-auto mb-8">
                <Plus className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">No deals yet</h3>
              <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                Start sharing your SaaS discounts with our community. It's completely free!
              </p>
              <Link href="/dashboard/deals/new">
                <Button size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Submit Your First Deal
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Deals sections
          <div className="space-y-12">
            {/* Rejected Deals - Show first if any */}
            {rejectedDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  Rejected Deals ({rejectedDeals.length})
                </h2>
                <p className="text-black/70 mb-6 font-medium">
                  These deals need attention. Click "Edit" to address the issues and resubmit.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rejectedDeals.map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onEdit={handleEditDeal}
                      onView={handleViewDeal}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Draft Deals */}
            {draftDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  Draft Deals ({draftDeals.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftDeals.map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onEdit={handleEditDeal}
                      onView={handleViewDeal}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pending Review */}
            {pendingDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  Pending Review ({pendingDeals.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingDeals.map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onEdit={handleEditDeal}
                      onView={handleViewDeal}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Live Deals */}
            {liveDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Live Deals ({liveDeals.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveDeals.map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onEdit={handleEditDeal}
                      onView={handleViewDeal}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other Deals */}
            {otherDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-6">
                  Other Deals ({otherDeals.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherDeals.map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onEdit={handleEditDeal}
                      onView={handleViewDeal}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
