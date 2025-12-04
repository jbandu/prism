-- Migration: Add product_description column to software table
-- This column stores a description of the software product to provide context
-- for analysis and LLM queries (e.g., Claude AI assistance)

-- Add product_description column to the software table
ALTER TABLE software ADD COLUMN IF NOT EXISTS product_description TEXT;

-- Add comment explaining the column purpose
COMMENT ON COLUMN software.product_description IS 'Description of the software product for analysis context and LLM queries';

-- Create an index for full-text search on the description
CREATE INDEX IF NOT EXISTS idx_software_product_description ON software USING gin(to_tsvector('english', COALESCE(product_description, '')));
