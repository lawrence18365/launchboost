"use client";

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/client/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { User, AtSign, Building, FileText, Save, Loader2 } from 'lucide-react';
import { XFollow } from '@/components/social/x-follow';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    bio: '',
    twitterHandle: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/sign-in');
          return;
        }

        setUser(currentUser);

        // Fetch user profile
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          const userProfile = data.profile;
          setProfile(userProfile);
          
          setFormData({
            fullName: userProfile.full_name || '',
            companyName: userProfile.company_name || '',
            bio: userProfile.bio || '',
            twitterHandle: userProfile.twitter_handle || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router, toast]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean Twitter handle (remove @ if present)
      const cleanTwitterHandle = formData.twitterHandle.replace(/^@/, '');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          company_name: formData.companyName.trim(),
          bio: formData.bio.trim(),
          twitter_handle: cleanTwitterHandle.trim() || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        toast({
          title: 'Success',
          description: 'Your profile has been updated successfully!',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Profile Settings
          </h1>
          <p className="text-lg text-black/80 font-medium">
            Update your profile information to enhance your deal listings
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-2 border-black">
              <CardHeader className="border-b-2 border-black">
                <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="Your company or startup name"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterHandle">X (Twitter) Handle</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="twitterHandle"
                        placeholder="your_handle (without @)"
                        value={formData.twitterHandle}
                        onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Your X handle will be displayed on your deal pages to help users connect with you.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell people about yourself and your company..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-600">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <Button type="submit" disabled={saving} className="w-full md:w-auto">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="bg-white border-2 border-black">
              <CardHeader className="border-b-2 border-black">
                <CardTitle className="text-lg font-bold text-black">Account</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-sm">
                    <strong>Role:</strong>{' '}
                    <Badge variant="secondary">
                      {profile?.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-white border-2 border-black">
              <CardHeader className="border-b-2 border-black">
                <CardTitle className="text-lg font-bold text-black">Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black border-2 border-black rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-yellow-400">
                        {(formData.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-black">
                        {formData.fullName || 'Your Name'}
                      </h3>
                      {formData.companyName && (
                        <p className="text-sm text-black/70">{formData.companyName}</p>
                      )}
                    </div>
                  </div>

                  {formData.bio && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 p-3 rounded-lg">
                      <p className="text-sm text-black/80">{formData.bio}</p>
                    </div>
                  )}

                  {formData.twitterHandle && (
                    <XFollow
                      handle={formData.twitterHandle}
                      displayName={formData.fullName}
                      variant="card"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
