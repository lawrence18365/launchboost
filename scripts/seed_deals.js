const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple .env parser since we can't assume dotenv is installed/configured for scripts
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
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

const sampleDeals = [
  {
    title: 'TaskFlow Pro - 75% Off Annual Plan',
    slug: 'taskflow-pro-75-off',
    description: 'The all-in-one workspace for growing teams. Combine notes, tasks, wikis, and databases in one powerful tool. Perfect for project management, documentation, and team collaboration.',
    short_description: 'All-in-one workspace combining notes, tasks, wikis, and databases',
    category: 'Productivity & Organization',
    tags: ['productivity', 'collaboration', 'notes', 'database'],
    product_name: 'TaskFlow Pro',
    product_website: 'https://example.com/taskflow',
    logo_url: 'https://ui-avatars.com/api/?name=Task+Flow&background=0D8ABC&color=fff&size=200',
    original_price: 9600,
    deal_price: 2400,
    total_codes: 100,
    codes_remaining: 100,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'featured',
    is_featured: true,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  },
  {
    title: 'DesignCraft Pro - 6 Months Free',
    slug: 'designcraft-pro-6-months-free',
    description: 'Design like a pro with thousands of premium templates, photos, and graphics. Create stunning social media posts, presentations, logos, and marketing materials.',
    short_description: 'Professional design tool with premium templates and assets',
    category: 'Design & Creative',
    tags: ['design', 'graphics', 'templates', 'marketing'],
    product_name: 'DesignCraft Pro',
    product_website: 'https://example.com/designcraft',
    logo_url: 'https://ui-avatars.com/api/?name=Design+Craft&background=ff0055&color=fff&size=200',
    original_price: 14400,
    deal_price: 0,
    total_codes: 150,
    codes_remaining: 150,
    deal_type: 'free_trial',
    status: 'live',
    pricing_tier: 'featured',
    is_featured: true,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'ProtoMaker Professional - 50% Off',
    slug: 'protomaker-professional-50-off',
    description: 'The collaborative design platform for growing teams. Create, prototype, and collaborate on designs in real-time.',
    short_description: 'Collaborative design and prototyping platform for teams',
    category: 'Design & Creative',
    tags: ['design', 'prototyping', 'collaboration', 'ui-ux'],
    product_name: 'ProtoMaker',
    product_website: 'https://example.com/protomaker',
    logo_url: 'https://ui-avatars.com/api/?name=Proto+Maker&background=663399&color=fff&size=200',
    original_price: 18000,
    deal_price: 9000,
    total_codes: 75,
    codes_remaining: 75,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'premium',
    is_featured: false,
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'CodelessWeb - 40% Off',
    slug: 'codelessweb-professional-40-off',
    description: 'Build responsive websites visually without code. Includes CMS, ecommerce, and hosting.',
    short_description: 'Visual web development platform with CMS and hosting',
    category: 'Developer Tools',
    tags: ['web-development', 'no-code', 'cms', 'hosting'],
    product_name: 'CodelessWeb',
    product_website: 'https://example.com/codelessweb',
    logo_url: 'https://ui-avatars.com/api/?name=Code+Less&background=000000&color=fff&size=200',
    original_price: 42000,
    deal_price: 25200,
    total_codes: 50,
    codes_remaining: 50,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'free',
    is_featured: false,
    expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'CreatorMail Pro - 60% Off',
    slug: 'creatormail-pro-60-off',
    description: 'Email marketing platform built for creators. Grow your audience with landing pages, opt-in forms, and email sequences.',
    short_description: 'Email marketing platform designed specifically for creators',
    category: 'Marketing & Growth',
    tags: ['email-marketing', 'creators', 'landing-pages', 'automation'],
    product_name: 'CreatorMail',
    product_website: 'https://example.com/creatormail',
    logo_url: 'https://ui-avatars.com/api/?name=Creator+Mail&background=FF8C00&color=fff&size=200',
    original_price: 35400,
    deal_price: 14160,
    total_codes: 60,
    codes_remaining: 60,
    deal_type: 'discount',
    status: 'live',
    pricing_tier: 'featured',
    is_featured: true,
    expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

async function seed() {
  console.log('🌱 Starting seed...');

  // 1. Get a founder ID (or create one)
  let { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  let founderId;

  if (userError || !users || users.length === 0) {
    console.log('No users found. Creating a placeholder founder...');
    console.warn('⚠️ WARNING: No users found in "profiles" table.');
    return;
  } else {
    founderId = users[0].id;
    console.log(`Using existing user as founder: ${founderId}`);
  }

  // 2. Insert Deals
  for (const deal of sampleDeals) {
    // Check if exists
    const { data: existing } = await supabase
      .from('deals')
      .select('id')
      .eq('slug', deal.slug)
      .single();

    if (existing) {
      console.log(`Updating existing deal with logo: ${deal.product_name}`);
      // Update logo if missing
      await supabase
        .from('deals')
        .update({ logo_url: deal.logo_url })
        .eq('id', existing.id);
      continue;
    }

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

  console.log('✨ Seed complete! Refresh your homepage.');
}

seed().catch(console.error);