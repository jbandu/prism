-- ================================================================
-- FIX: Software Alternatives Foreign Key Constraint
-- Issue: original_software_id references software_catalog(id) but
--        the code uses software.id (company-specific instances)
-- ================================================================

-- Drop the incorrect foreign key constraint
ALTER TABLE software_alternatives
DROP CONSTRAINT IF EXISTS software_alternatives_original_software_id_fkey;

-- Add the correct foreign key constraint to reference software.id
-- Make it ON DELETE CASCADE so alternatives are removed if software is deleted
ALTER TABLE software_alternatives
ADD CONSTRAINT software_alternatives_original_software_id_fkey
FOREIGN KEY (original_software_id)
REFERENCES software(id)
ON DELETE CASCADE;

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_software_alternatives_original_id
ON software_alternatives(original_software_id);

-- Verification
SELECT
  'software_alternatives FK fixed' as status,
  COUNT(*) as total_alternatives
FROM software_alternatives;
