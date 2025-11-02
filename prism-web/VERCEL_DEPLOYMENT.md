# Vercel Deployment Guide

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A Neon database set up (https://neon.tech)
3. Your GitHub repository connected to Vercel

## Step 1: Connect Your Repository

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `prism-web` directory as the root directory

## Step 2: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

### Required Variables

1. **DATABASE_URL**
   - Get this from your Neon dashboard
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Example: `postgresql://myuser:mypass@ep-cool-darkness-123456.us-east-2.aws.neon.tech/prismdb?sslmode=require`

2. **NEXTAUTH_SECRET**
   - Generate with: `openssl rand -base64 32`
   - Use a strong, unique secret for production
   - Example: `yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9yJhbGciOiJI`

3. **NEXTAUTH_URL**
   - Set to your Vercel deployment URL
   - Example: `https://your-app.vercel.app`
   - Or use your custom domain if configured

### Optional Variables

4. **OPENAI_API_KEY**
   - Only needed if using AI features
   - Get from OpenAI dashboard

## Step 3: Set Environment Variables in Vercel

### Via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for all environments (Production, Preview, Development)
4. Click "Save"

### Via Vercel CLI:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

## Step 4: Deploy

After setting environment variables, Vercel will automatically deploy your app:

1. Push to your main branch
2. Vercel will detect the push and start building
3. Build should complete successfully with database connection

## Step 5: Verify Database Connection

After deployment:

1. Visit your deployed app URL
2. Try logging in with test credentials
3. Check Vercel logs for any database connection errors:
   ```bash
   vercel logs
   ```

## Troubleshooting

### Database Connection Errors

If you see database connection errors:

1. **Verify DATABASE_URL format**
   - Must include `?sslmode=require` for Neon
   - No trailing spaces or quotes
   - Proper URL encoding for special characters

2. **Check Neon database status**
   - Ensure database is not suspended (free tier suspends after inactivity)
   - Verify connection string in Neon dashboard

3. **Verify environment variables are set**
   ```bash
   vercel env ls
   ```

4. **Redeploy after adding environment variables**
   ```bash
   vercel --prod
   ```

### Authentication Errors

If authentication fails:

1. **NEXTAUTH_URL must match your deployment URL**
   - Use the full URL including https://
   - No trailing slash

2. **NEXTAUTH_SECRET must be set**
   - Generate a new one if needed
   - Ensure it's the same across all environments

## Common Issues

### Issue: "sql is not a function" or "Cannot read properties of null"
**Solution:** DATABASE_URL is not set or is empty. Verify in Vercel dashboard.

### Issue: "Invalid credentials" but credentials are correct
**Solution:** Database might be empty. Run migrations to set up tables and seed data.

### Issue: Build succeeds but runtime errors
**Solution:** Environment variables might be set for wrong environment. Ensure they're set for "Production".

## Database Migrations

To run migrations on your Neon database:

1. Connect to your Neon database locally:
   ```bash
   psql "postgresql://user:password@host/database?sslmode=require"
   ```

2. Run migration files:
   ```bash
   psql "YOUR_DATABASE_URL" < ../database/migrations/001_initial_schema.sql
   psql "YOUR_DATABASE_URL" < ../database/migrations/002_prism_savings_log.sql
   ```

3. Run seed data:
   ```bash
   psql "YOUR_DATABASE_URL" < ../database/seed_easyjet.sql
   ```

## Performance Optimization

For better performance on Vercel:

1. **Use Neon's serverless driver** (already configured)
2. **Enable connection pooling** in Neon dashboard
3. **Set appropriate regions** - choose Neon region closest to your Vercel deployment region

## Support

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Next.js Docs: https://nextjs.org/docs
