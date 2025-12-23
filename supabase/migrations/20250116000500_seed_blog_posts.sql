-- Seed initial blog posts (idempotent)
INSERT INTO blog_posts (slug, title, excerpt, content, author_name, tags, status, published_at)
VALUES
(
  'welcome-to-indiesaasdeals-blog',
  'Welcome to the IndieSaasDeals Blog',
  'Thoughts on launching, honest growth, and building a community where founders and builders win together.',
  '<p>We’re building IndieSaasDeals to be the most transparent, founder-first place to launch and discover new SaaS tools. This blog will share what we’re learning, why we make certain decisions, and how we’re helping founders get real customers without the vanity-metric circus.</p><p>Expect practical launch playbooks, authentic growth notes, and interviews with indie founders shipping great products. If you’re a builder or an early adopter, you’re home.</p>',
  'IndieSaasDeals Team',
  ARRAY['launch','community','indie'],
  'published',
  NOW()
),
(
  'why-we-prioritize-real-results-over-vanity-metrics',
  'Why We Prioritize Real Results Over Vanity Metrics',
  'Clicks, likes, and fake upvotes don’t pay the bills. Real customers do.',
  '<p>We believe in honest growth. Founders want customers, not clout. Every part of IndieSaasDeals is designed to connect real users with real problems to tools that genuinely help.</p><p>This philosophy guides our features, our advertising options, and our community standards. It’s simple: help founders win by helping customers win.</p>',
  'IndieSaasDeals Team',
  ARRAY['ethos','growth','founders'],
  'published',
  NOW() - INTERVAL '7 days'
)
ON CONFLICT (slug) DO NOTHING;

