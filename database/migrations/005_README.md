# Migration 005: Create software_assets Table

## Problem

The `software_assets` table is referenced throughout the application but was missing from the database migrations, causing errors like:

```
NeonDbError: relation "software_assets" does not exist
```

## Solution

This migration creates the `software_assets` table with all necessary columns, constraints, indexes, and triggers.

## Running the Migration

### Option 1: Using the migration script (recommended)

```bash
cd prism-web
DATABASE_URL=your_database_url npx tsx scripts/run-migration-005.ts
```

### Option 2: Direct SQL execution

Connect to your Neon database and run:

```bash
psql $DATABASE_URL -f database/migrations/005_create_software_assets_table.sql
```

### Option 3: Via Neon console

1. Log into your Neon console
2. Navigate to SQL Editor
3. Copy and paste the contents of `005_create_software_assets_table.sql`
4. Execute the migration

## What This Migration Creates

- **Table**: `software_assets` with 43 columns including:
  - Basic info (id, asset_code, software_name, vendor_name, category)
  - Cost tracking (total_annual_cost, cost_per_user)
  - License management (total_licenses, active_users, utilization_rate)
  - Contract details (renewal_date, contract_status, payment_frequency)
  - Business metrics (business_criticality, replacement_priority)
  - AI insights (ai_replacement_candidate, ai_augmentation_candidate)

- **Constraints**: Business rules validation for criticality, complexity, priorities, etc.

- **Indexes**: Performance optimization for common queries

- **Triggers**: Auto-calculation of:
  - `utilization_rate` (active_users / total_licenses * 100)
  - `days_to_renewal` (renewal_date - current_date)

## Verification

After running the migration, verify it succeeded:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM software_assets;"
```

You should see `0` (table exists but is empty) instead of an error.

## Rollback

To rollback this migration:

```sql
DROP TRIGGER IF EXISTS trigger_update_software_assets_days_to_renewal ON software_assets;
DROP TRIGGER IF EXISTS trigger_update_software_assets_utilization_rate ON software_assets;
DROP FUNCTION IF EXISTS update_software_assets_days_to_renewal();
DROP FUNCTION IF EXISTS update_software_assets_utilization_rate();
DROP TABLE IF EXISTS software_assets CASCADE;
```

## Notes

- This migration is safe to run multiple times (uses `CREATE TABLE IF NOT EXISTS`)
- Foreign key to `companies` table ensures referential integrity
- The table supports both the existing `software` table and the new asset tracking features
