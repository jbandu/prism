# PRISM Database Setup

This directory contains database schemas, migrations, and seed data for PRISM.

## 📁 Directory Structure

```
database/
├── migrations/
│   ├── 001_initial_schema.sql          # Base PRISM schema
│   └── 002_easyjet_schema_expansion.sql # Extended schema for easyJet data
├── seeds/
│   ├── biorad_seed.sql                  # BioRad sample data (basic)
│   └── easyjet_seed.sql                 # easyJet comprehensive data
└── README.md                             # This file
```

## 🚀 Quick Start

### 1. Create Database

```bash
# Using Neon (recommended)
# Create database at: https://console.neon.tech

# Or using local PostgreSQL
createdb prism
```

### 2. Run Migrations

```bash
# Run migrations in order
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f database/migrations/002_easyjet_schema_expansion.sql
```

### 3. Load Seed Data

```bash
# Load easyJet data (comprehensive)
psql $DATABASE_URL -f database/seeds/easyjet_seed.sql
```

## 📊 Schema Overview

### Core Tables (Migration 001)

#### companies
Core client information
- `company_id` (PK)
- `company_name`
- `industry`
- `employee_count`
- Financial data (revenue, profit)
- Metadata (founded_year, website, etc.)

#### users
Admin and client users
- `user_id` (PK)
- `email`, `password_hash`
- `role` (admin, company_manager, viewer)
- `company_id` (FK)

#### software
Software portfolio tracking
- `software_id` (PK)
- `company_id` (FK)
- Cost and usage data
- Contract information

#### usage_analytics
License utilization metrics
- `usage_id` (PK)
- `software_id` (FK)
- Utilization percentages
- Waste tracking

#### alternatives
AI-recommended alternatives
- `alternative_id` (PK)
- `software_id` (FK)
- Feature comparison
- Savings potential

#### vendor_intelligence
Vendor risk and market data
- `vendor_id` (PK)
- Financial health scores
- Risk factors
- Market positioning

### Extended Tables (Migration 002)

#### company_metrics
Detailed company KPIs
- Financial metrics
- Operational metrics
- Performance targets

#### contacts
Executive and stakeholder contacts
- C-level executives
- Decision makers
- Contact information

#### technologies
Technology stack tracking
- Cloud infrastructure
- AI/ML platforms
- Enterprise systems

#### vendors
Vendor/partner information
- System integrators
- Software vendors
- Consultants

#### contracts
Contract management
- Multi-year deals
- Renewal tracking
- Contract values

#### initiatives
Strategic initiatives
- Transformation projects
- AI implementations
- Business goals

#### opportunities
Sales and optimization opportunities
- Priority levels
- Estimated value
- Status tracking

#### pain_points
Customer challenges
- Operational issues
- Performance gaps
- Impact assessment

#### intelligence_notes
Company intelligence
- Market insights
- Strategy notes
- Research findings

## 🎯 Use Cases

### 1. Basic SaaS Portfolio Management
Use Migration 001 only for simple software tracking and cost optimization.

**Tables needed:**
- companies
- users
- software
- usage_analytics
- alternatives

### 2. Comprehensive Enterprise Intelligence
Use both migrations for full sales intelligence platform.

**All tables included**

## 📝 Seed Data

### easyJet Seed Data

Comprehensive real-world data including:

**Company Profile:**
- £9.3B revenue, £452M profit
- 89.7M annual passengers
- 355 aircraft fleet
- 2,000 daily flights

**24 Company Metrics:**
- Financial (revenue, profit, ROCE)
- Operational (passengers, load factor, routes)
- Baggage KPIs (delivery rates, SLA)
- System performance
- AI performance metrics

**11 Executive Contacts:**
- CEO: Kenton Jarvis
- CFO: Jan De Raeymaker
- CDO: Opal Perry
- Plus 8 other C-level executives

**19 Technologies:**
- AWS, Databricks, MLflow
- Jetstream AI assistant
- Aviation systems (easyRes, ICC, BHS)
- Enterprise (Workday)
- Automation (RPA, chatbots)

**17 Vendors:**
- TCS, NTT Data, Accenture
- Databricks, AWS
- Aviation tech vendors
- Strategic partners

**8 Active Contracts:**
- TCS transformation deal
- NTT Data $15.8M contract
- AWS cloud services
- Databricks platform

**7 Strategic Initiatives:**
- AI baggage analytics (94.2% accuracy)
- Jetstream AI assistant
- Cloud migration
- £1B profit target

**5 Business Opportunities:**
- Baggage automation
- Load time optimization
- AI platform expansion

**4 Pain Points:**
- Baggage delivery below target
- Load time gaps
- Transfer SLA improvement

**5 Intelligence Notes:**
- Technology strategy
- AI strategy
- Vendor relationships
- Financial performance
- Growth plans

## 🔧 Maintenance

### Backup Database

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Reset Database

```bash
# WARNING: This deletes all data
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then re-run migrations and seeds
```

### Update Seed Data

Edit `seeds/easyjet_seed.sql` and reload:

```bash
psql $DATABASE_URL -f database/seeds/easyjet_seed.sql
```

## 📊 Useful Queries

### Get Company Overview

```sql
SELECT * FROM v_company_overview WHERE company_id = 'easyjet_001';
```

### List Upcoming Renewals

```sql
SELECT * FROM v_upcoming_renewals ORDER BY days_until_renewal;
```

### High Priority Pain Points

```sql
SELECT * FROM v_high_priority_pain_points;
```

### Technology Stack by Category

```sql
SELECT category, COUNT(*) as tech_count, vendor
FROM technologies
WHERE company_id = 'easyjet_001' AND status = 'Active'
GROUP BY category, vendor
ORDER BY tech_count DESC;
```

### Contract Value by Vendor

```sql
SELECT
    v.vendor_name,
    COUNT(c.contract_id) as contract_count,
    SUM(c.contract_value) as total_value,
    c.currency
FROM contracts c
JOIN vendors v ON c.vendor_id = v.vendor_id
WHERE c.company_id = 'easyjet_001' AND c.status = 'Active'
GROUP BY v.vendor_name, c.currency
ORDER BY total_value DESC;
```

## 🌐 Neon Database Setup

### Create Production Database

1. Go to https://console.neon.tech
2. Create new project: `prism-production`
3. Copy connection string
4. Add to Vercel environment variables

### Connection String Format

```
postgresql://user:password@ep-xyz.neon.tech/prism?sslmode=require
```

### Run Migrations on Neon

```bash
# Set environment variable
export DATABASE_URL="postgresql://..."

# Run migrations
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f database/migrations/002_easyjet_schema_expansion.sql

# Load seed data
psql $DATABASE_URL -f database/seeds/easyjet_seed.sql
```

## 🔐 Security

- Never commit actual connection strings
- Use environment variables
- Rotate credentials regularly
- Use read-only users for analytics

## 📚 Documentation

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Neon Docs](https://neon.tech/docs/)
- [SQL Best Practices](https://www.postgresql.org/docs/current/sql.html)

---

**Need help?** Contact jbandu@gmail.com
