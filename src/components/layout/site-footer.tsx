import Link from "next/link"
import { Mail, Twitter, Github, Heart } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { XFollow } from "@/components/social/x-follow"

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-foreground bg-brand text-brand-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Logo width={220} height={220} showText={false} textSize="2xl" />
            <p className="text-brand-foreground/90 font-medium leading-relaxed">
              The premier marketplace for discovering exclusive SaaS deals and supporting indie founders.
            </p>
            <div className="flex items-center space-x-4">
              <Link 
                href="https://twitter.com/ezysyntax" 
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-primary-foreground hover:bg-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link 
                href="https://github.com/indiesaasdeals" 
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-primary-foreground hover:bg-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link 
                href="mailto:hello@indiesaasdeals.com" 
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-primary-foreground hover:bg-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
            <div>
              <XFollow handle="ezysyntax" className="mt-2" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-brand-foreground mb-6">For Users</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Browse Deals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  All Deals
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-brand-foreground mb-6">For Founders</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard/deals/new" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Submit Deal
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-brand-foreground mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/promote" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Help Us Promote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-brand-foreground/90 hover:text-brand-foreground font-medium transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t-2 border-foreground/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-brand-foreground/90 font-medium mb-4 sm:mb-0">
            © 2025 IndieSaasDeals. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-brand-foreground/90 font-medium">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by founders, for founders</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
