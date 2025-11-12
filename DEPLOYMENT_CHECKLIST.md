# 🚀 PRISM Deployment Checklist

Complete checklist for deploying all new features to production.

---

## ✅ Pre-Deployment

### 1. Environment Variables
Ensure these are set in Vercel:

- [x] `DATABASE_URL` - Neon PostgreSQL connection
- [x] `NEXTAUTH_SECRET` - Auth secret
- [x] `NEXTAUTH_URL` - Production URL
- [x] `ANTHROPIC_API_KEY` - Claude AI (confirmed ✓)
- [ ] `GROK_API_KEY` - X.AI Grok (add if using)
- [ ] `GEMINI_API_KEY` - Google Gemini (add if using)
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` - Maps (if using Global Presence)
- [ ] `OPENWEATHER_API_KEY` - Weather (if using Global Presence)

### 2. Database Migrations
Run all pending migrations:

```bash
cd /path/to/prism

# Option A: Use automated script
./run-all-migrations.sh

# Option B: Run individually
psql $DATABASE_URL < database/migrations/003_feature_overlap_system.sql
psql $DATABASE_URL < prism-web/migrations/create-alternatives-tables.sql
psql $DATABASE_URL < prism-web/migrations/create-savings-simulator-table.sql
psql $DATABASE_URL < prism-web/migrations/create-renewal-alerts-table.sql
psql $DATABASE_URL < prism-web/migrations/create-vendor-risk-table.sql
psql $DATABASE_URL < prism-web/migrations/create-ai-config-table.sql
psql $DATABASE_URL < prism-web/migrations/create-contracts-tables.sql
psql $DATABASE_URL < prism-web/migrations/create-gamification-tables.sql
psql $DATABASE_URL < prism-web/migrations/create-negotiation-tables.sql
psql $DATABASE_URL < prism-web/migrations/create-usage-analytics-tables.sql
psql $DATABASE_URL < prism-web/migrations/create-messaging-integration-tables.sql
```

### 3. Seed Data

```bash
cd prism-web

# Seed original 8 tools (if not done)
DATABASE_URL='your-db-url' npm run seed:software-catalog

# Seed expanded 50+ tools
DATABASE_URL='your-db-url' npm run seed:expanded-catalog
```

### 4. Verify Database Schema

```bash
cd /path/to/prism
./verify-database.sh
```

Expected output:
```
✅ All required tables exist!
✅ Database schema verified successfully!
```

---

## 📦 Code Deployment

### 1. Merge Pull Request

Current branch: `claude/fix-alternatives-column-011CUiQays2FPjCDwRmvF3rD`

Contains:
- ✅ Auth API fixes
- ✅ Alternatives column fix
- ✅ E2E testing suite
- ✅ Redundancy Detector
- ✅ AI Savings Simulator
- ✅ Contract Renewal Alerts
- ✅ Vendor Risk Scoring
- ✅ Multi-AI Provider Support
- ✅ Expanded Software Catalog

**Action:** Merge PR to `main` branch

### 2. Monitor Vercel Deployment

1. Go to: https://vercel.com/dashboard
2. Watch deployment progress
3. Check build logs for errors
4. Verify deployment succeeds

### 3. Install New Dependencies

Vercel will automatically run:
```bash
npm install
```

New dependencies added:
- `@google/generative-ai: ^0.21.0`

---

## 🧪 Post-Deployment Testing

### Test 1: Auth Endpoints
```bash
curl https://your-app.vercel.app/api/auth/providers
```
✅ Should return JSON (not 404)

### Test 2: Database Tables
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM software_catalog;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM savings_simulations;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vendor_risk_assessments;"
```
✅ Should return counts (not errors)

### Test 3: Redundancy Analysis
1. Login to app
2. Navigate to `/{companyId}/redundancy`
3. Click "Run Analysis"
4. ✅ Should see overlap matrix and recommendations

### Test 4: Alternatives Discovery
1. Go to software detail page
2. Click "Find Alternatives"
3. ✅ Should see alternative suggestions

### Test 5: Savings Simulator
```bash
curl -X POST https://your-app.vercel.app/api/savings-simulator \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test-company-id",
    "scenario": "consolidate",
    "softwareIds": ["id1", "id2"]
  }'
```
✅ Should return simulation results

### Test 6: Vendor Risk
```bash
curl -X POST https://your-app.vercel.app/api/vendor-risk/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "softwareId": "test-software-id",
    "companyId": "test-company-id"
  }'
```
✅ Should return risk analysis

### Test 7: AI Config
```bash
curl https://your-app.vercel.app/api/admin/ai-config
```
✅ Should return AI provider config

### Test 8: Renewal Alerts
```bash
curl "https://your-app.vercel.app/api/renewals/alerts?companyId=test-id"
```
✅ Should return upcoming renewals

---

## 🔍 Verification Checklist

### Frontend Features
- [ ] All navigation links work
- [ ] Redundancy Analysis page loads
- [ ] Alternatives Discovery works
- [ ] Software catalog populated
- [ ] No console errors
- [ ] Maps load correctly (Global Presence)

### API Endpoints
- [ ] `/api/auth/*` - All auth routes work
- [ ] `/api/redundancy/*` - Redundancy analysis
- [ ] `/api/alternatives/*` - Alternatives discovery
- [ ] `/api/savings-simulator` - Simulations work
- [ ] `/api/renewals/alerts` - Alerts configuration
- [ ] `/api/vendor-risk/*` - Risk analysis
- [ ] `/api/admin/ai-config` - AI configuration

### Database
- [ ] All migrations applied
- [ ] Software catalog seeded
- [ ] Feature categories populated
- [ ] No schema errors
- [ ] Indexes created

### AI Providers
- [ ] Claude API working
- [ ] Grok API configured (optional)
- [ ] Gemini API configured (optional)
- [ ] Usage logging working
- [ ] Cost tracking accurate

---

## 🚨 Rollback Plan

If deployment fails:

### Option 1: Quick Fix
1. Identify error in Vercel logs
2. Create hotfix branch
3. Fix and deploy

### Option 2: Rollback
1. Go to Vercel Dashboard
2. Find previous working deployment
3. Click "Redeploy"
4. Investigate issue offline

### Option 3: Database Rollback
```sql
-- If migrations cause issues, rollback specific tables
DROP TABLE IF EXISTS savings_simulations CASCADE;
DROP TABLE IF EXISTS vendor_risk_assessments CASCADE;
DROP TABLE IF EXISTS ai_provider_config CASCADE;
-- etc.
```

---

## 📊 Post-Deployment Monitoring

### Week 1: Monitor These Metrics

1. **Error Rates**
   - Watch Vercel error logs
   - Check for 500 errors
   - Monitor AI API failures

2. **Performance**
   - Page load times
   - API response times
   - Database query performance

3. **AI Usage**
   ```sql
   SELECT
     provider,
     COUNT(*) as requests,
     SUM(estimated_cost) as cost
   FROM ai_usage_logs
   WHERE created_at >= NOW() - INTERVAL '7 days'
   GROUP BY provider;
   ```

4. **User Adoption**
   - Redundancy Analysis usage
   - Savings simulations created
   - Vendor risk checks
   - Alert configurations

5. **Cost Tracking**
   - AI API costs
   - Database usage
   - Vercel bandwidth

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Zero deployment errors
- ✅ All API endpoints responding
- ✅ Database migrations complete
- ✅ Software catalog populated
- ✅ AI providers configured
- ✅ No increase in error rates
- ✅ Users can access new features
- ✅ E2E tests passing (optional)
- ✅ Cost tracking working
- ✅ No performance degradation

---

## 📞 Emergency Contacts

If issues arise:
- **Deployment Issues:** Check Vercel Dashboard
- **Database Issues:** Check Neon console
- **AI API Issues:** Check provider status pages
  - Claude: status.anthropic.com
  - Grok: status.x.ai
  - Gemini: status.cloud.google.com

---

## 📝 Post-Deployment Tasks

After successful deployment:

1. **Announce New Features**
   - Send email to users
   - Update documentation
   - Create tutorial videos

2. **Monitor Usage**
   - Track feature adoption
   - Collect user feedback
   - Identify pain points

3. **Optimize**
   - Review AI costs
   - Optimize slow queries
   - Improve caching

4. **Plan Next Phase**
   - Portfolio optimization engine
   - Enhanced UI dashboards
   - Advanced analytics

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Notes:**
