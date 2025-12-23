"use client";

import { useState } from "react";
import Link from "next/link";

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="bg-white border-2 border-black rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-black font-extrabold">{label}</span>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 bg-black text-yellow-400 font-bold px-3 py-1 rounded-full border-2 border-black hover:bg-gray-900 transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words text-sm md:text-[15px] text-black/90">{text}</pre>
    </div>
  );
}

export default function PromotePage() {
  const site = "https://indiesaasdeals.com";
  const utm = "?utm_source=ally&utm_medium=share&utm_campaign=help-us";

  const tweet = `Indie hackers: found a new, indie-first AppSumo alternative → IndieSaasDeals. Curated tools under $100, fair terms for founders, and real discounts. Worth a look: ${site}${utm}`;

  const linkedin = `I’ve been helping indie founders discover/launch tools. If you want curated SaaS deals (and founder-friendly terms), check IndieSaasDeals. Clear quality standards, transparent pricing, members-only early access. ${site}${utm}`;

  const reddit = `Soft-launch: IndieSaasDeals – a curation of indie-first SaaS deals under $100/mo. Exact numbers + honest pitch inside. If you’re a founder, they’re offering free featured slots for the first 10 (+100-click guarantee). ${site}${utm}`;

  const newsletter = `Spotlight: IndieSaasDeals (Indie-first SaaS deals)\n\nWhy it’s interesting: curated tools under $100, clear quality standards, and fair terms for founders. They’re offering early access and featured slots for launch partners. Check them out: ${site}${utm}`;

  const dmFounders = `Subject: Feature your SaaS (100 clicks guaranteed)\n\nQuick note — IndieSaasDeals is an indie-first alternative to enterprise-heavy deal sites. They curate tools under $100 and guarantee 100 click-throughs on featured placements (or they extend free). Interested in an exclusive 30–50% launch deal? ${site}/advertise${utm}`;

  return (
    <div className="min-h-screen bg-brand">
      <section className="px-6 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-10 shadow-lg">
            <h1 className="text-3xl md:text-5xl font-extrabold text-black leading-tight mb-3">
              Help Us Reach More Indies
            </h1>
            <p className="text-black/80 text-lg md:text-xl font-medium leading-relaxed mb-6">
              We need distribution. If you believe in founder‑first tools, please copy any of the posts below
              and share. Every post helps.
            </p>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
              <CopyBlock label="Tweet / X" text={tweet} />
              <CopyBlock label="LinkedIn" text={linkedin} />
              <CopyBlock label="Reddit comment/post" text={reddit} />
              <CopyBlock label="Newsletter blurb" text={newsletter} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-10">
              <CopyBlock label="DM to a SaaS founder" text={dmFounders} />
              <div className="bg-yellow-50 border-2 border-black rounded-2xl p-4 md:p-5">
                <h3 className="text-black font-extrabold mb-2">Intro us to a founder</h3>
                <p className="text-black/80 font-medium mb-3">
                  A warm intro is gold. Send an email connecting us and we’ll take it from there.
                </p>
                <a
                  href={`mailto:hello@indiesaasdeals.com?subject=Intro%20for%20IndieSaasDeals&body=Hey%2C%20connecting%20you%20with%20[Founder]%20building%20[Product].%20They%27d%20be%20great%20for%20an%20exclusive%20deal.%20More%20info%3A%20${encodeURIComponent(site + utm)}`}
                  className="inline-flex items-center justify-center bg-black text-yellow-400 font-bold px-5 py-3 rounded-full border-2 border-black hover:bg-gray-900 transition-colors"
                >
                  Start an intro email
                </a>
              </div>
            </div>

            <div className="border-2 border-black rounded-xl p-5 bg-white">
              <h2 className="text-xl md:text-2xl font-extrabold text-black mb-2">Prefer a deeper pitch?</h2>
              <p className="text-black/80 font-medium mb-4">
                Share our advertorial that explains what we do and why it matters.
              </p>
              <Link href="/advertorial" className="inline-flex items-center justify-center bg-white text-black font-bold px-5 py-3 rounded-full border-2 border-black hover:bg-black hover:text-yellow-400 transition-colors">
                Open the advertorial →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

