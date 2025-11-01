# PRISM Quick Start Guide

## ✅ Your Directory Structure is Correct

You have a monorepo setup:

```
/home/jbandu/prism/              ← Parent project (Python agents, database)
├── database/                     ← Database scripts & migrations
├── agents/                       ← Python AI agents
├── config/                       ← Configuration files
└── prism-web/                   ← Next.js web application ⭐ YOU ARE HERE
    ├── app/                      ← Next.js 14 App Router
    ├── components/               ← React components
    ├── lib/                      ← Utilities & database
    ├── types/                    ← TypeScript types
    ├── .env                      ← Environment variables
    └── package.json              ← Node.js dependencies
```

**This structure is fine!** Keep it as is.

---

## 🚀 Starting the App (Clean)

If you ever see black/white pages or CSS issues, run this:

### 1. Clean Build Cache
```bash
cd ~/prism/prism-web

# Remove corrupted cache
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Visit: **http://localhost:3000/login**

---

## 🔐 Login Credentials

- **Email:** `jbandu@gmail.com`
- **Password:** `Password123!`

---

## 🎯 Common Issues & Fixes

### Issue: Black & White Page (No CSS)

**Cause:** Corrupted Next.js build cache

**Fix:**
```bash
rm -rf .next && npm run build && npm run dev
```

### Issue: 404 Errors for CSS/JS Files

**Cause:** Stale webpack cache

**Fix:**
```bash
rm -rf .next node_modules/.cache
npm run build
```

### Issue: "Cannot find module" Errors

**Cause:** Missing dependencies

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database Connection Failed

**Cause:** DATABASE_URL not set or incorrect

**Fix:**
```bash
# Test connection
node test-db-connection.js

# If fails, check .env file
cat .env | grep DATABASE_URL
```

### Issue: Login Not Working

**Cause:** NEXTAUTH_SECRET not set

**Fix:**
```bash
# Test auth
node test-auth.js

# Check environment
cat .env | grep NEXTAUTH
```

---

## 📁 Working Directory

**Always run commands from:** `/home/jbandu/prism/prism-web/`

```bash
# Check where you are
pwd

# If you're in /home/jbandu/prism, go into prism-web:
cd prism-web

# Now run npm commands
npm run dev
```

---

## 🛠️ Development Commands

```bash
# Development server (auto-reload)
npm run dev

# Production build
npm run build

# Production server
npm start

# Lint code
npm run lint

# Test database connection
node test-db-connection.js

# Test authentication
node test-auth.js
```

---

## 🌐 Available URLs

Once logged in:

### Admin Pages
- Dashboard: `http://localhost:3000/admin/dashboard`
- Companies: `http://localhost:3000/admin/companies`
- Analytics: `http://localhost:3000/admin/analytics`
- Settings: `http://localhost:3000/admin/settings`

### Company Pages (replace `[companyId]` with actual ID)
- BioRad Dashboard: `http://localhost:3000/biorad/dashboard`
- CoorsTek Dashboard: `http://localhost:3000/coorstek/dashboard`
- easyJet Dashboard: `http://localhost:3000/easyjet/dashboard`

- Software: `http://localhost:3000/[companyId]/software`
- Alternatives: `http://localhost:3000/[companyId]/alternatives`
- Renewals: `http://localhost:3000/[companyId]/renewals`
- Reports: `http://localhost:3000/[companyId]/reports`
- Settings: `http://localhost:3000/[companyId]/settings`

---

## 🔄 If Something Goes Wrong

**Nuclear Option** (completely reset):

```bash
# Stop the dev server (Ctrl+C)

# Clean everything
rm -rf .next node_modules/.cache

# Reinstall dependencies (if needed)
# rm -rf node_modules package-lock.json
# npm install

# Rebuild
npm run build

# Start fresh
npm run dev
```

---

## 📦 What's Connected

✅ **Database:** Neon PostgreSQL (cloud)
- 3 Companies: BioRad, CoorsTek, easyJet
- 12 Software assets
- 1 Admin user (you)

✅ **Authentication:** NextAuth.js with JWT
- Session stored in secure HTTP-only cookies
- Passwords hashed with bcrypt

✅ **Styling:** Tailwind CSS + Shadcn UI
- Should load automatically on build
- If black/white → rebuild

✅ **Data:** All real, no mock data
- Companies from database
- Software from database
- Users from database

---

## 💡 Pro Tips

1. **Always work from `~/prism/prism-web/`**
2. **If styles break:** `rm -rf .next && npm run build`
3. **Keep dev server running** for auto-reload
4. **Check browser console** for errors (F12)
5. **Check terminal** for server errors

---

## 🆘 Need Help?

1. **Test database:** `node test-db-connection.js`
2. **Test auth:** `node test-auth.js`
3. **Check logs:** Look at terminal where `npm run dev` is running
4. **Browser console:** Press F12 in browser

---

## ✨ You're All Set!

Your app is ready to use. Just run:

```bash
cd ~/prism/prism-web
npm run dev
```

Then visit: **http://localhost:3000/login**

Happy coding! 🚀
