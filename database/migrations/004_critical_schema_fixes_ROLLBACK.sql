-- ============================================
-- ROLLBACK SCRIPT FOR MIGRATION 004
-- ============================================
--
-- Use this script to revert changes if needed
-- WARNING: This will remove data integrity constraints!
--
-- ============================================

BEGIN;

-- ============================================
-- SECTION 1: REMOVE FOREIGN KEYS
-- ============================================

ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_company_id_fkey;
ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_user_id_fkey;

ALTER TABLE ai_agent_analyses DROP CONSTRAINT IF EXISTS ai_agent_analyses_software_id_fkey;
ALTER TABLE ai_agent_analyses DROP CONSTRAINT IF EXISTS ai_agent_analyses_company_id_fkey;

ALTER TABLE client_reports DROP CONSTRAINT IF EXISTS client_reports_company_id_fkey;
ALTER TABLE client_reports DROP CONSTRAINT IF EXISTS client_reports_generated_by_fkey;

ALTER TABLE alternative_solutions DROP CONSTRAINT IF EXISTS alternative_solutions_original_software_id_fkey;

ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_updated_by_fkey;
ALTER TABLE software DROP CONSTRAINT IF EXISTS software_updated_by_fkey;
ALTER TABLE software_assets DROP CONSTRAINT IF EXISTS software_assets_updated_by_fkey;
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_updated_by_fkey;

RAISE NOTICE '✅ Removed foreign key constraints';

COMMIT;

-- ============================================
-- SECTION 2: DROP INDEXES (CONCURRENTLY)
-- ============================================

DROP INDEX CONCURRENTLY IF EXISTS idx_activity_log_company_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_activity_log_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_activity_log_created_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_activity_log_company_created;

DROP INDEX CONCURRENTLY IF EXISTS idx_ai_agent_analyses_software_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_ai_agent_analyses_company_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_ai_agent_analyses_review_status;

DROP INDEX CONCURRENTLY IF EXISTS idx_client_reports_company_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_client_reports_generated_at;

DROP INDEX CONCURRENTLY IF EXISTS idx_alternative_solutions_original_software_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_alternative_solutions_recommendation;

DROP INDEX CONCURRENTLY IF EXISTS idx_software_company_status;
DROP INDEX CONCURRENTLY IF EXISTS idx_software_assets_company_status;

DROP INDEX CONCURRENTLY IF EXISTS idx_companies_deleted_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_software_deleted_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_software_assets_deleted_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_deleted_at;

RAISE NOTICE '✅ Removed indexes';

-- ============================================
-- SECTION 3: REMOVE AUDIT COLUMNS
-- ============================================

BEGIN;

ALTER TABLE companies DROP COLUMN IF EXISTS updated_by;
ALTER TABLE software DROP COLUMN IF EXISTS updated_by;
ALTER TABLE software_assets DROP COLUMN IF EXISTS updated_by;
ALTER TABLE contracts DROP COLUMN IF EXISTS updated_by;

RAISE NOTICE '✅ Removed updated_by columns';

COMMIT;

-- ============================================
-- SECTION 4: REMOVE SOFT DELETE COLUMNS
-- ============================================

BEGIN;

ALTER TABLE companies DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE software DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE software_assets DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;

RAISE NOTICE '✅ Removed deleted_at columns';

COMMIT;

-- ============================================
-- ROLLBACK COMPLETE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ROLLBACK COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All changes from migration 004 have been reverted.';
    RAISE NOTICE '';
    RAISE WARNING 'Data integrity constraints removed - database is in less safe state!';
    RAISE NOTICE '';
END $$;
