#!/usr/bin/env node

/**
 * Google Search Console Indexing Helper
 * 
 * This script helps you request indexing for your important pages.
 * You'll need to use the Google Search Console UI for actual submission.
 */

const pages = [
  'https://indiesaasdeals.com',
  'https://indiesaasdeals.com/deals',
  'https://indiesaasdeals.com/categories',
  'https://indiesaasdeals.com/about',
  'https://indiesaasdeals.com/contact',
  'https://indiesaasdeals.com/advertise',
  'https://indiesaasdeals.com/feedback',
  'https://indiesaasdeals.com/blog',
  'https://indiesaasdeals.com/privacy',
  'https://indiesaasdeals.com/terms',
  'https://indiesaasdeals.com/advertise/purchase',
  'https://indiesaasdeals.com/blog/welcome-to-indiesaasdeals-blog',
  'https://indiesaasdeals.com/blog/indiesaasdeals-vs-appsumo',
  'https://indiesaasdeals.com/blog/why-we-prioritize-real-results-over-vanity-metrics'
];

console.log('🔍 Google Search Console Indexing Helper\n');
console.log('📋 Pages that need indexing:');
console.log('━'.repeat(60));

pages.forEach((page, index) => {
  console.log(`${index + 1}. ${page}`);
});

console.log('\n📝 Steps to request indexing:');
console.log('━'.repeat(60));
console.log('1. Go to Google Search Console: https://search.google.com/search-console');
console.log('2. Select your property: indiesaasdeals.com');
console.log('3. Use the URL inspection tool for each page above');
console.log('4. Click "Request Indexing" for each page');
console.log('5. Wait 1-2 weeks for re-crawling and indexing');

console.log('\n🗺️  Sitemap info:');
console.log('━'.repeat(60));
console.log('Sitemap URL: https://indiesaasdeals.com/api/sitemap');
console.log('Submit this in GSC Sitemaps section if not already done');

console.log('\n✅ Recent fixes implemented:');
console.log('━'.repeat(60));
console.log('• Fixed navigation links (no more redirects to /sign-in)');
console.log('• Updated sitemap to include blog posts');
console.log('• Fixed robots.txt to point to comprehensive sitemap');
console.log('• Ensured proper canonical URLs');
console.log('• HTTP to HTTPS redirects working correctly (308)');