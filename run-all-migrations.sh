#!/bin/bash
# Run all PRISM migrations for production database

set -e  # Exit on any error

DB_URL='postgresql://neondb_owner:npg_7rXmeJNOpq6t@ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

echo "🗄️  Running PRISM Database Migrations"
echo "======================================"
echo ""

echo "📊 [1/7] Adding slug to companies..."
psql "$DB_URL" < prism-web/migrations/add-slug-to-companies.sql
echo "✅ Done"
echo ""

echo "🔄 [2/7] Creating alternatives tables..."
psql "$DB_URL" < prism-web/migrations/create-alternatives-tables.sql
echo "✅ Done"
echo ""

echo "📄 [3/7] Creating contracts tables..."
psql "$DB_URL" < prism-web/migrations/create-contracts-tables.sql
echo "✅ Done"
echo ""

echo "🎮 [4/7] Creating gamification tables..."
psql "$DB_URL" < prism-web/migrations/create-gamification-tables.sql
echo "✅ Done"
echo ""

echo "💬 [5/7] Creating messaging integration tables..."
psql "$DB_URL" < prism-web/migrations/create-messaging-integration-tables.sql
echo "✅ Done"
echo ""

echo "💰 [6/7] Creating negotiation tables..."
psql "$DB_URL" < prism-web/migrations/create-negotiation-tables.sql
echo "✅ Done"
echo ""

echo "📈 [7/7] Creating usage analytics tables..."
psql "$DB_URL" < prism-web/migrations/create-usage-analytics-tables.sql
echo "✅ Done"
echo ""

echo "🎉 =========================================="
echo "🎉 All Migrations Complete!"
echo "🎉 =========================================="
echo ""
echo "✅ Company slugs added"
echo "✅ Alternatives system ready"
echo "✅ Contracts management ready"
echo "✅ Gamification system ready"
echo "✅ Messaging integration ready"
echo "✅ Negotiation tracking ready"
echo "✅ Usage analytics ready"
echo ""
