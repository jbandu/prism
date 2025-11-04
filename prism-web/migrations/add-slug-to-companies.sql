-- Migration: Add slug column to companies table
-- This migration adds a slug column for URL-friendly company identifiers

-- Add slug column
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

-- Generate slugs for existing companies based on their names
UPDATE companies
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(company_name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Make slug unique and not null
ALTER TABLE companies ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Add comment
COMMENT ON COLUMN companies.slug IS 'URL-friendly identifier generated from company_name';
