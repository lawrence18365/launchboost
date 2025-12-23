"use client";

import Link from "next/link";
import { XCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LeadMagnetsSection() {
  const gaps = [
    'No clear “why should I sign up?”',
    'No exclusive benefits for members',
    'No FOMO (fear of missing out)'
  ];

  const benefits = [
    'Founding-member only discounts',
    'Early access to new drops',
    'Private launch notes + playbooks'
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
            Make Membership Irresistible
          </h2>
          <p className="mt-3 text-black/80 font-medium">
            Clear value, exclusive perks, and a real reason to join now.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Gaps card */}
          <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg">
            <div className="mb-4">
              <Badge className="bg-black text-yellow-400 border-2 border-black font-bold">Gaps we saw</Badge>
            </div>
            <ul className="space-y-4">
              {gaps.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-black bg-white">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </span>
                  <span className="text-black/80 font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits card */}
          <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg">
            <div className="mb-4">
              <Badge className="bg-black text-yellow-400 border-2 border-black font-bold">What members get</Badge>
            </div>
            <ul className="space-y-4 mb-6">
              {benefits.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-black bg-black">
                    <CheckCircle className="w-4 h-4 text-yellow-400" />
                  </span>
                  <span className="text-black font-semibold">{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center bg-black text-yellow-400 font-bold px-5 py-3 rounded-full border-2 border-black hover:bg-gray-900 transition-colors"
              >
                Get Access
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center bg-white text-black font-bold px-5 py-3 rounded-full border-2 border-black hover:bg-black hover:text-yellow-400 transition-colors"
              >
                See What’s Inside
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
