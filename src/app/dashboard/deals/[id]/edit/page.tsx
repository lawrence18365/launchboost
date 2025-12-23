"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/client/auth';
import { StagedImageUpload, StagedImageUploadRef } from '@/components/ui/staged/staged-image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Lightbulb, DollarSign, Calendar, Tag, Zap, CheckCircle, AlertCircle, Info } from 'lucide-react';

// --- Helper Data & Components ---

// Categories that match the database enum EXACTLY
const categories = [
  { value: "AI & Machine Learning", label: "AI & Machine Learning" },
  { value: "Analytics & Data", label: "Analytics & Data" },
  { value: "Business & Finance", label: "Business & Finance" },
  { value: "Communication & Collaboration", label: "Communication & Collaboration" },
  { value: "Design & Creative", label: "Design & Creative" },
  { value: "Developer Tools", label: "Developer Tools" },
  { value: "E-commerce & Retail", label: "E-commerce & Retail" },
  { value: "Education & Learning", label: "Education & Learning" },
  { value: "Healthcare & Wellness", label: "Healthcare & Wellness" },
  { value: "HR & Recruiting", label: "HR & Recruiting" },
  { value: "Marketing & Growth", label: "Marketing & Growth" },
  { value: "Productivity & Organization", label: "Productivity & Organization" },
  { value: "Sales & CRM", label: "Sales & CRM" },
  { value: "Security & Privacy", label: "Security & Privacy" },
  { value: "Social & Community", label: "Social & Community" },
];


// --- Reusable UI Components ---
// Now provided via shared components in /components/ui

// --- Main Component ---
export default function EditDealPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productName: '', productWebsite: '', title: '', description: '',
    shortDescription: '', category: '', originalPrice: '', dealPrice: '',
    totalCodes: '', expiresAt: '', tags: [], iconUrl: '',
    redemptionInstructions: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'submitting', 'success'
  const [step, setStep] = useState(1);
  const [hasStagedFile, setHasStagedFile] = useState(false);
  const imageUploadRef = useRef<StagedImageUploadRef>(null);
  const [canEdit, setCanEdit] = useState(false);

  // Check authentication and load deal
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authenticated
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/sign-in');
          return;
        }
        setUser(currentUser);

        // Fetch deal data
        const response = await fetch(`/api/deals/${params.id}/edit`);
        if (!response.ok) {
          if (response.status === 403) {
            toast({
              title: 'Permission denied',
              description: 'You do not have permission to edit this deal.',
              variant: 'destructive',
            });
            router.push('/dashboard/deals');
            return;
          }
          if (response.status === 404) {
            toast({ title: 'Deal not found', description: 'The requested deal could not be found.', variant: 'destructive' });
            router.push('/dashboard/deals');
            return;
          }
          throw new Error('Failed to fetch deal');
        }

        const data = await response.json();
        const dealData = data.deal;
        
        // Check if user owns this deal
        if (dealData.founder_id !== currentUser.id) {
          toast({ title: 'Not your deal', description: 'You can only edit your own deals.', variant: 'destructive' });
          router.push('/dashboard/deals');
          return;
        }

        // Check if deal can be edited based on status
        const editableStatuses = ['draft', 'pending_review', 'rejected'];
        if (!editableStatuses.includes(dealData.status)) {
          setCanEdit(false);
        } else {
          setCanEdit(true);
        }

        setDeal(dealData);
        
        // Pre-populate form with existing data
        setFormData({
          productName: dealData.product_name || '',
          productWebsite: dealData.product_website || '',
          title: dealData.title || '',
          description: dealData.description || '',
          shortDescription: dealData.short_description || '',
          category: dealData.category || '',
          originalPrice: ((dealData.original_price || 0) / 100).toString(),
          dealPrice: ((dealData.deal_price || 0) / 100).toString(),
          totalCodes: (dealData.total_codes || '').toString(),
          expiresAt: dealData.expires_at ? dealData.expires_at.split('T')[0] : '',
          tags: dealData.tags || [],
          iconUrl: dealData.product_logo_url || '',
          redemptionInstructions: dealData.redemption_instructions || ''
        });

      } catch (error) {
        console.error('Error loading deal:', error);
        toast({ title: 'Failed to load deal', description: 'Please try again.', variant: 'destructive' });
        router.push('/dashboard/deals');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, router]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateFormData('tags', [...formData.tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice);
    const deal = parseFloat(formData.dealPrice);
    if (original > 0 && deal >= 0 && deal < original) {
      return Math.round(((original - deal) / original) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmissionStatus('submitting');
    
    try {
      // Step 1: Upload image if one is staged
      let finalIconUrl = formData.iconUrl;
      
      if (hasStagedFile && imageUploadRef.current) {
        const uploadedUrl = await imageUploadRef.current.uploadToCloud();
        if (uploadedUrl) {
          finalIconUrl = uploadedUrl;
        } else {
          setSubmissionStatus(null);
          toast({ title: 'Upload failed', description: 'Could not upload the image. Please try again.', variant: 'destructive' });
          return;
        }
      }
      
      // Step 2: Update deal
      const dealData = {
        ...formData,
        iconUrl: finalIconUrl,
        redemptionInstructions: formData.redemptionInstructions.trim() || null
      };
      
      const response = await fetch(`/api/deals/${params.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmissionStatus('success');
        console.log('Deal updated successfully:', result.deal);
        // Redirect to deal page after success
        setTimeout(() => {
          router.push(`/dashboard/deals/${params.id}`);
        }, 2000);
      } else {
        console.error('Error updating deal:', result.error);
        setSubmissionStatus(null);
        toast({ title: 'Update failed', description: result.error || 'Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmissionStatus(null);
      toast({ title: 'Network error', description: 'Please check your connection and try again.', variant: 'destructive' });
    }
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-foreground border-t-transparent"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-card border rounded-lg p-8">
            <AlertCircle className="h-4 w-4 mr-2 inline" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Deal Not Found</h1>
            <p className="text-muted-foreground mb-8">The deal you're trying to edit doesn't exist or you don't have permission to edit it.</p>
            <Button asChild>
              <Link href="/dashboard/deals">Back to My Deals</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-card border rounded-lg p-8">
            <AlertCircle className="h-4 w-4 mr-2 inline" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Cannot Edit Deal</h1>
            <p className="text-muted-foreground mb-4">This deal cannot be edited because it's currently <strong>{deal.status}</strong>.</p>
            <p className="text-muted-foreground mb-8 text-sm">You can only edit deals that are in draft, pending review, or rejected status.</p>
            <Button asChild>
              <Link href={`/dashboard/deals/${params.id}`}>View Deal</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (submissionStatus === 'success') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-2xl mx-auto px-6 text-center">
              <div className="bg-card border rounded-2xl p-12 shadow-lg">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-6">Deal Updated Successfully!</h1>
                <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                  Your deal has been updated. You'll be redirected to your deal dashboard shortly.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/deals/${params.id}`}>
                    View Updated Deal
                  </Link>
                </Button>
              </div>
            </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/dashboard/deals/${params.id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium transition-colors mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deal
            </Link>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Edit Deal
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium mb-4">
                Update your deal information
              </p>
              <div className="bg-card border rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Status:</strong> <span className="capitalize">{deal.status}</span>
                  {deal.status === 'rejected' && deal.rejection_reason && (
                    <span className="block mt-2 text-red-700">
                      <strong>Rejection reason:</strong> {deal.rejection_reason}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-16">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className="flex items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg ${
                      step >= stepNumber 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background border text-foreground'
                    }`}>
                      {step > stepNumber ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                  </div>
                  {stepNumber < 4 && (
                    <div className={`h-2 w-16 rounded-full ${
                      step > stepNumber ? 'bg-primary' : 'bg-background border'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: Product Information */}
            <div style={{ display: step === 1 ? 'block' : 'none' }} className="bg-card border text-foreground rounded-2xl shadow-lg">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2"><Lightbulb className="h-5 w-5" /> <span>Product Information</span></h3>
                <p className="text-sm text-muted-foreground">Update your SaaS product information.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input 
                      id="productName" 
                      placeholder="e.g., TaskFlow Pro" 
                      value={formData.productName} 
                      onChange={(e) => updateFormData('productName', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productWebsite">Product Website *</Label>
                    <Input 
                      id="productWebsite" 
                      type="url" 
                      placeholder="https://your-product.com" 
                      value={formData.productWebsite} 
                      onChange={(e) => updateFormData('productWebsite', e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => updateFormData('category', v)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Deal Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., 50% off TaskFlow Pro - Limited Time" 
                    value={formData.title} 
                    onChange={(e) => updateFormData('title', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea 
                    id="shortDescription" 
                    placeholder="Brief description for deal cards (max 150 characters)" 
                    value={formData.shortDescription} 
                    onChange={(e) => updateFormData('shortDescription', e.target.value)} 
                    maxLength={150} 
                    rows={3} 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">{formData.shortDescription.length}/150 characters</p>
                </div>
                
                <div className="space-y-2">
                  <StagedImageUpload
                    ref={imageUploadRef}
                    onFileSelect={(file) => setHasStagedFile(file !== null)}
                    folder="deal-icons"
                    label="Product Icon/Logo (Optional)"
                    description="Select your product icon or logo (PNG, JPEG, WebP, GIF - max 5MB)"
                    className=""
                    initialImage={formData.iconUrl}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: A clear, simple icon works best. Square format (1:1 ratio) recommended.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 2: Deal Details */}
            <div style={{ display: step === 2 ? 'block' : 'none' }} className="bg-card border text-foreground rounded-2xl shadow-lg">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2"><DollarSign className="h-5 w-5" /> <span>Deal Details</span></h3>
                <p className="text-sm text-muted-foreground">Update your pricing and deal terms.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price ($) *</Label>
                    <Input 
                      id="originalPrice" 
                      type="number" 
                      placeholder="99.00" 
                      value={formData.originalPrice} 
                      onChange={(e) => updateFormData('originalPrice', e.target.value)} 
                      required 
                      min="0" 
                      step="0.01" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealPrice">Deal Price ($) *</Label>
                    <Input 
                      id="dealPrice" 
                      type="number" 
                      placeholder="49.00" 
                      value={formData.dealPrice} 
                      onChange={(e) => updateFormData('dealPrice', e.target.value)} 
                      required 
                      min="0" 
                      step="0.01" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <div className="flex items-center h-10 px-3 border rounded-lg bg-background">
                      <Badge variant="secondary" className="font-bold text-lg">{calculateDiscount()}% OFF</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Deal Expiration *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="expiresAt" 
                        type="date" 
                        className="pl-9" 
                        value={formData.expiresAt} 
                        onChange={(e) => updateFormData('expiresAt', e.target.value)} 
                        required 
                        min={new Date().toISOString().split('T')[0]} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Description & Tags */}
            <div style={{ display: step === 3 ? 'block' : 'none' }} className="bg-card border text-foreground rounded-2xl shadow-lg">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2"><Tag className="h-5 w-5" /> <span>Description & Tags</span></h3>
                <p className="text-sm text-muted-foreground">Update your deal description and tags.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your product, what makes it special..." 
                    value={formData.description} 
                    onChange={(e) => updateFormData('description', e.target.value)} 
                    rows={6} 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">Be detailed! This helps users understand your value.</p>
                </div>
                <div className="space-y-2">
                  <Label>Tags (Optional)</Label>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Add a tag and press Enter" 
                      value={currentTag} 
                      onChange={(e) => setCurrentTag(e.target.value)} 
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); 
                          addTag();
                        }
                      }} 
                    />
                    <Button type="button" onClick={addTag} size="sm">Add</Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        >
                          {tag} &times;
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 4: Additional Details */}
            <div style={{ display: step === 4 ? 'block' : 'none' }} className="bg-card border text-foreground rounded-2xl shadow-lg">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Additional Details</span>
                </h3>
                <p className="text-sm text-muted-foreground">Update redemption instructions and other details.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="redemptionInstructions">Redemption Instructions (Optional)</Label>
                  <Textarea
                    id="redemptionInstructions"
                    placeholder="e.g., 'Apply this code at checkout on our website to get your discount' or 'Use this code when signing up for our Pro plan'"
                    value={formData.redemptionInstructions}
                    onChange={(e) => updateFormData('redemptionInstructions', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Help users understand how to use their discount code (optional but recommended).
                  </p>
                </div>

                <div className="bg-card border rounded-xl p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Deal Summary</span>
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Product:</strong> {formData.productName || '...'}</p>
                    <p><strong>Discount:</strong> {calculateDiscount()}% off (${formData.dealPrice || '0'} instead of ${formData.originalPrice || '0'})</p>
                    <p><strong>Expires:</strong> {formData.expiresAt || '...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
                )}
              </div>
              <div>
                {step < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={submissionStatus === 'submitting'}>
                    {submissionStatus === 'submitting' ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Update Deal
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
