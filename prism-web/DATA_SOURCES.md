# PRISM Data Sources Documentation

This document tracks all data sources in the application to ensure everything comes from the Neon database.

## ✅ Pages Using Real Database Data

### Admin Section

#### `/admin/dashboard`
- **Data Source:** Neon database via `/api/companies`
- **Displays:**
  - Active client count (live)
  - All other metrics pulled from database
  - System health (live)
- **Status:** ✅ 100% Real Data

#### `/admin/companies`
- **Data Source:** Neon database via `/api/companies`
- **Displays:**
  - Complete list of companies
  - Company details
  - Employee counts
  - Industries
- **Status:** ✅ 100% Real Data

#### `/admin/analytics`
- **Data Source:** Neon database via `/api/companies` + `/api/software`
- **Displays:**
  - Total clients (calculated from companies table)
  - Total software (calculated from software_assets table)
  - Total spend (sum of all software costs)
  - Potential savings (sum of all potential_savings)
  - Category distribution (grouped from software_assets)
  - Vendor analysis (grouped from software_assets)
- **Status:** ✅ 100% Real Data
- **Note:** Time-series charts not shown (no historical data yet)

#### `/admin/settings`
- **Data Source:** Static UI (no data shown yet)
- **Status:** ✅ No mock data

### Company Dashboards

#### `/[companyId]/dashboard`
- **Data Source:** Neon database via `/api/companies/[id]` + `/api/software`
- **Displays:**
  - Company name
  - Employee count
  - Annual spend (calculated from software_assets)
  - Potential savings (calculated from software_assets)
  - Average utilization (calculated from software_assets)
  - Total waste (calculated from software_assets)
  - Top spending software (sorted from software_assets)
  - Savings opportunities (filtered from software_assets)
- **Status:** ✅ 100% Real Data

#### `/[companyId]/software`
- **Data Source:** Neon database via `/api/software?companyId=X`
- **Displays:**
  - Complete software inventory
  - License counts
  - Costs
  - Utilization rates
  - Renewal dates
  - Contract statuses
- **Status:** ✅ 100% Real Data

#### `/[companyId]/alternatives`
- **Data Source:** Placeholder (feature not implemented)
- **Displays:** "Coming soon" message
- **Status:** ✅ No mock data

#### `/[companyId]/renewals`
- **Data Source:** Placeholder (feature not implemented)
- **Displays:** "Coming soon" message
- **Status:** ✅ No mock data

#### `/[companyId]/reports`
- **Data Source:** Placeholder (feature not implemented)
- **Displays:** "Coming soon" message
- **Status:** ✅ No mock data

#### `/[companyId]/settings`
- **Data Source:** Placeholder (feature not implemented)
- **Displays:** "Coming soon" message
- **Status:** ✅ No mock data

### Authentication

#### `/login`
- **Data Source:** Neon database via `/api/auth/[...nextauth]`
- **Displays:** Login form
- **Validates:** Against users table in Neon
- **Status:** ✅ 100% Real Data

#### `/` (Home Page)
- **Data Source:** Static marketing content
- **Status:** ✅ No data displayed

---

## 🔄 API Routes (All Connected to Neon)

### Company Routes
- `GET /api/companies` - Fetch all companies
- `GET /api/companies/[id]` - Fetch single company
- `POST /api/companies` - Create company
- `PUT /api/companies/[id]` - Update company
- `DELETE /api/companies/[id]` - Delete company
- `GET /api/companies/[id]/dashboard` - Company dashboard metrics

### Software Routes
- `GET /api/software` - Fetch software (filtered by companyId)
- `GET /api/software/[id]` - Fetch single software
- `POST /api/software` - Create software
- `PUT /api/software/[id]` - Update software
- `DELETE /api/software/[id]` - Delete software

### Auth Routes
- `POST /api/auth/[...nextauth]` - NextAuth authentication
  - Validates against `users` table
  - Uses bcrypt password hashing
  - Returns JWT session

### AI Agent Routes
- `POST /api/agents/analyze` - Trigger AI analysis
  - **Note:** Returns placeholder data until Python agents integrated
  - **Not Auto-Called:** Only triggered by explicit user action
  - **Status:** ⚠️ Placeholder (but clearly marked)

---

## 📊 Database Tables Used

### `companies`
```sql
- company_id (UUID)
- company_name (VARCHAR)
- industry (VARCHAR)
- employee_count (INTEGER)
- created_at (TIMESTAMPTZ)
```
**Used By:** Admin dashboard, companies page, company dashboards

### `software_assets`
```sql
- software_id (UUID)
- company_id (UUID)
- software_name (VARCHAR)
- vendor_name (VARCHAR)
- category (VARCHAR)
- total_annual_cost (DECIMAL)
- total_licenses (INTEGER)
- active_users (INTEGER)
- utilization_rate (DECIMAL)
- license_type (VARCHAR)
- renewal_date (DATE)
- contract_status (VARCHAR)
- waste_amount (DECIMAL)
- potential_savings (DECIMAL)
```
**Used By:** Software inventory, analytics, company dashboards

### `users`
```sql
- id (UUID)
- email (VARCHAR)
- password_hash (TEXT)
- full_name (VARCHAR)
- role (VARCHAR)
- company_id (UUID)
- is_active (BOOLEAN)
- last_login (TIMESTAMPTZ)
```
**Used By:** Authentication, user management

### `ai_agent_analyses`
```sql
- analysis_id (UUID)
- company_id (UUID)
- software_id (UUID)
- analysis_type (VARCHAR)
- analysis_data (JSONB)
- agent_version (VARCHAR)
- confidence_score (DECIMAL)
- status (VARCHAR)
- created_at (TIMESTAMPTZ)
```
**Used By:** AI analysis (when Python agents integrated)

### `client_reports`
```sql
- report_id (UUID)
- company_id (UUID)
- report_type (VARCHAR)
- report_data (JSONB)
- generated_by (VARCHAR)
- generated_at (TIMESTAMPTZ)
```
**Used By:** Reports feature (not yet implemented)

---

## ⚠️ Placeholder Data (Clearly Marked)

### AI Agent Mock Responses
**Location:** `/api/agents/analyze/route.ts`
**Purpose:** Placeholder until Python AI agents are integrated
**User Impact:** Only seen when user explicitly clicks "Run Analysis"
**Status:** Clearly documented with comments in code

---

## 🎯 Summary

### Real Data ✅
- ✅ All company information
- ✅ All software inventory
- ✅ All user authentication
- ✅ All analytics calculations
- ✅ All dashboard metrics

### No Mock Data ❌
- ❌ Admin dashboard - uses real companies count
- ❌ Admin companies - uses real companies list
- ❌ Admin analytics - uses real software aggregations
- ❌ Company dashboards - uses real software data
- ❌ Software inventory - uses real software assets

### Future Enhancements 🚀
1. **Time-series tracking** - Need to collect historical data over time
2. **Email engagement** - Need to implement email tracking
3. **Client acquisition funnel** - Need CRM integration
4. **AI agent integration** - Connect Python AI agents
5. **Report generation** - Implement PDF/Excel export

---

## 🔍 How to Verify Data is Real

### Test Database Connection
```bash
node test-db-connection.js
```
Shows:
- ✓ 3 companies (BioRad, CoorsTek, easyJet)
- ✓ 1 user
- ✓ 12 software assets

### Check Live Data in Browser
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to any page
4. See API calls to `/api/companies`, `/api/software`
5. Inspect response - all data from Neon database

### Verify in Neon Console
1. Go to Neon dashboard
2. Open SQL Editor
3. Run: `SELECT * FROM companies;`
4. Compare with app display - should match exactly

---

## ✅ Compliance

**Status:** All user-facing data comes from Neon database

**Last Verified:** 2025-11-01

**No Mock Data in UI:** Confirmed ✅
