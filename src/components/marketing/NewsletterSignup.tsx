"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackGoogleEvent } from '@/components/analytics/GoogleAnalytics';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterSignup({ location = 'unknown', variant = 'default' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    
    // Simulate API call - In production, replace with real API
    // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
    
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      
      // Track conversion in GA4
      trackGoogleEvent('sign_up_newsletter', 'engagement', location);
      
      // Persist subscription state locally to avoid annoying user
      localStorage.setItem('indiesaasdeals-newsletter-subscribed', 'true');
      
      toast.success("Welcome to the club! 🚀");
    }, 800);
  };

  if (subscribed) {
    return (
      <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center ${variant === 'sidebar' ? '' : 'max-w-xl mx-auto'}`}>
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-800 mb-2">You're in!</h3>
        <p className="text-green-700">Keep an eye on your inbox for exclusive deals.</p>
      </div>
    );
  }

  const isSidebar = variant === 'sidebar';

  return (
    <div className={`
      relative overflow-hidden
      ${isSidebar ? 'bg-yellow-50 border-2 border-yellow-400 p-6 rounded-xl' : 'bg-black text-white p-8 md:p-12 rounded-3xl shadow-xl'}
    `}>
      {/* Decorative Elements */}
      {!isSidebar && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"></div>
        </>
      )}

      <div className={`relative z-10 ${isSidebar ? '' : 'text-center max-w-2xl mx-auto'}`}>
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${isSidebar ? 'bg-yellow-400 text-black' : 'bg-white/10 text-yellow-400'}`}>
          <Mail className="w-6 h-6" />
        </div>
        
        <h3 className={`font-black mb-3 ${isSidebar ? 'text-2xl text-black' : 'text-3xl md:text-4xl text-white'}`}>
          {isSidebar ? 'Never Miss a Deal' : 'Get Secret Deals in Your Inbox'}
        </h3>
        
        <p className={`mb-6 text-lg ${isSidebar ? 'text-black/70 font-medium' : 'text-white/80'}`}>
          {isSidebar 
            ? 'Join 5,000+ founders getting weekly curated discounts.'
            : 'We negotiate exclusive discounts that never hit the public site. Join 5,000+ founders saving thousands on SaaS.'
          }
        </p>

        <form onSubmit={handleSubmit} className={`flex gap-3 ${isSidebar ? 'flex-col' : 'flex-col sm:flex-row'}`}>
          <Input 
            type="email" 
            placeholder="founder@startup.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`
              h-12 text-lg 
              ${isSidebar 
                ? 'bg-white border-2 border-black focus:ring-yellow-400' 
                : 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-yellow-400'
              }
            `}
          />
          <Button 
            type="submit" 
            disabled={loading}
            className={`
              h-12 text-lg font-bold
              ${isSidebar 
                ? 'bg-black text-yellow-400 hover:bg-gray-800' 
                : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }
            `}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Free'}
          </Button>
        </form>
        
        <p className={`mt-4 text-xs ${isSidebar ? 'text-black/50' : 'text-white/40'}`}>
          No spam. Unsubscribe anytime. We respect your inbox.
        </p>
      </div>
    </div>
  );
}
