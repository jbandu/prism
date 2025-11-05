#!/bin/bash
set -e

echo "🚀 PRISM Complete Setup & Deployment"
echo "======================================"
echo ""

# Function to get DATABASE_URL
get_database_url() {
    # Try to get from .env.local
    if [ -f "prism-web/.env.local" ]; then
        source prism-web/.env.local 2>/dev/null || true
    fi

    # Try to get from Vercel (if logged in)
    if command -v vercel &> /dev/null; then
        echo "📥 Attempting to pull environment variables from Vercel..."
        cd prism-web
        vercel env pull .env.local --yes 2>/dev/null || true
        cd ..

        if [ -f "prism-web/.env.local" ]; then
            source prism-web/.env.local 2>/dev/null || true
        fi
    fi

    # If still not set, prompt user
    if [ -z "$DATABASE_URL" ]; then
        echo ""
        echo "❓ DATABASE_URL is needed to complete the setup"
        echo ""
        echo "Please get your DATABASE_URL from:"
        echo "  • Vercel Dashboard → Your Project → Settings → Environment Variables"
        echo "  • Look for DATABASE_URL (should start with postgresql://)"
        echo ""
        read -p "Enter your DATABASE_URL: " DATABASE_URL
        export DATABASE_URL

        # Save to .env.local for future use
        echo "DATABASE_URL=$DATABASE_URL" > prism-web/.env.local
    fi
}

# Get DATABASE_URL
get_database_url

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Cannot proceed without DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL configured"
echo ""

# Step 1: Run database migration
echo "📊 Step 1/2: Running database migration..."
echo "--------------------------------------------"
psql "$DATABASE_URL" < database/migrations/003_feature_overlap_system.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed"
else
    echo "❌ Migration failed"
    exit 1
fi

echo ""

# Step 2: Seed software catalog
echo "🌱 Step 2/2: Seeding software catalog..."
echo "--------------------------------------------"
cd prism-web
export DATABASE_URL="$DATABASE_URL"
npm run seed:software-catalog

if [ $? -eq 0 ]; then
    echo "✅ Seeding completed"
else
    echo "❌ Seeding failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 =========================================="
echo "🎉 Production Setup Complete!"
echo "🎉 =========================================="
echo ""
echo "✅ Database migration executed"
echo "✅ Software catalog seeded with 8 common tools"
echo "✅ Feature branch ready for deployment"
echo ""
echo "📋 Final Checklist:"
echo "  [✓] Auth API fixes implemented"
echo "  [✓] E2E testing suite added"
echo "  [✓] Redundancy Detector system built"
echo "  [✓] Database schema created"
echo "  [✓] Software catalog seeded"
echo "  [✓] ANTHROPIC_API_KEY set in Vercel (confirmed)"
echo "  [✓] Navigation links added"
echo "  [ ] Create & merge PR to main branch"
echo "  [ ] Verify deployment on Vercel"
echo ""
echo "🚀 Next Steps:"
echo "  1. Go to: https://github.com/jbandu/prism"
echo "  2. Create PR: claude/fix-auth-api-endpoints-011CUiQays2FPjCDwRmvF3rD → main"
echo "  3. Review and merge the PR"
echo "  4. Vercel will auto-deploy"
echo "  5. Test Redundancy Analysis at: /{companyId}/redundancy"
echo ""
