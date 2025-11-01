# PRISM Local Development Setup

This guide will help you set up PRISM for local development, connecting to the Neon database.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Internet connection (to access Neon database)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Your `.env` file is already configured with:

```env
# Database - Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:...@ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Authentication
NEXTAUTH_SECRET=TkfjGVE+f7ocoHsU5dT2f546uXy5wGC7pyfmVFdm7XY=
NEXTAUTH_URL=http://localhost:3000

# API Keys
OPENAI_API_KEY=sk-proj-abc123xyz789

# App Settings
NODE_ENV=development
```

**Important:** Never commit your `.env` file to version control!

### 3. Test Database Connection

Before starting the app, verify your connection to Neon:

```bash
node test-db-connection.js
```

You should see:
```
✅ All database tests passed!
🚀 Your local app should work correctly with Neon database.
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## Login Credentials

Your database was seeded with a default admin account:

- **Email:** `jbandu@gmail.com`
- **Password:** `Password123!`
- **Role:** Admin (full access to all companies)

⚠️ **Important:** Change this password after your first login!

See `LOGIN_INFO.md` for complete authentication details and how to create additional users.

## Available Pages

Once logged in, you can access:

### Admin Dashboard
- **URL:** `http://localhost:3000/admin/dashboard`
- Overview of all clients and platform metrics

### Admin - Clients
- **URL:** `http://localhost:3000/admin/companies`
- Manage all client companies
- View: BioRad Laboratories, CoorsTek, easyJet

### Company Dashboards
- **BioRad:** `http://localhost:3000/biorad/dashboard`
- **CoorsTek:** `http://localhost:3000/coorstek/dashboard`
- **easyJet:** `http://localhost:3000/easyjet/dashboard`

### Company Features (for each company)
- `/[companyId]/software` - Software inventory
- `/[companyId]/alternatives` - Alternative recommendations
- `/[companyId]/renewals` - Contract renewals
- `/[companyId]/reports` - Reports
- `/[companyId]/settings` - Settings

## Database Structure

Your Neon database contains:

```
✓ 3 Companies (BioRad, CoorsTek, easyJet)
✓ 1 Admin User
✓ 12 Software Assets
✓ Complete schema with all tables
```

## Troubleshooting

### Database Connection Issues

If you see connection errors:

1. **Check your internet connection** - Neon requires internet access
2. **Verify DATABASE_URL** - Ensure it's correctly set in `.env`
3. **Test connection:**
   ```bash
   node test-db-connection.js
   ```

### Authentication Issues

If login fails:

1. **Check NEXTAUTH_SECRET** is set in `.env`
2. **Verify user exists** in database
3. **Reset user password** if needed:
   ```bash
   cd ../database
   node create_user.js
   ```

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 npm run dev
```

Then access at: `http://localhost:3001`

## Development Workflow

### Adding New Companies

1. Go to Admin Dashboard
2. Click "Add Client"
3. Fill in company details
4. The company will be saved to Neon database

### Adding Software Assets

1. Navigate to company dashboard
2. Go to "Software Inventory" tab
3. Click "Add Software"
4. Enter software details

### Viewing Real Data

All data displayed in the app comes directly from your Neon database:
- No mock data
- Real-time updates
- Persistent across sessions

## Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Test database connection
node test-db-connection.js
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Database:** Neon PostgreSQL (serverless)
- **Authentication:** NextAuth.js
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

## Project Structure

```
prism-web/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (company)/         # Company-specific pages
│   ├── admin/             # Admin dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── shared/           # Shared components
│   └── ui/               # UI components (Shadcn)
├── lib/                   # Utility functions
│   ├── db.ts             # Database connection
│   ├── db-utils.ts       # Database queries
│   ├── auth.ts           # Authentication config
│   └── validations.ts    # Zod schemas
├── types/                 # TypeScript types
└── .env                   # Environment variables
```

## Need Help?

- Check the main project README: `../database/README.md`
- View database schema: `../database/complete_schema.sql`
- See seed data: `../database/seeds/`

## Production Deployment

This app can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Any Node.js hosting platform

**Note:** Your Neon database is already production-ready and globally available!

---

**Happy coding!** 🚀
