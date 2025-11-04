# Database Migration Guide

## Current Status

Three SQL migration files are ready to be executed:
1. **Feature #2: Alternatives Tables** - `migrations/create-alternatives-tables.sql`
2. **Feature #3: Contracts Tables** - `migrations/create-contracts-tables.sql`
3. **Feature #4: Usage Analytics Tables** - `migrations/create-usage-analytics-tables.sql`

## Option 1: Automated Migration Script (Recommended)

### Prerequisites
1. Update your `.env.local` file with your actual Neon database credentials
2. Replace the placeholder `DATABASE_URL` with your real connection string from Neon

### Steps
1. Get your database connection string from your Neon dashboard: https://console.neon.tech
2. Update `.env.local`:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Run the migrations:
   ```bash
   npm run migrate:all
   ```

## Option 2: Manual Migration via Neon Console

If you prefer to run migrations manually or the automated script fails:

### Steps
1. Log in to your Neon console: https://console.neon.tech
2. Navigate to your project
3. Go to the SQL Editor
4. Copy and paste each SQL file's contents in order:

#### Step 1: Run Alternatives Tables Migration
```bash
# Copy the contents of:
cat migrations/create-alternatives-tables.sql
```
- Paste into Neon SQL Editor
- Click "Run"

#### Step 2: Run Contracts Tables Migration
```bash
# Copy the contents of:
cat migrations/create-contracts-tables.sql
```
- Paste into Neon SQL Editor
- Click "Run"

#### Step 3: Run Usage Analytics Tables Migration
```bash
# Copy the contents of:
cat migrations/create-usage-analytics-tables.sql
```
- Paste into Neon SQL Editor
- Click "Run"

## Verification

After running migrations, verify the tables were created:

```sql
-- Check all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- alternatives
-- alternative_comparisons
-- contracts
-- contract_risk_alerts
-- contract_clauses
-- contract_comparisons
-- contract_reminders
-- software_usage_logs
-- usage_insights
-- user_activity
-- support_tickets
-- usage_anomalies
```

## Troubleshooting

### Error: "Error connecting to database: fetch failed"
- Your `DATABASE_URL` in `.env.local` has placeholder values
- Update with real credentials from Neon dashboard

### Error: "relation already exists"
- Tables have already been created
- This is safe to ignore
- Or use `DROP TABLE IF EXISTS` to recreate

### Error: "permission denied"
- Your database user doesn't have CREATE TABLE permissions
- Use the owner/admin user credentials from Neon

## What's Next

After running migrations, you can:
1. Start the dev server: `npm run dev`
2. Upload PDF contracts at: `http://localhost:3000/[companyId]/contracts`
3. View usage analytics at: `http://localhost:3000/[companyId]/analytics`
4. Generate sample data using the "Generate Sample Data" button
