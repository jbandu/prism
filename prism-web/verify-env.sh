#!/bin/bash

echo "🔍 Verifying Environment Variables..."
echo ""

# Load .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

source .env.local

# Check each variable
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name - NOT SET"
        return 1
    else
        echo "✅ $var_name - Set (${#var_value} chars)"
        return 0
    fi
}

echo "Autonomous Feature System Variables:"
echo "────────────────────────────────────"

check_var "ANTHROPIC_API_KEY"
check_var "GITHUB_TOKEN"
check_var "GITHUB_REPO_OWNER"
check_var "GITHUB_REPO_NAME"
check_var "VERCEL_TOKEN"
check_var "VERCEL_TEAM_ID"
check_var "VERCEL_PROJECT_ID"
check_var "RESEND_API_KEY"
check_var "ADMIN_EMAIL"
check_var "DATABASE_URL"

echo ""
echo "Testing API Connections:"
echo "────────────────────────────────────"

# Test GitHub
echo -n "GitHub API: "
if curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
     https://api.github.com/user | grep -q login; then
    echo "✅ Connected"
else
    echo "❌ Failed"
fi

# Test Vercel
echo -n "Vercel API: "
if curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
     https://api.vercel.com/v9/projects | grep -q projects; then
    echo "✅ Connected"
else
    echo "❌ Failed"
fi

# Test Anthropic
echo -n "Anthropic API: "
if curl -s https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}' \
     | grep -q content; then
    echo "✅ Connected"
else
    echo "❌ Failed"
fi

# Test Resend
echo -n "Resend API: "
if curl -s -X GET https://api.resend.com/domains \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     | grep -q data; then
    echo "✅ Connected"
else
    echo "❌ Failed"
fi

echo ""
echo "────────────────────────────────────"
echo "✅ Verification complete!"
