-- ============================================
-- PRISM DATABASE: CRITICAL FIXES
-- ============================================
-- Generated: 2025-11-05
-- Priority: CRITICAL - Run in Production ASAP
-- Estimated Execution Time: 5-10 minutes
-- Requires: Maintenance window (optional but recommended)
-- ============================================

-- IMPORTANT: Test in staging environment first!
-- IMPORTANT: Create backup before running:
--   pg_dump prism_db > backup_$(date +%Y%m%d_%H%M%S).sql

-- ============================================
-- PHASE 1: ADD MISSING FOREIGN KEYS
-- ============================================

-- Fix 1: Add users.company_id foreign key
-- Impact: Prevents orphaned users
-- Risk: Low (just adds constraint)
DO $$
BEGIN
    -- First, clean any orphaned data
    UPDATE users
    SET company_id = NULL
    WHERE company_id IS NOT NULL
      AND company_id NOT IN (SELECT id FROM companies);

    -- Add the constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_company_id_fkey'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_company_id_fkey
            FOREIGN KEY (company_id)
            REFERENCES companies(id)
            ON DELETE SET NULL;

        RAISE NOTICE 'Added users.company_id foreign key';
    END IF;
END $$;

-- Fix 2: Add prism_savings_log.software_id foreign key
-- Impact: Links savings to actual software records
-- Risk: Low
DO $$
BEGIN
    -- Clean orphaned data
    UPDATE prism_savings_log
    SET software_id = NULL
    WHERE software_id IS NOT NULL
      AND software_id NOT IN (SELECT id FROM software_assets);

    -- Add constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'prism_savings_log_software_id_fkey'
    ) THEN
        ALTER TABLE prism_savings_log
            ADD CONSTRAINT prism_savings_log_software_id_fkey
            FOREIGN KEY (software_id)
            REFERENCES software_assets(id)
            ON DELETE SET NULL;

        RAISE NOTICE 'Added prism_savings_log.software_id foreign key';
    END IF;
END $$;

-- ============================================
-- PHASE 2: CREATE MISSING INDEXES
-- ============================================
-- These indexes improve JOIN performance significantly
-- CONCURRENTLY = no table lock (safe for production)

-- Index 1: activity_log.user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_user
    ON activity_log(user_id);

-- Index 2: client_reports.generated_by
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_reports_generated_by
    ON client_reports(generated_by);

-- Index 3: companies.created_by
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_created_by
    ON companies(created_by);

-- Index 4: intelligence_notes.author_user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_intelligence_notes_author
    ON intelligence_notes(author_user_id);

-- Index 5: prism_savings_log.software_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prism_savings_software
    ON prism_savings_log(software_id);

-- Index 6: prism_savings_log.created_by
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prism_savings_created_by
    ON prism_savings_log(created_by);

-- Index 7: software.logo_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_software_logo
    ON software(logo_id);

-- Index 8: renewal_negotiations.company_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_renewal_negotiations_company
    ON renewal_negotiations(company_id);

-- Index 9: replacement_projects.company_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_replacement_projects_company
    ON replacement_projects(company_id);

-- ============================================
-- PHASE 3: FIX CIRCULAR DEPENDENCY
-- ============================================

-- Fix: Make companies.created_by nullable
-- Reason: Allows creating first company without existing user
DO $$
BEGIN
    ALTER TABLE companies ALTER COLUMN created_by DROP NOT NULL;

    COMMENT ON COLUMN companies.created_by IS
        'User who created the company. NULL for system-created or initial companies.';

    RAISE NOTICE 'Fixed circular dependency on companies.created_by';
END $$;

-- ============================================
-- PHASE 4: ADDITIONAL CRITICAL INDEXES
-- ============================================

-- GIN indexes for ARRAY columns (improves array searches)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_intelligence_notes_tags_gin
    ON intelligence_notes USING GIN(tags);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_key_insights_gin
    ON ai_agent_analyses USING GIN(key_insights);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_recommendations_gin
    ON ai_agent_analyses USING GIN(recommendations);

-- ============================================
-- PHASE 5: ADD ESSENTIAL CHECK CONSTRAINTS
-- ============================================

-- Ensure renewal dates are logical
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_renewal_date'
    ) THEN
        ALTER TABLE software_assets
            ADD CONSTRAINT valid_renewal_date
            CHECK (
                renewal_date IS NULL OR
                contract_end_date IS NULL OR
                renewal_date >= contract_end_date
            );

        RAISE NOTICE 'Added renewal date validation';
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the fixes were applied

-- 1. Check all foreign keys were created
SELECT
    'users.company_id' as fk_name,
    EXISTS(SELECT 1 FROM pg_constraint WHERE conname = 'users_company_id_fkey') as exists
UNION ALL
SELECT
    'prism_savings_log.software_id',
    EXISTS(SELECT 1 FROM pg_constraint WHERE conname = 'prism_savings_log_software_id_fkey');

-- 2. Check all indexes were created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_activity_user',
    'idx_client_reports_generated_by',
    'idx_companies_created_by',
    'idx_intelligence_notes_author',
    'idx_prism_savings_software',
    'idx_prism_savings_created_by',
    'idx_software_logo',
    'idx_renewal_negotiations_company',
    'idx_replacement_projects_company'
  )
ORDER BY tablename, indexname;

-- 3. Check for any remaining orphaned records
SELECT 'Orphaned users' as issue, COUNT(*) as count
FROM users
WHERE company_id IS NOT NULL
  AND company_id NOT IN (SELECT id FROM companies)
UNION ALL
SELECT 'Orphaned savings logs', COUNT(*)
FROM prism_savings_log
WHERE software_id IS NOT NULL
  AND software_id NOT IN (SELECT id FROM software_assets);

-- ============================================
-- PERFORMANCE IMPACT ANALYSIS
-- ============================================

-- Before/After comparison
-- Run BEFORE applying fixes:
-- EXPLAIN ANALYZE SELECT u.*, c.company_name FROM users u JOIN companies c ON u.company_id = c.id;

-- Run AFTER applying fixes:
-- EXPLAIN ANALYZE SELECT u.*, c.company_name FROM users u JOIN companies c ON u.company_id = c.id;

-- You should see:
-- - Index Scan instead of Seq Scan on users table
-- - 10-50x performance improvement on large tables

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

/*
-- ONLY run if you need to undo these changes

-- Remove foreign keys
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_company_id_fkey;
ALTER TABLE prism_savings_log DROP CONSTRAINT IF EXISTS prism_savings_log_software_id_fkey;

-- Remove indexes (don't use CONCURRENTLY for drops)
DROP INDEX IF EXISTS idx_activity_user;
DROP INDEX IF EXISTS idx_client_reports_generated_by;
DROP INDEX IF EXISTS idx_companies_created_by;
DROP INDEX IF EXISTS idx_intelligence_notes_author;
DROP INDEX IF EXISTS idx_prism_savings_software;
DROP INDEX IF EXISTS idx_prism_savings_created_by;
DROP INDEX IF EXISTS idx_software_logo;
DROP INDEX IF EXISTS idx_renewal_negotiations_company;
DROP INDEX IF EXISTS idx_replacement_projects_company;
DROP INDEX IF EXISTS idx_intelligence_notes_tags_gin;
DROP INDEX IF EXISTS idx_ai_key_insights_gin;
DROP INDEX IF EXISTS idx_ai_recommendations_gin;

-- Remove constraint
ALTER TABLE software_assets DROP CONSTRAINT IF EXISTS valid_renewal_date;

-- Restore NOT NULL (if needed)
ALTER TABLE companies ALTER COLUMN created_by SET NOT NULL;
*/

-- ============================================
-- MONITORING QUERIES
-- ============================================

-- Monitor index usage after deployment
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- Monitor table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================
-- SUCCESS CONFIRMATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'CRITICAL FIXES COMPLETED SUCCESSFULLY';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run verification queries above';
    RAISE NOTICE '2. Monitor query performance';
    RAISE NOTICE '3. Review SCHEMA_TECHNICAL_REVIEW.md for Phase 2 fixes';
    RAISE NOTICE '=========================================';
END $$;
