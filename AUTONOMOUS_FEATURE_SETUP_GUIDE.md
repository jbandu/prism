# 🚀 AUTONOMOUS FEATURE SYSTEM - SETUP GUIDE

## 📋 ENVIRONMENT VARIABLES

Add these to your `.env.local` file:

```bash
# ========================================
# DATABASE (Neon PostgreSQL)
# ========================================
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# ========================================
# AUTHENTICATION (NextAuth)
# ========================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# ========================================
# ANTHROPIC (Claude API)
# ========================================
ANTHROPIC_API_KEY="sk-ant-api03-..."

# ========================================
# GITHUB
# ========================================
GITHUB_TOKEN="ghp_..."                    # Personal access token with repo scope
GITHUB_REPO_OWNER="jbandu"               # Your GitHub username/org
GITHUB_REPO_NAME="prism"                 # Your repo name

# ========================================
# VERCEL
# ========================================
VERCEL_TOKEN="your-vercel-token"         # From vercel.com/account/tokens
VERCEL_TEAM_ID="team_..."                # Your team ID
VERCEL_PROJECT_ID="prj_..."              # Your project ID

# ========================================
# EMAIL (Resend)
# ========================================
RESEND_API_KEY="re_..."                  # From resend.com
ADMIN_EMAIL="jbandu@gmail.com"           # Where to send admin notifications
FROM_EMAIL="PRISM <noreply@prism.ai>"    # From address

# ========================================
# APP SETTINGS
# ========================================
NEXT_PUBLIC_APP_URL="https://prism.ai"   # Your production URL
```

---

## 🔧 INSTALLATION STEPS

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk @octokit/rest @neondatabase/serverless resend

# Or with yarn
yarn add @anthropic-ai/sdk @octokit/rest @neondatabase/serverless resend
```

### 2. Install Claude Code CLI (for autonomous builds)

```bash
npm install -g @anthropic-ai/claude-code

# Or download from: https://docs.anthropic.com/claude-code
```

### 3. Database Setup

The schema is already created in Neon. Verify tables exist:

```sql
-- Should return 4 tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feature_requests', 'feature_votes', 'build_attempts', 'autonomous_build_config');
```

### 4. Create File Structure

Copy all the API files to your Next.js project:

```
prism-web/
├── app/
│   └── api/
│       ├── features/
│       │   ├── request/route.ts
│       │   ├── refine/route.ts
│       │   └── finalize/route.ts
│       └── admin/
│           └── features/
│               ├── pending/route.ts
│               ├── approve/route.ts
│               ├── reject/route.ts
│               └── build/route.ts
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── claude.ts
│   ├── github.ts
│   ├── vercel.ts
│   └── notifications.ts
└── types/
    └── features.ts
```

### 5. GitHub Setup

**Create Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy token to `GITHUB_TOKEN` env var

### 6. Vercel Setup

**Get API Token:**
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy to `VERCEL_TOKEN` env var

**Get Team & Project IDs:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Get project info
vercel project ls

# Get team info
vercel teams ls
```

### 7. Resend Setup

**Get API Key:**
1. Go to https://resend.com/api-keys
2. Create new API key
3. Copy to `RESEND_API_KEY` env var

### 8. Test the Setup

**Test Database Connection:**
```bash
node -e "require('./lib/db').query('SELECT NOW()')"
```

**Test Claude API:**
```bash
node -e "require('./lib/claude').refineFeatureRequest('test', [])"
```

**Test GitHub API:**
```bash
node -e "require('./lib/github').createFeatureIssue({...})"
```

---

## 🧪 TESTING THE DEMO

### For Muhammad Demo (Simple Example)

**1. Create Muhammad's Test Account:**
```sql
INSERT INTO users (email, full_name, role, company_id)
SELECT 
  'mhanif@bio-rad.com',
  'Muhammad Hanif',
  'client',
  id
FROM companies
WHERE company_name = 'BioRad Laboratories';
```

**2. Create Your Admin Account:**
```sql
INSERT INTO users (email, full_name, role, company_id)
VALUES ('jbandu@gmail.com', 'Jayaprakash Bandu', 'admin', NULL);
```

**3. Test Feature Request (Manual):**

Use Postman or curl:

```bash
# Start feature request
curl -X POST http://localhost:3000/api/features/request \
  -H "Content-Type: application/json" \
  -d '{"initialRequest": "Change dashboard background to BioRad green #68BC00"}'

# Response: {"featureId": "uuid-here"}

# Refine (simulate chat)
curl -X POST http://localhost:3000/api/features/refine \
  -H "Content-Type: application/json" \
  -d '{
    "featureId": "uuid-here",
    "message": "Yes, main dashboard. Use #68BC00"
  }'

# Finalize
curl -X POST http://localhost:3000/api/features/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "featureId": "uuid-here",
    "finalMessage": "Yes, thats final"
  }'
```

**4. Admin Approval:**

```bash
# List pending
curl http://localhost:3000/api/admin/features/pending

# Approve
curl -X POST http://localhost:3000/api/admin/features/approve \
  -H "Content-Type: application/json" \
  -d '{"requestId": "uuid-here"}'

# Build (starts autonomous deployment)
curl -X POST http://localhost:3000/api/admin/features/build \
  -H "Content-Type: application/json" \
  -d '{"requestId": "uuid-here"}'
```

---

## 🎯 DEMO SCRIPT (Live Demo with Muhammad)

### Setup (1 hour before demo):

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Test full flow locally:**
   - Muhammad account: Request feature
   - Admin account: Approve & build
   - Verify background changes

3. **Prepare fallback:**
   - Record video of working demo
   - Have pre-built PR ready to merge manually if needed

### Live Demo (10 minutes):

**Part 1: User Request (Muhammad - 3 min)**
1. Muhammad logs in to PRISM
2. Clicks "Request Feature" button
3. Types: "Change dashboard background to BioRad green"
4. AI asks clarifying questions (2-3 exchanges)
5. Muhammad confirms requirements
6. System shows "Submitted for approval"

**Part 2: Admin Approval (You - 2 min)**
7. Switch to your admin view
8. Show pending request in dashboard
9. Review details (chat history, requirements)
10. Click "Approve & Build"
11. Build log modal appears showing progress

**Part 3: Watch It Build (Both - 3 min)**
12. Real-time log shows:
    - GitHub issue created ✅
    - Code generation in progress...
    - Files modified ✅
    - PR created ✅
    - Tests running...
    - Tests passed ✅
    - PR merged ✅
    - Deploying to production...
    - Deployed! ✅

**Part 4: See Result (Muhammad - 2 min)**
13. Muhammad refreshes dashboard
14. Background is now BioRad green! 🎉
15. Show GitHub PR that was auto-created
16. Show Vercel deployment log

**Muhammad's reaction:** 🤯

---

## 🐛 TROUBLESHOOTING

### Build Fails at Claude Code Step

**Symptom:** Error: "Claude Code not found"

**Solution:**
```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude-code --version

# Update path in build route
# Change: /path/to/prism
# To: /actual/path/to/your/prism/project
```

### GitHub Rate Limit

**Symptom:** Error: "API rate limit exceeded"

**Solution:**
```bash
# Use authenticated requests (already done)
# Or wait 1 hour for rate limit reset
# Or use GitHub App instead of personal token
```

### Vercel Deployment Timeout

**Symptom:** "Deployment timeout after 5 minutes"

**Solution:**
```typescript
// In lib/vercel.ts, increase timeout:
const maxWaitMs = 600000; // 10 minutes instead of 5
```

### Email Not Sending

**Symptom:** No admin notifications

**Solution:**
```bash
# Verify Resend API key
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"noreply@prism.ai","to":"test@test.com","subject":"Test","html":"Test"}'
```

---

## 🚀 GO LIVE CHECKLIST

Before the Muhammad demo:

- [ ] All environment variables set
- [ ] Database tables created and verified
- [ ] Dependencies installed
- [ ] GitHub token has correct permissions
- [ ] Vercel deployment working
- [ ] Email notifications working
- [ ] Test account for Muhammad created
- [ ] Admin account for you created
- [ ] Full flow tested locally
- [ ] Backup demo video recorded
- [ ] Fallback PR prepared

---

## 📚 NEXT STEPS

After successful demo:

1. **Add UI components** (from previous messages)
2. **Implement voting system** for auto-approval
3. **Add build log viewer** for real-time progress
4. **Create feature gallery** showing deployed features
5. **Add rollback mechanism** if feature breaks
6. **Implement A/B testing** for risky features

---

## 🎉 SUCCESS METRICS

Track these after launch:

- **Build success rate:** Target 80%+
- **Average build time:** Target <5 minutes
- **Features deployed per week:** Target 10+
- **User satisfaction:** Measure via feedback
- **Time saved vs manual:** Calculate ROI

---

**YOU'RE READY TO BLOW MUHAMMAD'S MIND! 🚀**
