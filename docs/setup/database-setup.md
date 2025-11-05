# PRISM Database Setup Guide

Complete guide to setting up your Neon PostgreSQL database for PRISM.

## Quick Start

```bash
# 1. Set your DATABASE_URL
export DATABASE_URL="postgresql://user:password@host/prism?sslmode=require"

# 2. Run the schema
psql $DATABASE_URL -f database/complete_schema.sql

# 3. Load seed data
psql $DATABASE_URL -f database/seed_data.sql

# 4. Verify setup
psql $DATABASE_URL -c "SELECT email, role FROM users;"
```

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Neon Setup](#neon-setup)
3. [Schema Creation](#schema-creation)
4. [Seed Data](#seed-data)
5. [User Management](#user-management)
6. [Vercel Environment Variables](#vercel-environment-variables)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 20+
- PostgreSQL client (psql) or Neon SQL Editor
- Neon account (free tier available at [neon.tech](https://neon.tech))

## Neon Setup

### 1. Create Neon Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **"New Project"**
3. Choose a project name: `prism-production`
4. Select a region close to your users
5. Click **"Create Project"**

### 2. Get Connection String

1. In your Neon dashboard, go to **"Connection Details"**
2. Copy the **Connection string** (should look like):
   ```
   postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this as `DATABASE_URL` - you'll need it for:
   - Local development (`.env` file)
   - Vercel deployment (environment variables)

### 3. Set Environment Variable

**For Local Development:**
```bash
# In prism-web/.env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
```

**For Production (Vercel):**
Add to Vercel dashboard → Project Settings → Environment Variables

---

## Schema Creation

The complete schema includes all necessary tables:
- `companies` - Client organizations
- `users` - Authentication and authorization
- `software_assets` - Software inventory
- `ai_agent_analyses` - AI analysis results
- `client_reports` - Generated reports

### Run Schema Script

**Option 1: Using psql (Recommended)**
```bash
export DATABASE_URL="your-neon-connection-string"
psql $DATABASE_URL -f database/complete_schema.sql
```

**Option 2: Using Neon SQL Editor**
1. Open Neon Console → SQL Editor
2. Copy contents of `database/complete_schema.sql`
3. Paste and click **"Run"**

**Option 3: Using the Node.js script**
```bash
cd database
node -e "const {neon}=require('@neondatabase/serverless');const fs=require('fs');const sql=neon(process.env.DATABASE_URL);const schema=fs.readFileSync('complete_schema.sql','utf8');sql(schema).then(()=>console.log('✅ Schema created')).catch(console.error);"
```

### Verify Schema

```sql
-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show:
-- ai_agent_analyses
-- client_reports
-- companies
-- software_assets
-- users
```

---

## Seed Data

The seed data includes:
- **2 Companies**: BioRad Laboratories, CoorsTek
- **3 Users**: 1 admin, 2 company managers
- **10+ Software Assets**: Sample software for BioRad

### Default Credentials

All seed users have the password: **`Password123!`**

| Email | Role | Company | Access |
|-------|------|---------|--------|
| `jbandu@gmail.com` | Admin | None | Full platform access |
| `mhanif@bio-rad.com` | Company Manager | BioRad | `/biorad/*` routes |
| `ryan.reed@coorstek.com` | Company Manager | CoorsTek | `/coorstek/*` routes |

### Load Seed Data

```bash
export DATABASE_URL="your-neon-connection-string"
psql $DATABASE_URL -f database/seed_data.sql
```

### Verify Seed Data

```sql
-- Check companies
SELECT company_id, company_name, industry FROM companies;

-- Check users
SELECT email, full_name, role FROM users ORDER BY role;

-- Check software by company
SELECT c.company_name, COUNT(s.software_id) as software_count,
       SUM(s.total_annual_cost)::money as total_spend
FROM companies c
LEFT JOIN software_assets s ON c.company_id = s.company_id
GROUP BY c.company_name;
```

---

## User Management

### Create New User

Use the provided utility script:

```bash
cd database

# Create admin user
node create_user.js admin@example.com SecurePass123! "John Doe" admin

# Create company manager for BioRad
node create_user.js manager@bio-rad.com SecurePass123! "Jane Smith" company_manager biorad

# Create viewer for CoorsTek
node create_user.js viewer@coorstek.com SecurePass123! "Bob Jones" viewer coorstek
```

### Create User Manually

```sql
-- Get company ID first
SELECT company_id, company_name FROM companies;

-- Create user (replace with your values)
INSERT INTO users (email, password_hash, full_name, role, company_id, is_active)
VALUES (
  'newuser@example.com',
  '$2a$10$rJZhv0hs3M4QhH8xNxJw3.vYxKGHJjR9QhVKzF6qV6p3xN8rBZG0a',  -- Password123!
  'New User',
  'company_manager',
  'YOUR_COMPANY_ID_HERE',
  true
);
```

### Generate Password Hash

```bash
# Using Node.js
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('YourPassword123!',10).then(console.log);"

# Or use the create_user.js script which handles this automatically
```

### User Roles Explained

| Role | Access | Company Required? |
|------|--------|-------------------|
| `admin` | Full platform access, all companies | No |
| `company_manager` | Full access to their company data | Yes |
| `viewer` | Read-only access to their company data | Yes |

---

## Route Structure

Understanding how authentication and routing work:

### Admin Routes
- `/admin/dashboard` - Platform overview
- `/admin/companies` - Manage all clients
- `/admin/analytics` - Platform analytics
- `/admin/settings` - Configuration

**Access**: Only users with `role = 'admin'`

### Company Routes
- `/{companyId}/dashboard` - Company overview
- `/{companyId}/software` - Software inventory
- `/{companyId}/alternatives` - AI alternatives
- `/{companyId}/renewals` - Upcoming renewals
- `/{companyId}/reports` - Generated reports

**Access**: Users with matching `company_id` OR admins

### Company ID Mapping

When accessing company routes, use the company identifier:

```
BioRad:    /biorad/dashboard  (OR UUID: /550e8400-e29b-41d4-a716-446655440001/dashboard)
CoorsTek:  /coorstek/dashboard (OR UUID: /550e8400-e29b-41d4-a716-446655440002/dashboard)
```

**Note**: The app currently expects lowercase company names as route parameters. The middleware checks if the user has access to that company.

---

## Vercel Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Authentication (REQUIRED)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here

# AI APIs (Optional - for agent features)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# Email (Optional - for notifications)
SENDGRID_API_KEY=SG....
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Troubleshooting

### Error: "Route /coorstek/dashboard returns 404"

**Problem**: No data exists for CoorsTek, or user doesn't have access.

**Solutions**:
1. Verify seed data loaded:
   ```sql
   SELECT * FROM companies WHERE company_name ILIKE '%coors%';
   SELECT * FROM users WHERE email = 'ryan.reed@coorstek.com';
   ```

2. Check if logged in as correct user:
   - CoorsTek routes require login as `ryan.reed@coorstek.com` or an admin

3. Verify middleware is allowing the route:
   - Check that `company_id` in user matches the company

### Error: "relation 'users' does not exist"

**Problem**: Schema not created.

**Solution**: Run the schema creation script:
```bash
psql $DATABASE_URL -f database/complete_schema.sql
```

### Error: "password authentication failed"

**Problem**: Wrong credentials or user doesn't exist.

**Solutions**:
1. Verify user exists:
   ```sql
   SELECT email, role FROM users;
   ```

2. Reset password using `create_user.js` (it will update if exists)

3. Check bcrypt hash was generated correctly

### Error: "Cannot access company data"

**Problem**: User's `company_id` doesn't match the route parameter.

**Solution**:
```sql
-- Check user's company
SELECT u.email, u.company_id, c.company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.company_id
WHERE u.email = 'user@example.com';

-- Update if needed
UPDATE users
SET company_id = 'CORRECT_COMPANY_ID'
WHERE email = 'user@example.com';
```

### Database Connection Issues

1. **Verify connection string format**:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

2. **Test connection**:
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

3. **Check Neon status**: [status.neon.tech](https://status.neon.tech)

4. **Verify SSL mode**: Neon requires `sslmode=require`

---

## Database Maintenance

### Backup Database

```bash
pg_dump $DATABASE_URL > prism_backup_$(date +%Y%m%d).sql
```

### Reset Database (CAUTION!)

```bash
# Drop all tables and recreate
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL -f database/complete_schema.sql
psql $DATABASE_URL -f database/seed_data.sql
```

### View Database Stats

```sql
-- Table sizes
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- Row counts
SELECT
  'companies' as table, COUNT(*) as rows FROM companies
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'software_assets', COUNT(*) FROM software_assets
UNION ALL
SELECT 'ai_agent_analyses', COUNT(*) FROM ai_agent_analyses
UNION ALL
SELECT 'client_reports', COUNT(*) FROM client_reports;
```

---

## Next Steps

After completing the database setup:

1. ✅ **Test Login**: Visit `/login` and sign in with seed credentials
2. ✅ **Admin Dashboard**: Login as `jbandu@gmail.com` and visit `/admin/dashboard`
3. ✅ **Company Dashboard**: Login as `mhanif@bio-rad.com` and visit `/biorad/dashboard`
4. ✅ **Create New Users**: Use `create_user.js` to add team members
5. ✅ **Add Software**: Use the UI or API to add software assets
6. ✅ **Run AI Agents**: Configure API keys and run cost optimization

---

## Support

For issues or questions:
- Check the [Main README](./README.md)
- Review [API Documentation](./prism-web/API_DOCUMENTATION.md)
- Email: jbandu@gmail.com

**Happy PRISM-ing! 🚀**
