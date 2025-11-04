#!/bin/bash

# Script to print migration SQL files for manual execution

echo "======================================================================"
echo "MIGRATION #1: Alternatives Tables (Feature #2)"
echo "======================================================================"
echo ""
cat migrations/create-alternatives-tables.sql
echo ""
echo ""
echo "======================================================================"
echo "MIGRATION #2: Contracts Tables (Feature #3)"
echo "======================================================================"
echo ""
cat migrations/create-contracts-tables.sql
echo ""
echo ""
echo "======================================================================"
echo "MIGRATION #3: Usage Analytics Tables (Feature #4)"
echo "======================================================================"
echo ""
cat migrations/create-usage-analytics-tables.sql
echo ""
echo ""
echo "======================================================================"
echo "All migrations printed above. Copy and paste into Neon SQL Editor."
echo "Neon Console: https://console.neon.tech"
echo "======================================================================"
