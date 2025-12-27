const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple .env parser
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    });
    return env;
  } catch (e) {
    console.error('Could not load .env.local');
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const freshDeals = [
  {
    title: 'LaunchFast - The Next.js Boilerplate',
    slug: 'launchfast-boilerplate-2025',
    description: 'Ship your startup in days, not weeks. The most comprehensive Next.js boilerplate with Auth, Payments, and SEO built-in.',
    short_description: 'Ship your startup in days with this comprehensive Next.js boilerplate',
    category: 'Developer Tools',
    tags: ['boilerplate', 'nextjs', 'react', 'startup'],
    product_name: 'LaunchFast',
    product_website: 'https://example.com/launchfast',
    product_logo_url: 'https://ui-avatars.com/api/?name=Launch+Fast&background=000&color=fff&size=200&font-size=0.33',
    original_price: 29900, // $299.00
    deal_price: 14900,     // $149.00
    total_codes: 50,
    codes_remaining: 48,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'featured',
    is_featured: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
  },
  {
    title: 'TypeDream - No-Code Site Builder',
    slug: 'typedream-pro-lifetime',
    description: 'Build beautiful websites as easily as writing a Notion doc. The best no-code builder for text-heavy sites.',
    short_description: 'Build websites as easily as writing in Notion',
    category: 'Design & Creative',
    tags: ['nocode', 'website-builder', 'design'],
    product_name: 'TypeDream',
    product_website: 'https://example.com/typedream',
    product_logo_url: 'https://ui-avatars.com/api/?name=Type+Dream&background=663399&color=fff&size=200&font-size=0.33',
    original_price: 24000, // $240/yr
    deal_price: 12000,     // $120/yr
    total_codes: 100,
    codes_remaining: 92,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'featured',
    is_featured: true,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // +14 days
  },
  {
    title: 'HypeFury - Twitter Growth Tool',
    slug: 'hypefury-growth-bundle',
    description: 'Grow your audience and monetize your influence. The ultimate tool for Twitter/X automation and engagement.',
    short_description: 'Automate and grow your Twitter/X audience',
    category: 'Marketing & Growth',
    tags: ['social-media', 'twitter', 'marketing', 'growth'],
    product_name: 'HypeFury',
    product_website: 'https://example.com/hypefury',
    product_logo_url: 'https://ui-avatars.com/api/?name=Hype+Fury&background=1DA1F2&color=fff&size=200&font-size=0.33',
    original_price: 4900,  // $49/mo
    deal_price: 0,         // Free trial extended
    total_codes: 200,
    codes_remaining: 185,
    deal_type: 'free_trial',
    status: 'live',
    pricing_tier: 'featured',
    is_featured: true,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // +7 days (Urgent!)
  },
  {
    title: 'MidJourney Prompts Database',
    slug: 'midjourney-prompts-db',
    description: 'A curated collection of 10,000+ high-quality MidJourney prompts to jumpstart your AI art generation.',
    short_description: '10,000+ high-quality MidJourney prompts',
    category: 'AI & Machine Learning',
    tags: ['ai', 'art', 'midjourney', 'prompts'],
    product_name: 'PromptBase',
    product_website: 'https://example.com/promptbase',
    product_logo_url: 'https://ui-avatars.com/api/?name=Prompt+Base&background=ff0055&color=fff&size=200&font-size=0.33',
    original_price: 4900,
    deal_price: 1900,
    total_codes: 500,
    codes_remaining: 420,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'free',
    is_featured: false,
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // +60 days
  },
  {
    title: 'SuperGrow - LinkedIn Analytics',
    slug: 'supergrow-linkedin-pro',
    description: 'Detailed analytics and content scheduling for LinkedIn. optimizing your personal brand growth.',
    short_description: 'LinkedIn analytics and scheduling tool',
    category: 'Marketing & Growth',
    tags: ['linkedin', 'analytics', 'social-media'],
    product_name: 'SuperGrow',
    product_website: 'https://example.com/supergrow',
    product_logo_url: 'https://ui-avatars.com/api/?name=Super+Grow&background=0077b5&color=fff&size=200&font-size=0.33',
    original_price: 2900,
    deal_price: 1450,
    total_codes: 100,
    codes_remaining: 98,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'free',
    is_featured: false,
    expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString() // +21 days
  }
];

async function wipeAndSeed() {
  console.log('🧹 Wiping old data...');

  // Tables to clean - order matters for foreign keys if CASCADE isn't perfect, 
  // but with Supabase JS delete(), it might just error if FKs restrict.
  // Ideally, we delete child tables first.
  const tables = [
    'deal_codes',
    'deal_reviews',
    'deal_analytics',
    'user_favorites',
    'notifications',
    'user_activity',
    'deals' // Parent of the above
  ];

  for (const table of tables) {
    try {
      // Delete all rows
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all

      if (error) {
        // Ignore "table not found" errors if schema is different
        if (error.code !== '42P01') {
           console.log(`⚠️  Warning cleaning ${table}: ${error.message}`);
        }
      } else {
        console.log(`✓ Cleaned ${table}`);
      }
    } catch (e) {
      console.log(`⚠️  Error processing ${table}: ${e.message}`);
    }
  }

  console.log('🌱 Planting fresh deals...');

  // 1. Get a founder ID
  let { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  let founderId;

  if (userError || !users || users.length === 0) {
    console.warn('⚠️  WARNING: No users found in "profiles" table. Please sign up on the site first!');
    return;
  } else {
    founderId = users[0].id;
    console.log(`Using existing user as founder: ${founderId}`);
  }

  // 2. Insert Deals
  for (const deal of freshDeals) {
    const dealData = { ...deal, founder_id: founderId };
    
    const { error } = await supabase
      .from('deals')
      .insert(dealData);

    if (error) {
      console.error(`Error inserting ${deal.product_name}:`, error.message);
    } else {
      console.log(`✅ Added: ${deal.product_name}`);
    }
  }

  console.log('✨ Database reset complete! The platform is now fresh.');
}

wipeAndSeed().catch(console.error);
