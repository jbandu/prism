-- ============================================
-- VERIFICATION QUERIES FOR MIGRATION 004
-- ============================================
--
-- Run these queries after migration to verify success
--
-- ============================================

-- ============================================
-- 1. VERIFY FOREIGN KEYS WERE ADDED
-- ============================================

SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.constraint_name IN (
        'activity_log_company_id_fkey',
        'activity_log_user_id_fkey',
        'ai_agent_analyses_software_id_fkey',
        'ai_agent_analyses_company_id_fkey',
        'client_reports_company_id_fkey',
        'client_reports_generated_by_fkey',
        'alternative_solutions_original_software_id_fkey'
    )
ORDER BY tc.table_name;

-- Expected: Should return 7 rows

-- ============================================
-- 2. VERIFY INDEXES WERE CREATED
-- ============================================

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_activity_log_company_id',
        'idx_activity_log_user_id',
        'idx_activity_log_created_at',
        'idx_ai_agent_analyses_software_id',
        'idx_ai_agent_analyses_company_id',
        'idx_client_reports_company_id',
        'idx_alternative_solutions_original_software_id'
    )
ORDER BY tablename, indexname;

-- Expected: Should return 7+ rows

-- ============================================
-- 3. CHECK FOR ORPHANED RECORDS (Should be 0)
-- ============================================

-- Activity log orphans
SELECT 'activity_log orphaned companies' AS check_name, COUNT(*) AS orphan_count
FROM activity_log
WHERE company_id IS NOT NULL
  AND company_id NOT IN (SELECT id FROM companies)

UNION ALL

SELECT 'activity_log orphaned users', COUNT(*)
FROM activity_log
WHERE user_id IS NOT NULL
  AND user_id NOT IN (SELECT id FROM users)

UNION ALL

SELECT 'ai_agent_analyses orphaned software', COUNT(*)
FROM ai_agent_analyses
WHERE software_id IS NOT NULL
  AND software_id NOT IN (SELECT id FROM software)

UNION ALL

SELECT 'ai_agent_analyses orphaned companies', COUNT(*)
FROM ai_agent_analyses
WHERE company_id IS NOT NULL
  AND company_id NOT IN (SELECT id FROM companies);

-- Expected: All counts should be 0

-- ============================================
-- 4. VERIFY AUDIT COLUMNS ADDED
-- ============================================

SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('companies', 'software', 'software_assets', 'contracts')
    AND column_name IN ('updated_by', 'deleted_at')
ORDER BY table_name, column_name;

-- Expected: Should return 8 rows (4 tables × 2 columns)

-- ============================================
-- 5. TEST QUERY PERFORMANCE (Before/After)
-- ============================================

-- Test JOIN performance with explain
EXPLAIN ANALYZE
SELECT
    a.action_type,
    c.company_name,
    u.email
FROM activity_log a
JOIN companies c ON a.company_id = c.id
LEFT JOIN users u ON a.user_id = u.id
WHERE a.created_at > NOW() - INTERVAL '30 days'
LIMIT 100;

-- Look for "Index Scan" instead of "Seq Scan"
-- Execution time should be < 50ms

-- ============================================
-- 6. CHECK NUMERIC PRECISION
-- ============================================

SELECT
    table_name,
    column_name,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
    AND data_type = 'numeric'
    AND table_name IN ('companies', 'alternative_solutions', 'ai_agent_analyses', 'client_reports')
ORDER BY table_name, column_name;

-- Expected: Money columns should be NUMERIC(15,2)
--           Score columns should be NUMERIC(3,2)

-- ============================================
-- 7. SUMMARY STATISTICS
-- ============================================

SELECT
    'Foreign Keys Added' AS metric,
    COUNT(*) AS value
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%_fkey'
    AND table_schema = 'public'

UNION ALL

SELECT
    'Indexes Created',
    COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'

UNION ALL

SELECT
    'Tables with Soft Delete',
    COUNT(DISTINCT table_name)
FROM information_schema.columns
WHERE table_schema = 'public'
    AND column_name = 'deleted_at'

UNION ALL

SELECT
    'Tables with Audit Trail',
    COUNT(DISTINCT table_name)
FROM information_schema.columns
WHERE table_schema = 'public'
    AND column_name = 'updated_by';

-- ============================================
-- 8. DATA INTEGRITY CHECK
-- ============================================

-- Check that all foreign keys are valid
-- (PostgreSQL enforces this, but good to verify)

DO $$
DECLARE
    constraint_record RECORD;
    invalid_count INTEGER;
BEGIN
    FOR constraint_record IN
        SELECT
            tc.table_name,
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
    LOOP
        EXECUTE format(
            'SELECT COUNT(*) FROM %I WHERE %I IS NOT NULL AND %I NOT IN (SELECT %I FROM %I)',
            constraint_record.table_name,
            constraint_record.column_name,
            constraint_record.column_name,
            constraint_record.foreign_column_name,
            constraint_record.foreign_table_name
        ) INTO invalid_count;

        IF invalid_count > 0 THEN
            RAISE WARNING 'Invalid FK: %.% has % orphaned records',
                constraint_record.table_name,
                constraint_record.column_name,
                invalid_count;
        END IF;
    END LOOP;

    RAISE NOTICE '✅ Data integrity check complete';
END $$;

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================

SELECT
    '✅ Migration verification complete!' AS status,
    'Check output above for any warnings or errors' AS next_step;
