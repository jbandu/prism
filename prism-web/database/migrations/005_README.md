# Migration 005: Consolidate Software Tables

**Status:** Ready for Production
**Estimated Time:** 2-3 minutes
**Risk Level:** Medium (involves table rename and FK updates)

---

## What This Migration Does

Consolidates the duplicate `software` and `software_assets` tables into a single unified `software` table.

### Problem Being Solved

The schema currently has TWO tables for software:
- `software` - 8 records, 15 columns (older, simpler structure)
- `software_assets` - 107 records, 44 columns (comprehensive structure)

This creates:
- ❌ Confusion about which table to use
- ❌ Duplicate code paths in the application
- ❌ Risk of data inconsistency
- ❌ Complex queries joining both tables

### Solution

1. ✅ Migrate 8 unique records from `software` → `software_assets`
2. ✅ Update all foreign key references to point to new IDs
3. ✅ Drop the old `software` table
4. ✅ Rename `software_assets` → `software`
5. ✅ Recreate foreign key constraints

### Result

- Single source of truth: **`software` table** with 115 records
- All FKs point to the unified table
- No application code changes needed (most code already uses software_assets)

---

## Data Analysis

### Current State

**software table (8 records):**
- Asana
- Monday.com
- Jira
- Slack
- Microsoft Teams
- Zoom
- Tableau
- Power BI

**software_assets table (107 records):**
- All other software products

**Analysis Result:** ✅ No duplicates - all 8 records are unique

### Tables with FK Dependencies

**Pointing to `software` (6 tables):**
- `software_features_mapping.software_id`
- `feature_comparison_matrix.software_id_1`
- `feature_comparison_matrix.software_id_2`
- `negotiation_playbooks.software_id`
- `negotiation_outcomes.software_id`
- `consolidation_recommendations.software_to_keep_id`

**Pointing to `software_assets` (8 tables):**
- `alternative_solutions.original_software_id`
- `usage_analytics.software_id`
- `integration_dependencies.source_software_id`
- `integration_dependencies.target_software_id`
- `renewal_negotiations.software_id`
- `replacement_projects.old_software_id`
- `ai_agent_analyses.software_id`
- `workflow_automations.replaces_software_id`

---

## How to Run

### Step 1: Backup Database

```bash
# Neon automatically backs up, but verify you can restore if needed
# Check your Neon dashboard for latest backup timestamp
```

### Step 2: Run Migration

```bash
cd prism-web
npx tsx scripts/run-migration-005-consolidate-software.ts
```

**Expected output:**
```
🚀 Migration 005: Consolidate Software Tables
⏱️  Estimated time: 2-3 minutes

1️⃣  Fetching records from software table...
   ✅ Found 8 records to migrate

2️⃣  Creating ID mapping table...
   ✅ Temporary mapping table created

3️⃣  Migrating records to software_assets...
   ✅ Migrated: Asana (old_id → new_id)
   ✅ Migrated: Monday.com (old_id → new_id)
   ...

4️⃣  Updating foreign key references...
   ✅ Updated software_features_mapping: X rows
   ✅ Updated feature_comparison_matrix.software_id_1: X rows
   ...

5️⃣  Dropping old software table...
   ✅ Old software table dropped

6️⃣  Renaming software_assets → software...
   ✅ Table renamed successfully

7️⃣  Recreating foreign key constraints...
   ✅ Created FK: software_features_mapping_software_id_fkey
   ...

✅ MIGRATION 005 COMPLETED SUCCESSFULLY
```

### Step 3: Verify Success

The script automatically runs verification:

```
🔍 Verifying Migration 005...
   ✅ software_assets table removed
   ✅ software table has 115 records (expected: 115)
   ✅ Foreign keys recreated: 6
   ✅ No orphaned foreign key references

✅ MIGRATION VERIFICATION COMPLETE
```

---

## Migration Steps (Technical Details)

### 1. Create Temporary ID Mapping Table

```sql
CREATE TEMP TABLE software_id_mapping (
  old_id UUID,
  new_id UUID,
  software_name TEXT
);
```

This tracks old `software.id` → new `software_assets.id` mappings.

### 2. Migrate Data

```sql
INSERT INTO software_assets (
  software_name,
  vendor_name,
  category,
  total_annual_cost,
  contract_start_date,
  contract_end_date,
  total_licenses,
  company_id,
  contract_status,
  created_at,
  updated_at
)
SELECT
  software_name,
  vendor_name,
  category,
  annual_cost,
  contract_start_date,
  contract_end_date,
  license_count,
  company_id,
  status,
  created_at,
  updated_at
FROM software;
```

**Column Mapping:**
- `annual_cost` → `total_annual_cost`
- `license_count` → `total_licenses`
- `status` → `contract_status`

### 3. Update Foreign Key References

For each dependent table:

```sql
UPDATE software_features_mapping sfm
SET software_id = m.new_id
FROM software_id_mapping m
WHERE sfm.software_id = m.old_id;
```

Repeat for all 6 tables.

### 4. Drop Old Table

```sql
DROP TABLE software CASCADE;
```

The `CASCADE` drops all FKs pointing to it.

### 5. Rename Table

```sql
ALTER TABLE software_assets RENAME TO software;
```

### 6. Recreate Foreign Keys

```sql
ALTER TABLE software_features_mapping
ADD CONSTRAINT software_features_mapping_software_id_fkey
FOREIGN KEY (software_id) REFERENCES software(id) ON DELETE CASCADE;
```

Repeat for all dependent tables.

---

## Safety Features

### 1. Temporary Mapping Table

Uses a temp table to track ID mappings, automatically cleaned up after session.

### 2. No Data Loss

All records are migrated before dropping the old table.

### 3. FK Updates Before Drop

All foreign keys are updated to point to new IDs before dropping the old table.

### 4. Verification Built-In

Automatically verifies:
- Old table is gone
- New table has correct record count
- No orphaned FK references

---

## Rollback Instructions

**⚠️ WARNING:** This migration is difficult to roll back because:
- The old `software` table is dropped
- New IDs are generated for migrated records

**If migration fails midway:**

1. Check Neon dashboard for latest backup
2. Restore from backup to before migration
3. Investigate error and fix migration script
4. Re-run migration

**Manual rollback (not recommended):**

The migration cannot be easily rolled back automatically. If you need to undo:

1. Restore from Neon backup
2. Or manually recreate the `software` table from exported schema

---

## Application Code Impact

### Minimal Impact Expected

Most code already references `software_assets`, which is now `software`:

**Before migration:**
```typescript
await sql`SELECT * FROM software_assets WHERE company_id = ${companyId}`;
```

**After migration:**
```typescript
await sql`SELECT * FROM software WHERE company_id = ${companyId}`;
```

### Files That May Need Updates

Search codebase for:
- `FROM software_assets` → `FROM software`
- `software_assets` table references

**Action required:**
- Update all queries to use `software` table name
- Remove any code that queries the old `software` table

---

## Performance Impact

### During Migration (2-3 min)

- ✅ No downtime required
- ✅ Quick INSERT operations (only 8 records)
- ✅ Table rename is instant
- ⚠️ Brief lock during FK constraint recreation

### After Migration

- **Simpler Schema:** Only one table to maintain
- **Better Caching:** No confusion about which table to query
- **Easier Queries:** No need to UNION both tables

---

## Verification Queries

After migration, run these to verify:

### 1. Check Table Exists

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('software', 'software_assets');
```

**Expected:** Only `software` (not `software_assets`)

### 2. Check Record Count

```sql
SELECT COUNT(*) FROM software;
```

**Expected:** 115 records (107 + 8)

### 3. Check Foreign Keys

```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND kcu.column_name LIKE '%software%';
```

**Expected:** All FKs point to `software` table (not `software_assets`)

### 4. Check for Orphaned Records

```sql
SELECT COUNT(*) FROM software_features_mapping
WHERE software_id NOT IN (SELECT id FROM software);
```

**Expected:** 0 orphaned records

---

## Next Steps After Migration

1. ✅ Update application code to use `software` table name
2. ✅ Search for `software_assets` references and replace with `software`
3. ✅ Update any documentation or API specs
4. ✅ Run application tests to verify functionality
5. ✅ Monitor for any errors in production logs

---

## FAQ

### Q: Will this break the application?

**A:** Minimal risk. Most code already uses `software_assets`, which is being renamed to `software`. You'll need to update table references in queries.

### Q: What if the migration fails?

**A:** Restore from Neon backup. The migration script will show exactly where it failed.

### Q: Can I run this during business hours?

**A:** Yes, but test in staging first. The migration is fast (2-3 min) and low-risk.

### Q: What about the 8 records being migrated?

**A:** They're unique (not duplicates) and will get new UUIDs. All FK references are automatically updated.

---

**Created:** 2025-11-04
**Status:** Ready to Run ✅
