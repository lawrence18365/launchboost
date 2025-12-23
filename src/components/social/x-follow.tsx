"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

// X (Twitter) Icon Component
const XIcon = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface XFollowProps {
  handle: string; // without @
  displayName?: string;
  variant?: 'button' | 'inline' | 'card';
  showIcon?: boolean;
  className?: string;
}

export function XFollow({ 
  handle, 
  displayName, 
  variant = 'inline',
  showIcon = true,
  className = '' 
}: XFollowProps) {
  // Clean handle (remove @ if present)
  const cleanHandle = handle.replace(/^@/, '');
  const displayHandle = `@${cleanHandle}`;
  const profileUrl = `https://x.com/${cleanHandle}`;

  if (variant === 'button') {
    return (
      <Link
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 hover:bg-gray-800 rounded-lg font-bold transition-colors border-2 border-black ${className}`}
        aria-label={`Follow @${cleanHandle} on X`}
      >
        {showIcon && <XIcon />}
        <span>{displayName || `Follow ${displayHandle}`}</span>
        <ExternalLink className="w-3 h-3" />
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border-2 border-black rounded-lg p-4 hover:shadow-lg transition-all ${className}`}>
        <Link
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
          aria-label={`Follow @${cleanHandle} on X`}
        >
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <XIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-black group-hover:text-gray-700 transition-colors">
              {displayName || 'Follow on X'}
            </div>
            <div className="text-sm text-gray-600">{displayHandle}</div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>
      </div>
    );
  }

  // Default inline variant
  return (
    <Link
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-black hover:text-gray-700 font-medium transition-colors ${className}`}
      aria-label={`Follow @${cleanHandle} on X`}
    >
      {showIcon && <XIcon />}
      <span>{displayName || displayHandle}</span>
      <ExternalLink className="w-3 h-3" />
    </Link>
  );
}

