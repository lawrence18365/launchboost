-- Fix deal slugs to use product names instead of promotional text
-- This will update existing deals to have proper slugs based on product names

-- Function to create a proper slug from product name
CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRIM(product_name), 
          '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
        ), 
        '\s+', '-', 'g'  -- Replace spaces with dashes
      ), 
      '-+', '-', 'g'  -- Replace multiple dashes with single dash
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing deals to have proper slugs
UPDATE deals 
SET slug = generate_product_slug(product_name)
WHERE slug != generate_product_slug(product_name)
  AND product_name IS NOT NULL 
  AND product_name != '';

-- Update deal_links to use the new slugs
UPDATE deal_links 
SET slug = generate_product_slug(
  (SELECT product_name FROM deals WHERE deals.id = deal_links.deal_id)
)
WHERE deal_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM deals 
    WHERE deals.id = deal_links.deal_id 
    AND deals.product_name IS NOT NULL 
    AND deals.product_name != ''
  );

-- Add unique constraint on slug to prevent duplicates
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_slug_unique;
ALTER TABLE deals ADD CONSTRAINT deals_slug_unique UNIQUE (slug);

-- Add unique constraint on deal_links slug too
ALTER TABLE deal_links DROP CONSTRAINT IF EXISTS deal_links_slug_unique;
ALTER TABLE deal_links ADD CONSTRAINT deal_links_slug_unique UNIQUE (slug);