# 🚀 Local Development Setup - PRISM

## Quick Start (5 minutes)

Your app is already configured to connect to Neon! Just need to start it.

### ✅ Current Configuration

```env
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech/neondb
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

**You're ready to go!**

---

## 🏃 Quick Start

```bash
# 1. Go to the app directory
cd ~/prism/prism-web

# 2. Install dependencies (if not already done)
npm install

# 3. Test database connection
npm run test:db

# 4. Start the development server
npm run dev
```

**That's it!** Open http://localhost:3000 in your browser.

---

## 📝 Step-by-Step Guide

### Step 1: Install Dependencies (2 minutes)

```bash
cd ~/prism/prism-web
npm install
```

**Expected output:**
```
added 327 packages in 45s
```

### Step 2: Test Database Connection (30 seconds)

```bash
# Test the connection
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL || require('dotenv').config() && process.env.DATABASE_URL);
(async () => {
  const result = await sql\`SELECT current_database(), count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'\`;
  console.log('✅ Connected to:', result[0].current_database);
  console.log('✅ Tables found:', result[0].table_count);
})();
"
```

**Expected output:**
```
✅ Connected to: neondb
✅ Tables found: 47
```

### Step 3: Start Development Server (5 seconds)

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.1.4
- Local:        http://localhost:3000
- Environments: .env

✓ Starting...
✓ Ready in 2.3s
```

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

---

## 🔍 Troubleshooting

### Issue: "Cannot find module '@neondatabase/serverless'"

**Solution:**
```bash
cd ~/prism/prism-web
npm install
```

### Issue: "DATABASE_URL is not set"

**Solution:**
```bash
# Check if .env file exists
ls -la ~/prism/prism-web/.env

# If missing, copy from example
cp .env.example .env

# Edit with your Neon credentials
nano .env
```

### Issue: "Connection refused" or "Cannot connect to database"

**Solution:**
```bash
# Test database URL directly
curl -I https://ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech

# Check if you're behind a firewall
ping ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm run dev
```

---

## 🎯 Development Workflow

### Running the App

```bash
# Start development server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start
```

### Database Operations

```bash
# Run all migrations
npm run migrate:all

# Export current schema
npm run schema:export

# Seed software catalog
npm run seed:software-catalog
```

### Testing

```bash
# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Seed test data
npm run test:seed
```

---

## 🔧 Configuration

### Environment Variables

Your `.env` file contains:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=TkfjGVE+f7ocoHsU5dT2f546uXy5wGC7pyfmVFdm7XY=
NEXTAUTH_URL=http://localhost:3000

# API Keys (optional)
OPENAI_API_KEY=sk-proj-...

# Development mode
NODE_ENV=development
```

### Port Configuration

By default, the app runs on **port 3000**. To change:

```bash
# Method 1: Environment variable
PORT=3001 npm run dev

# Method 2: Add to .env
echo "PORT=3001" >> .env
```

---

## 🌐 Local vs Cloud Database

### Current Setup: Local App → Cloud Database (Neon)

```
┌─────────────────┐
│ Your Computer   │
│                 │
│ localhost:3000  │
│ (Next.js App)   │
└────────┬────────┘
         │
         │ DATABASE_URL
         │
         ▼
┌─────────────────┐
│  Neon Cloud     │
│                 │
│  PostgreSQL DB  │
│  (Production)   │
└─────────────────┘
```

**Advantages:**
✅ No local database needed
✅ Same data as production
✅ Test against real data
✅ Team can share database

**Considerations:**
⚠️ Requires internet connection
⚠️ Changes affect shared database
⚠️ Slightly higher latency

### Alternative: Local Database

If you want a fully local setup:

```bash
# Install PostgreSQL locally
sudo apt install postgresql postgresql-contrib

# Create local database
sudo -u postgres createdb prism_dev

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/prism_dev

# Run migrations
npm run migrate:all
```

---

## 🔐 Security Best Practices

### For Local Development

✅ **Your current setup is fine for local dev**
- `.env` file is gitignored
- Database URL is secure
- NEXTAUTH_SECRET is properly set

### For Production

When deploying to Vercel:
1. **Never commit `.env` to git** (already gitignored ✅)
2. **Add environment variables in Vercel dashboard**
3. **Use different NEXTAUTH_SECRET** for production
4. **Update NEXTAUTH_URL** to your domain

---

## 📊 Database Access

### View Database in Browser

Use a database GUI tool:

**Option 1: neon.tech Console**
```
https://console.neon.tech
→ Select your project
→ Open SQL Editor
```

**Option 2: DBeaver (Desktop App)**
```bash
# Install DBeaver
sudo snap install dbeaver-ce

# Connection details:
Host: ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
Password: (from DATABASE_URL)
SSL: Require
```

**Option 3: psql (Command Line)**
```bash
# Install psql
sudo apt install postgresql-client

# Connect
psql "postgresql://neondb_owner:npg_...@ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Run queries
SELECT * FROM companies LIMIT 5;
```

---

## 🎨 Development Tips

### Hot Reload

Next.js automatically reloads when you save files:

```bash
# Start dev server
npm run dev

# Edit any file in:
# - app/
# - components/
# - lib/

# Browser refreshes automatically!
```

### API Routes

Test API endpoints locally:

```bash
# With curl
curl http://localhost:3000/api/companies

# With browser
open http://localhost:3000/api/companies

# With httpie
http localhost:3000/api/companies
```

### Database Queries

Monitor database queries in development:

```typescript
// In lib/db.ts
export const sql = neon(process.env.DATABASE_URL || "", {
  onQuery: (query) => {
    console.log('🔍 Query:', query.slice(0, 100));
  }
});
```

---

## 🚀 Quick Commands Reference

```bash
# Start development
npm run dev                    # http://localhost:3000

# Database
npm run migrate:all           # Run all migrations
npm run schema:export         # Export schema

# Testing
npm run test:e2e             # Run E2E tests
npm run test:e2e:ui          # Test with UI

# Production
npm run build                # Build for production
npm run start                # Run production build

# Cleanup
rm -rf .next node_modules    # Clean build
npm install                  # Reinstall
```

---

## 📝 Common Tasks

### Add a New Feature

```bash
# 1. Create component
touch app/components/NewFeature.tsx

# 2. Add API route
touch app/api/new-feature/route.ts

# 3. Update database if needed
npm run migrate:all

# 4. Test locally
npm run dev
# Open http://localhost:3000/new-feature
```

### Debug Database Issues

```bash
# 1. Check connection
curl -I https://ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech

# 2. Export schema
npm run schema:export

# 3. Check tables
psql $DATABASE_URL -c "\dt"

# 4. View logs
tail -f .next/trace
```

---

## 🎯 Next Steps

1. **Start the dev server**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Check database tables**: Browse to `/admin` or `/dashboard`
4. **Make changes**: Edit files and see hot reload
5. **Test features**: Try creating companies, software, etc.

**You're ready to develop! 🚀**

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Neon Database**: https://neon.tech/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

Need help? Check the docs or run: `./QUICK_START_COMMANDS.sh`
