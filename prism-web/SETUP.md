# PRISM Web Application Setup Guide

## Local Development Setup (MacBook)

### 1. Install Dependencies
```bash
cd ~/prism/prism-web
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/prism?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

**To generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 4. Available Routes

**Admin Routes:**
- Dashboard: http://localhost:3000/admin/dashboard
- Companies: http://localhost:3000/admin/companies
- Analytics: http://localhost:3000/admin/analytics

**Company Routes (replace {companyId} with actual company ID):**
- Dashboard: http://localhost:3000/{companyId}/dashboard
- Software Inventory: http://localhost:3000/{companyId}/software
- Software Detail: http://localhost:3000/{companyId}/software/{softwareId}

**Example:**
- http://localhost:3000/acme-corp/dashboard
- http://localhost:3000/acme-corp/software

---

## Vercel Deployment Setup

### 1. Connect Your GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your `prism` repository
4. Select the `prism-web` directory as the root

### 2. Configure Environment Variables in Vercel

**CRITICAL: Add these environment variables in Vercel:**

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add the following variables for **Production, Preview, and Development**:

```
DATABASE_URL = your-neon-database-connection-string
NEXTAUTH_SECRET = your-generated-secret-key
NEXTAUTH_URL = https://your-app.vercel.app
NODE_ENV = production
```

**Getting your Neon Database URL:**
1. Go to [neon.tech](https://neon.tech)
2. Navigate to your project
3. Copy the connection string from the "Connection Details" section
4. Make sure it includes `?sslmode=require` at the end

**Setting NEXTAUTH_URL:**
- For production: `https://your-app-name.vercel.app`
- Vercel will provide this URL after first deployment

### 3. Deploy

After adding environment variables:
1. Click "Deploy" or push to your main branch
2. Vercel will automatically rebuild with the environment variables
3. The deployment should now work correctly

### 4. Troubleshooting Vercel Errors

**If you see "Application Error" on the deployed page:**

**Common Issue #1: Missing DATABASE_URL**
- Error: "Cannot read properties of null"
- Solution: Ensure DATABASE_URL is set in Vercel environment variables
- Redeploy after adding variables

**Common Issue #2: Invalid NEXTAUTH_SECRET**
- Error: "Invalid NEXTAUTH_SECRET"
- Solution: Generate a new secret with `openssl rand -base64 32` and add it to Vercel

**Common Issue #3: Wrong NEXTAUTH_URL**
- Error: "Redirect URI mismatch"
- Solution: Update NEXTAUTH_URL to match your Vercel deployment URL

**To view deployment errors:**
1. Go to your Vercel project dashboard
2. Click on the deployment
3. Click "Functions" to see runtime logs
4. Check for error messages

### 5. Redeploying After Fixing Variables

After adding/updating environment variables in Vercel:
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. The app should now work correctly

---

## Database Setup (Neon PostgreSQL)

### 1. Create a Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 2. Create Database Schema

Run the SQL schema from the `schema.sql` file in your Neon SQL Editor:
- Tables: companies, software_assets, usage_analytics, alternatives, vendor_intelligence, agent_analyses, client_reports, users

### 3. Seed Initial Data (Optional)

For testing, you can add sample data using the Neon SQL Editor.

---

## Accessing the Application

### Admin Access
- Email: jbandu@gmail.com
- Role: admin
- Can view all companies and analytics

### Company User Access
- Email: muhammad@biorad.com (example)
- Role: company_manager
- Can view only their company's data

**Note:** Authentication is configured in `lib/auth.ts` and uses NextAuth with credentials provider.

---

## Project Structure

```
prism-web/
├── app/
│   ├── (admin)/          # Admin dashboard and views
│   ├── (company)/        # Company portal views
│   ├── (auth)/           # Login/signup pages
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   ├── db-utils.ts       # Database utility functions
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Utility functions
├── types/
│   └── index.ts          # TypeScript type definitions
└── public/               # Static assets
```

---

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## Support

If you encounter issues:
1. Check that all environment variables are set correctly
2. Ensure DATABASE_URL is a valid Neon PostgreSQL connection string
3. Verify NEXTAUTH_SECRET is a valid base64 string
4. Check Vercel function logs for specific error messages
5. Try redeploying after fixing environment variables

---

## Next Steps

1. Set up your Neon database and run the schema
2. Configure environment variables locally and on Vercel
3. Test the application locally
4. Deploy to Vercel with proper environment variables
5. Add sample data for testing
