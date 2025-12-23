import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About IndieSaasDeals - Supporting Indie Founders",
  description: "Learn about IndieSaasDeals mission to support indie SaaS founders with a curated marketplace for exclusive software discounts and lifetime deals.",
  alternates: {
    canonical: "https://indiesaasdeals.com/about",
  },
  openGraph: {
    title: "About IndieSaasDeals - Supporting Indie Founders",
    description: "Learn about IndieSaasDeals mission to support indie SaaS founders with a curated marketplace for exclusive software discounts and lifetime deals.",
    url: "https://indiesaasdeals.com/about",
  },
  twitter: {
    title: "About IndieSaasDeals - Supporting Indie Founders", 
    description: "Learn about IndieSaasDeals mission to support indie SaaS founders with a curated marketplace for exclusive software discounts and lifetime deals.",
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}