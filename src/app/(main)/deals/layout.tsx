import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All SaaS Deals - IndieSaasDeals",
  description: "Browse all exclusive SaaS discounts and lifetime deals. Find the best software deals for indie hackers, developers, and startup founders.",
  alternates: {
    canonical: "https://indiesaasdeals.com/deals",
  },
  openGraph: {
    title: "All SaaS Deals - IndieSaasDeals", 
    description: "Browse all exclusive SaaS discounts and lifetime deals. Find the best software deals for indie hackers, developers, and startup founders.",
    url: "https://indiesaasdeals.com/deals",
  },
  twitter: {
    title: "All SaaS Deals - IndieSaasDeals",
    description: "Browse all exclusive SaaS discounts and lifetime deals. Find the best software deals for indie hackers, developers, and startup founders.",
  }
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}