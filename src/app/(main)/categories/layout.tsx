import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Categories - IndieSaasDeals",
  description: "Browse SaaS deals by category. Find discounts on marketing tools, developer tools, AI software, design tools, and productivity apps.",
  alternates: {
    canonical: "https://indiesaasdeals.com/categories",
  },
  openGraph: {
    title: "SaaS Categories - IndieSaasDeals",
    description: "Browse SaaS deals by category. Find discounts on marketing tools, developer tools, AI software, design tools, and productivity apps.",
    url: "https://indiesaasdeals.com/categories",
  },
  twitter: {
    title: "SaaS Categories - IndieSaasDeals",
    description: "Browse SaaS deals by category. Find discounts on marketing tools, developer tools, AI software, design tools, and productivity apps.",
  }
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}