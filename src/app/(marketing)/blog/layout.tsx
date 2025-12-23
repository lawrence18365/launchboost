import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Blog - IndieSaasDeals",
  description: "Read the latest insights on SaaS deals, startup tools, and indie hacker resources. Tips and guides for finding the best software discounts.",
  alternates: {
    canonical: "https://indiesaasdeals.com/blog",
  },
  openGraph: {
    title: "SaaS Blog - IndieSaasDeals",
    description: "Read the latest insights on SaaS deals, startup tools, and indie hacker resources. Tips and guides for finding the best software discounts.",
    url: "https://indiesaasdeals.com/blog",
  },
  twitter: {
    title: "SaaS Blog - IndieSaasDeals",
    description: "Read the latest insights on SaaS deals, startup tools, and indie hacker resources. Tips and guides for finding the best software discounts.",
  }
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}