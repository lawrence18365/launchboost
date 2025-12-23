import { Metadata } from "next";
import Link from "next/link";
import { ShareButton } from "@/components/blog/ShareButton";

export const metadata: Metadata = {
  title: "Why IndieSaasDeals Exists – An Advertorial for Founders and Indie Hackers",
  description:
    "The indie-first alternative to enterprise-heavy deal sites. Better curation, fair terms for founders, and real value for early adopters.",
  openGraph: {
    title: "Why IndieSaasDeals Exists – Indie-first SaaS Deals",
    description:
      "A transparent case for an indie-first deals platform: what we fix, how it works, and why it matters.",
    type: "article",
  },
};

export default function AdvertorialPage() {
  const pageUrl = typeof window === "undefined" ? "https://indiesaasdeals.com/advertorial" : window.location.href;

  const bullets = [
    {
      title: "Founder‑friendly terms",
      body: "Keep more of your revenue. We don’t do gotchas or one‑sided contracts.",
    },
    {
      title: "Curated for indies",
      body: "We specialize in tools under $100/mo that solo makers and small teams actually use.",
    },
    {
      title: "Quality over volume",
      body: "Every deal meets minimum standards: live product, min. 20% off, clear redemption, valid codes.",
    },
    {
      title: "Real scarcity & trust",
      body: "Deals run for 30+ days, codes are tracked, and we publish transparent metrics.",
    },
  ];

  return (
    <div className="min-h-screen bg-brand">
      <section className="px-6 py-14 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-3xl md:text-5xl font-extrabold text-black leading-tight">
                IndieSaasDeals: The Indie‑First Way To Launch And Buy SaaS
              </h1>
              <ShareButton url={pageUrl} />
            </div>

            <p className="text-black/80 text-lg md:text-xl font-medium leading-relaxed mb-6">
              Enterprise‑heavy deal sites weren’t built for indie hackers. We are. This is our case for a
              founder‑first, community‑driven deals marketplace—and how you can benefit today.
            </p>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
              {bullets.map((b) => (
                <div key={b.title} className="border-2 border-black rounded-xl p-5 bg-yellow-50">
                  <h3 className="text-black font-extrabold text-lg mb-1">{b.title}</h3>
                  <p className="text-black/80 font-medium">{b.body}</p>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
                What Founders Get
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-black/90 font-medium">
                <li>Self‑serve submission and fast approval</li>
                <li>Featured placement options with a 100‑click guarantee</li>
                <li>Direct line to early adopters and feedback</li>
                <li>Transparent reporting on views, clicks, and claims</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
                What Early Adopters Get
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-black/90 font-medium">
                <li>Curated indie tools with meaningful discounts (min. 20%)</li>
                <li>Members‑only early access windows</li>
                <li>Clear redemption and code validity protections</li>
                <li>No spam—just practical software that saves time and money</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-10">
              <div className="border-2 border-black rounded-xl p-5">
                <h3 className="text-lg font-extrabold text-black mb-2">Founders: List Your Deal</h3>
                <p className="text-black/80 font-medium mb-4">
                  Submit in minutes. We’ll review for quality and go live quickly.
                </p>
                <Link
                  href="/advertise"
                  className="inline-flex items-center justify-center bg-black text-yellow-400 font-bold px-5 py-3 rounded-full border-2 border-black hover:bg-gray-900 transition-colors"
                >
                  Submit your deal →
                </Link>
              </div>
              <div className="border-2 border-black rounded-xl p-5">
                <h3 className="text-lg font-extrabold text-black mb-2">Deal Hunters: Get Early Access</h3>
                <p className="text-black/80 font-medium mb-4">
                  Join free to unlock members‑only windows and first dibs on drops.
                </p>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center bg-white text-black font-bold px-5 py-3 rounded-full border-2 border-black hover:bg-black hover:text-yellow-400 transition-colors"
                >
                  Become a member →
                </Link>
              </div>
            </div>

            <div className="border-2 border-black rounded-xl p-5 bg-white">
              <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-3">Our Promise</h2>
              <p className="text-black/80 font-medium mb-4">
                We are building a trustworthy, indie‑first marketplace. If a featured deal doesn’t reach
                100 clicks, we extend your placement free. If a code fails, we intervene. We’d rather
                earn long‑term trust than short‑term revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/deals" className="inline-flex items-center justify-center bg-black text-yellow-400 font-bold px-5 py-3 rounded-full border-2 border-black">
                  Browse deals
                </Link>
                <Link href="/advertise" className="inline-flex items-center justify-center bg-white text-black font-bold px-5 py-3 rounded-full border-2 border-black">
                  List your product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

