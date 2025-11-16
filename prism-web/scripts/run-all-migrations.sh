#!/bin/bash

echo "🚀 Running all pending migrations..."
echo ""

cd /home/jbandu/prism/prism-web

# Run each migration, continuing even if some fail
for migration in \
  create-contracts-tables.sql \
  create-enhancement-agent-tables.sql \
  create-gamification-tables.sql \
  create-negotiation-tables.sql \
  create-vendor-risk-table.sql \
  create-usage-analytics-tables.sql \
  create-renewal-alerts-table.sql \
  create-savings-simulator-table.sql
do
  echo "📄 Running $migration..."
  psql "$DATABASE_URL" < "migrations/$migration" 2>&1 | grep -E "(CREATE|ERROR|already exists)" | head -5
  echo ""
done

echo "✨ Migration run complete!"
