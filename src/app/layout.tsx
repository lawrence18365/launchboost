import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { Toaster } from "sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { CookieConsent } from "@/components/compliance/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { StructuredData } from "@/components/seo/StructuredData";
import { EmailCaptureSystem } from "@/components/EmailCaptureSystem";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "IndieSaasDeals - Exclusive SaaS Discounts for Indie Hackers & Startup Founders",
  description:
    "Get 50-80% off premium SaaS tools. Hand-picked deals from indie founders for indie builders. Featured: project management, design tools, marketing automation & developer resources.",
  keywords: [
    "saas deals",
    "software discounts", 
    "indie hacker tools",
    "startup software deals",
    "appsumo alternative",
    "lifetime deals",
    "saas discounts 2025",
    "indie saas marketplace",
    "developer tools deals",
    "startup tool discounts"
  ],
  authors: [{ name: "IndieSaasDeals Team" }],
  metadataBase: new URL('https://indiesaasdeals.com'),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  verification: {
    google: "your-google-site-verification-code-here",
  },  
  openGraph: {
    title: "IndieSaasDeals - Save 50-80% on SaaS Tools for Indie Hackers",
    description: "Exclusive software deals curated for startup founders. Get premium tools at indie-friendly prices. 100+ verified discounts on dev tools, design software & business apps.",
    type: "website",
    locale: "en_US",
    url: "https://indiesaasdeals.com",
    siteName: "IndieSaasDeals",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "IndieSaasDeals - Exclusive SaaS Deals for Indie Hackers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IndieSaasDeals - Save 50-80% on SaaS Tools for Indie Hackers",
    description: "Exclusive software deals curated for startup founders. Get premium tools at indie-friendly prices.",
    images: ["/logo.svg"],
    creator: "@indiesaasdeals",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://indiesaasdeals.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFD63",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <LoadingProvider showInitialLoader={true} minLoadingTime={2800}>
            <ConditionalLayout>{children}</ConditionalLayout>
          </LoadingProvider>
        </ErrorBoundary>
        <Toaster
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              // Match the actually loaded font family for consistency
              fontFamily: "Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            },
          }}
        />
        <UIToaster />
        <CookieConsent />
        <EmailCaptureSystem />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <FacebookPixel />
        <StructuredData />
      </body>
    </html>
  );
}
