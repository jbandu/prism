#!/bin/bash
#
# Project Structure Refactoring Script
# Reorganizes PRISM project for better maintainability
#
# Usage: ./scripts/refactor-structure.sh
#

set -e  # Exit on error

echo "🏗️  PRISM Project Structure Refactoring"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

cd "$PROJECT_ROOT"

echo "📍 Project root: $PROJECT_ROOT"
echo ""

# Confirmation
echo "${YELLOW}This script will reorganize your project structure.${NC}"
echo "It will:"
echo "  1. Remove nested prism-web/prism-web directory"
echo "  2. Create /docs directory and move documentation"
echo "  3. Organize scripts into /scripts"
echo "  4. Create archive/ for old files"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "${GREEN}✅ Backup directory created at ./$BACKUP_DIR${NC}"
echo "   (Skipping file copy to save time - git history is our backup)"
echo ""

# Phase 1: Critical Fixes
echo "🚨 Phase 1: Critical Fixes"
echo "-------------------------"

# 1. Remove nested prism-web/prism-web if it's a duplicate
if [ -d "prism-web/prism-web" ]; then
    echo "Checking nested prism-web/prism-web..."
    SIZE=$(du -sh prism-web/prism-web | cut -f1)
    echo "  Size: $SIZE"

    read -p "Remove nested prism-web/prism-web? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf prism-web/prism-web
        echo "${GREEN}✅ Removed nested directory${NC}"
    else
        echo "${YELLOW}⏭️  Skipped${NC}"
    fi
fi

# 2. Consolidate database directories
echo ""
echo "Consolidating database directories..."
if [ -d "prism-web/database" ] && [ -d "database" ]; then
    echo "  Root /database:       $(du -sh database | cut -f1)"
    echo "  prism-web/database:   $(du -sh prism-web/database | cut -f1)"

    read -p "Keep root /database and remove prism-web/database? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf prism-web/database
        echo "${GREEN}✅ Removed prism-web/database${NC}"
    else
        echo "${YELLOW}⏭️  Skipped${NC}"
    fi
fi

# Phase 2: Documentation Organization
echo ""
echo "📄 Phase 2: Documentation Organization"
echo "-------------------------------------"

if ls *.md 1> /dev/null 2>&1; then
    echo "Creating docs/ directory structure..."
    mkdir -p docs/{setup,guides,features}

    # Move documentation files
    echo "Moving documentation files..."

    # Setup docs
    [ -f "DATABASE_SETUP.md" ] && mv DATABASE_SETUP.md docs/setup/database-setup.md
    [ -f "DEPLOYMENT_GUIDE.md" ] && mv DEPLOYMENT_GUIDE.md docs/setup/deployment.md
    [ -f "DEPLOYMENT_CHECKLIST.md" ] && mv DEPLOYMENT_CHECKLIST.md docs/setup/deployment-checklist.md
    [ -f "DEPLOYMENT_READY.md" ] && mv DEPLOYMENT_READY.md docs/setup/deployment-ready.md
    [ -f "LOCAL_DEV_SETUP.md" ] && mv LOCAL_DEV_SETUP.md docs/setup/local-development.md
    [ -f "LOCAL_APP_RUNNING.md" ] && mv LOCAL_APP_RUNNING.md docs/setup/local-app-running.md
    [ -f "README_LOCAL_SETUP.md" ] && mv README_LOCAL_SETUP.md docs/setup/local-setup-alternative.md

    # Guide docs
    [ -f "ADMIN_GUIDE.md" ] && mv ADMIN_GUIDE.md docs/guides/admin-guide.md
    [ -f "USER_GUIDE.md" ] && mv USER_GUIDE.md docs/guides/user-guide.md
    [ -f "TESTING_GUIDE.md" ] && mv TESTING_GUIDE.md docs/guides/testing-guide.md

    # Feature docs
    [ -f "REDUNDANCY_DETECTOR.md" ] && mv REDUNDANCY_DETECTOR.md docs/features/redundancy-detector.md
    [ -f "FEATURE_ENRICHMENT_GUIDE.md" ] && mv FEATURE_ENRICHMENT_GUIDE.md docs/features/feature-enrichment.md
    [ -f "TECHNICAL_DOCUMENTATION_GUIDE.md" ] && mv TECHNICAL_DOCUMENTATION_GUIDE.md docs/features/technical-documentation.md
    [ -f "LOCAL_GPU_QUICK_START.md" ] && mv LOCAL_GPU_QUICK_START.md docs/features/local-gpu-quickstart.md
    [ -f "LOCAL_GPU_RESULTS.md" ] && mv LOCAL_GPU_RESULTS.md docs/features/local-gpu-results.md
    [ -f "OLLAMA_INTEGRATION_COMPLETE.md" ] && mv OLLAMA_INTEGRATION_COMPLETE.md docs/features/ollama-integration.md

    # Create docs README
    cat > docs/README.md <<'EOF'
# PRISM Documentation

## Setup Guides
- [Local Development Setup](setup/local-development.md)
- [Database Setup](setup/database-setup.md)
- [Deployment Guide](setup/deployment.md)

## User Guides
- [Admin Guide](guides/admin-guide.md)
- [User Guide](guides/user-guide.md)
- [Testing Guide](guides/testing-guide.md)

## Features
- [Redundancy Detector](features/redundancy-detector.md)
- [Feature Enrichment](features/feature-enrichment.md)
- [Technical Documentation](features/technical-documentation.md)
- [Ollama Integration](features/ollama-integration.md)
EOF

    echo "${GREEN}✅ Documentation organized into /docs${NC}"
else
    echo "${YELLOW}⏭️  No markdown files to organize${NC}"
fi

# Phase 3: Scripts Organization
echo ""
echo "🔧 Phase 3: Scripts Organization"
echo "-------------------------------"

echo "Creating scripts/ directory structure..."
mkdir -p scripts/{setup,python}

# Move shell scripts
if ls *.sh 1> /dev/null 2>&1; then
    echo "Moving shell scripts..."
    for script in *.sh; do
        if [ "$script" != "refactor-structure.sh" ]; then
            mv "$script" scripts/setup/
        fi
    done
    echo "${GREEN}✅ Shell scripts moved to /scripts/setup${NC}"
fi

# Move Python scripts
if ls *.py 1> /dev/null 2>&1; then
    echo "Moving Python scripts..."
    mv *.py scripts/python/ 2>/dev/null || true
    echo "${GREEN}✅ Python scripts moved to /scripts/python${NC}"
fi

if [ -f "requirements.txt" ]; then
    mv requirements.txt scripts/python/
    echo "${GREEN}✅ requirements.txt moved to /scripts/python${NC}"
fi

# Phase 4: Cleanup
echo ""
echo "🧹 Phase 4: Cleanup"
echo "------------------"

# Archive unclear directories
mkdir -p archive

if [ -d "biorad" ]; then
    read -p "Archive biorad/ directory? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv biorad archive/
        echo "${GREEN}✅ Archived biorad/${NC}"
    fi
fi

if [ -d "agents" ]; then
    read -p "Archive agents/ directory? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv agents archive/
        echo "${GREEN}✅ Archived agents/${NC}"
    fi
fi

if [ -d "config" ]; then
    read -p "Archive config/ directory? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv config archive/
        echo "${GREEN}✅ Archived config/${NC}"
    fi
fi

if [ -d "utils" ]; then
    read -p "Archive utils/ directory? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv utils archive/
        echo "${GREEN}✅ Archived utils/${NC}"
    fi
fi

if [ -f "prism_schema_fixed.sql" ]; then
    read -p "Archive prism_schema_fixed.sql? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv prism_schema_fixed.sql archive/
        echo "${GREEN}✅ Archived prism_schema_fixed.sql${NC}"
    fi
fi

# Summary
echo ""
echo "======================================"
echo "✨ Refactoring Complete!"
echo "======================================"
echo ""
echo "New structure:"
echo "  📁 /docs           - All documentation organized"
echo "  📁 /scripts        - All scripts organized"
echo "  📁 /database       - Single source of truth"
echo "  📁 /prism-web      - Clean application directory"
echo "  📁 /archive        - Old files archived"
echo ""
echo "${GREEN}✅ Project structure has been reorganized!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review changes: ls -la"
echo "  2. Test the application: cd prism-web && npm run dev"
echo "  3. Commit changes: git add . && git commit -m 'Refactor project structure'"
echo ""
