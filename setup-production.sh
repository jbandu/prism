#!/bin/bash
set -e

echo "🚀 PRISM Production Setup Script"
echo "================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set your DATABASE_URL first:"
    echo "  export DATABASE_URL='your-database-url-from-vercel'"
    echo ""
    echo "You can get it from:"
    echo "  1. Vercel Dashboard → Your Project → Settings → Environment Variables"
    echo "  2. Or run: vercel env pull .env.local (after vercel login)"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Step 1: Run database migration
echo "📊 Step 1: Running database migration..."
echo "----------------------------------------"
psql "$DATABASE_URL" < database/migrations/003_feature_overlap_system.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

echo ""

# Step 2: Seed software catalog
echo "🌱 Step 2: Seeding software catalog..."
echo "----------------------------------------"
cd prism-web
npm run seed:software-catalog

if [ $? -eq 0 ]; then
    echo "✅ Seeding completed successfully"
else
    echo "❌ Seeding failed"
    exit 1
fi

echo ""
echo "🎉 Production setup complete!"
echo ""
echo "Next steps:"
echo "  1. Verify ANTHROPIC_API_KEY is set in Vercel (you confirmed it already is)"
echo "  2. Create PR from branch 'claude/fix-auth-api-endpoints-011CUiQays2FPjCDwRmvF3rD' to main"
echo "  3. Merge the PR to trigger Vercel deployment"
echo "  4. Test the Redundancy Analysis feature at /{companyId}/redundancy"
echo ""
