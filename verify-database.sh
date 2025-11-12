#!/bin/bash
# Verify PRISM database schema is complete

set -e

DB_URL='postgresql://neondb_owner:npg_7rXmeJNOpq6t@ep-cool-water-ahfkgovu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

echo "🔍 PRISM Database Schema Verification"
echo "======================================"
echo ""

echo "Checking required tables..."
echo ""

# Check all required tables
REQUIRED_TABLES=(
  "users"
  "companies"
  "software"
  "software_catalog"
  "feature_categories"
  "software_features"
  "feature_overlaps"
  "feature_comparison_matrix"
  "consolidation_recommendations"
  "feature_analysis_cache"
  "software_alternatives"
  "alternative_evaluations"
  "software_peer_reviews"
  "software_switches"
  "contracts"
  "negotiation_sessions"
  "usage_analytics"
  "achievements"
  "leaderboard"
)

MISSING_TABLES=()

for table in "${REQUIRED_TABLES[@]}"; do
  result=$(psql "$DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');")
  if [[ $result == *"t"* ]]; then
    echo "✅ $table"
  else
    echo "❌ $table (MISSING)"
    MISSING_TABLES+=("$table")
  fi
done

echo ""
echo "======================================"

if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
  echo "🎉 All required tables exist!"
  echo ""
  echo "Table counts:"
  psql "$DB_URL" -c "
    SELECT
      table_name,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  "
else
  echo "⚠️  Missing ${#MISSING_TABLES[@]} table(s):"
  for table in "${MISSING_TABLES[@]}"; do
    echo "   - $table"
  done
  echo ""
  echo "Run: ./run-all-migrations.sh"
  exit 1
fi

echo ""
echo "✅ Database schema verified successfully!"
