# 🤖 Weekly Data Enhancement Agent

Automated system that enriches software data for all clients every week using AI.

---

## 📋 Overview

The **Weekly Data Enhancement Agent** is an intelligent automation system that:

- ✅ Runs automatically every week (configurable per company)
- ✅ Enriches software data using AI (Claude, Grok, or Gemini)
- ✅ Fills in missing descriptions, categories, features, use cases
- ✅ Tracks quality metrics and confidence scores
- ✅ Maintains detailed audit logs
- ✅ Handles failures gracefully with retries

---

## 🎯 What Gets Enhanced

By default, the agent enhances these fields for each software:

1. **description** - Comprehensive 2-3 sentence description
2. **category** - Primary category (Project Management, CRM, etc.)
3. **key_features** - Array of main features
4. **use_cases** - Array of common use cases
5. **integration_capabilities** - Array of integrations
6. **target_company_size** - Startup | SMB | Mid-Market | Enterprise
7. **deployment_model** - Cloud | On-Premise | Hybrid
8. **pricing_model** - Per User | Per Month | Usage-Based | Flat Fee
9. **support_channels** - Array of support options
10. **compliance_certifications** - Array of certifications (SOC 2, GDPR, etc.)
11. **api_available** - Boolean
12. **mobile_apps** - Boolean
13. **free_trial_available** - Boolean

---

## ⚙️ Configuration

### Per-Company Settings

Each company has its own enhancement schedule:

```json
{
  "enabled": true,
  "fields_to_enhance": [
    "description",
    "category",
    "key_features",
    "use_cases"
  ],
  "ai_provider": "gemini",  // claude, grok, or gemini
  "run_day_of_week": 1,     // 0=Sunday, 1=Monday, ..., 6=Saturday
  "run_hour": 2,            // 0-23 (2 AM by default)
  "last_run": "2025-01-15T02:00:00Z",
  "next_run": "2025-01-22T02:00:00Z"
}
```

### Default Schedule

- **Day:** Monday (1)
- **Time:** 2:00 AM UTC
- **Frequency:** Weekly
- **AI Provider:** Gemini (free tier)
- **Status:** Enabled for all companies by default

---

## 🚀 Usage

### 1. Configure Schedule (API)

```javascript
// Enable weekly enhancement for a company
await fetch('/api/enhancement/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'company-uuid',
    enabled: true,
    fields_to_enhance: ['description', 'category', 'key_features', 'use_cases'],
    ai_provider: 'gemini',
    run_day_of_week: 1,  // Monday
    run_hour: 2          // 2 AM
  })
});
```

### 2. Manual Trigger (Single Software)

```javascript
// Enhance a specific software immediately
await fetch('/api/enhancement/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    softwareId: 'software-uuid',
    fields: ['description', 'category', 'key_features']
  })
});
```

### 3. Manual Trigger (Full Portfolio)

```javascript
// Enhance all software for a company
await fetch('/api/enhancement/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'company-uuid',
    fields: ['description', 'category', 'key_features', 'use_cases']
  })
});
```

### 4. Get Enhancement History

```javascript
// Get past enhancement runs
const response = await fetch('/api/enhancement/run?companyId=company-uuid&limit=10');
const data = await response.json();

console.log(`Total runs: ${data.data.total_runs}`);
console.log('Recent runs:', data.data.runs);
```

### 5. Get Schedule Configuration

```javascript
// Check current schedule
const response = await fetch('/api/enhancement/schedule?companyId=company-uuid');
const schedule = await response.json();

console.log('Enabled:', schedule.data.enabled);
console.log('Next run:', schedule.data.next_run);
```

### 6. Disable Enhancement

```javascript
// Disable weekly enhancement
await fetch('/api/enhancement/schedule?companyId=company-uuid', {
  method: 'DELETE'
});
```

---

## 🤖 Automated Execution

### Vercel Cron Job

The agent runs automatically via Vercel Cron:

**Configuration:** `vercel.json`
```json
{
  "crons": [{
    "path": "/api/cron/enhance",
    "schedule": "0 2 * * 1"
  }]
}
```

**Schedule:** Every Monday at 2:00 AM UTC

**Process:**
1. Vercel triggers `/api/cron/enhance`
2. Agent fetches all companies with `enabled=true` and `next_run <= NOW()`
3. For each company:
   - Fetches all active software
   - Enhances in batches of 5 (to avoid rate limits)
   - Logs results to database
   - Updates `last_run` and `next_run`
4. Returns summary report

### Security

Cron endpoint is protected by a secret:

```bash
# Add to Vercel Environment Variables
CRON_SECRET=your-random-secret-here
```

Vercel automatically passes this in the Authorization header.

---

## 📊 Enhancement Process

### Step-by-Step Flow

1. **Fetch Software**
   ```sql
   SELECT * FROM software
   WHERE company_id = ? AND status = 'active'
   ```

2. **Build AI Prompt**
   ```
   Enrich this software data:
   Software: Slack
   Vendor: Slack Technologies
   Current Data: (empty fields shown)

   Provide enhanced data in JSON format...
   ```

3. **Call AI Provider**
   - Uses configured provider (Claude/Grok/Gemini)
   - Temperature: 0 (deterministic)
   - Max tokens: 4096

4. **Parse Response**
   ```json
   {
     "description": "...",
     "category": "Communication",
     "key_features": [...],
     "confidence_score": 0.92
   }
   ```

5. **Update Database**
   ```sql
   UPDATE software
   SET
     description = ?,
     category = ?,
     key_features = ?,
     last_enhanced = NOW(),
     enhancement_count = enhancement_count + 1
   WHERE id = ?
   ```

6. **Log Results**
   - Save to `enhancement_runs`
   - Create audit log entries
   - Track AI usage and costs

---

## 📈 Quality Tracking

### Confidence Scores

Every enhancement includes a confidence score (0.0-1.0):

- **High (≥0.8):** Highly confident, reliable data
- **Medium (0.5-0.8):** Reasonably confident, may need review
- **Low (<0.5):** Low confidence, manual review recommended

### Quality Metrics

Track enhancement quality over time:

```sql
SELECT
  date,
  total_enhancements,
  high_confidence_count,
  avg_confidence_score
FROM enhancement_quality_metrics
WHERE company_id = ?
ORDER BY date DESC;
```

### Audit Trail

Every field change is logged:

```sql
SELECT
  software_id,
  field_name,
  old_value,
  new_value,
  confidence_score,
  created_at
FROM enhancement_audit_log
WHERE company_id = ?
ORDER BY created_at DESC;
```

---

## 💰 Cost Optimization

### Provider Comparison

| Provider | Cost/1M Tokens | Best For | Estimated Cost/100 Software |
|----------|---------------|----------|----------------------------|
| **Gemini** | $0 (free tier) | Bulk enhancement | **$0** |
| **Grok** | $2-10 | Fast processing | ~$5-25 |
| **Claude** | $3-15 | High quality | ~$10-50 |

**Recommendation:** Use Gemini for weekly automation (free!)

### Cost Tracking

Monitor AI usage:

```sql
SELECT
  provider,
  COUNT(*) as requests,
  SUM(total_tokens) as tokens,
  SUM(estimated_cost) as cost
FROM ai_usage_logs
WHERE task_type = 'bulk_feature_enrichment'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY provider;
```

---

## 🗄️ Database Tables

### enhancement_schedules
Configuration for each company:
- `company_id` - Unique per company
- `enabled` - Turn on/off
- `fields_to_enhance` - JSON array of fields
- `ai_provider` - claude | grok | gemini
- `run_day_of_week` - 0-6 (0=Sunday)
- `run_hour` - 0-23
- `last_run` - Timestamp of last execution
- `next_run` - Timestamp of next scheduled run

### enhancement_runs
Log of all executions:
- `company_id` - Which company
- `total_software` - Total count
- `enhanced_count` - Successfully enhanced
- `failed_count` - Failed enhancements
- `duration_ms` - Time taken
- `results` - Detailed JSON results

### enhancement_audit_log
Field-level change tracking:
- `software_id` - Which software
- `field_name` - Which field changed
- `old_value` - Before
- `new_value` - After
- `confidence_score` - AI confidence
- `ai_provider` - Which AI used

### enhancement_quality_metrics
Daily/weekly quality stats:
- `date` - Date of metrics
- `total_enhancements` - Count
- `high_confidence_count` - High quality
- `avg_confidence_score` - Average score

---

## 🛠️ Setup Instructions

### 1. Run Database Migration

```bash
cd /path/to/prism
psql $DATABASE_URL < prism-web/migrations/create-enhancement-agent-tables.sql
```

**Creates:**
- `enhancement_schedules` table
- `enhancement_runs` table
- `enhancement_audit_log` table
- `enhancement_quality_metrics` table
- Adds columns to `software` table

### 2. Configure Cron Secret

```bash
# Add to Vercel Environment Variables
CRON_SECRET=$(openssl rand -base64 32)
```

### 3. Deploy Vercel Cron

The cron configuration in `vercel.json` is automatically deployed.

**Verify deployment:**
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/enhance
```

### 4. Enable for Companies

By default, all companies have enhancement enabled. To modify:

```javascript
// Disable for specific company
await fetch('/api/enhancement/schedule?companyId=xxx', {
  method: 'DELETE'
});

// Re-enable with custom schedule
await fetch('/api/enhancement/schedule', {
  method: 'POST',
  body: JSON.stringify({
    companyId: 'xxx',
    enabled: true,
    run_day_of_week: 3,  // Wednesday
    run_hour: 1          // 1 AM
  })
});
```

---

## 📊 Monitoring

### Check Enhancement Status

```sql
-- Active schedules
SELECT
  c.company_name,
  es.enabled,
  es.last_run,
  es.next_run,
  es.total_runs
FROM enhancement_schedules es
JOIN companies c ON c.id = es.company_id
WHERE es.enabled = true
ORDER BY es.next_run;

-- Recent runs
SELECT
  c.company_name,
  er.enhanced_count,
  er.failed_count,
  er.duration_ms / 1000.0 as duration_seconds,
  er.created_at
FROM enhancement_runs er
JOIN companies c ON c.id = er.company_id
ORDER BY er.created_at DESC
LIMIT 20;

-- Software enhancement stats
SELECT
  software_name,
  vendor_name,
  enhancement_count,
  last_enhanced,
  last_enhancement_confidence
FROM software
WHERE company_id = ?
ORDER BY last_enhanced DESC NULLS LAST;
```

### Vercel Logs

Monitor cron executions in Vercel Dashboard:
1. Go to: Vercel Dashboard → Your Project → Logs
2. Filter by: `/api/cron/enhance`
3. Look for: "Starting weekly data enhancement job..."

---

## 🚨 Troubleshooting

### Enhancement Not Running

**Check:**
1. Is `enabled = true` in `enhancement_schedules`?
2. Is `next_run` in the past?
3. Are there errors in Vercel logs?
4. Is `CRON_SECRET` set correctly?

```sql
SELECT * FROM enhancement_schedules WHERE enabled = true;
```

### Low Confidence Scores

**Solutions:**
1. Switch to Claude for higher quality (costs more)
2. Add more context to prompts
3. Review and manually correct low-confidence enhancements

### Rate Limits

**If hitting AI API rate limits:**
1. Reduce batch size (currently 5)
2. Add longer delays between batches
3. Switch to provider with higher limits

### High Costs

**Cost reduction:**
1. Use Gemini (free tier)
2. Reduce enhancement frequency (bi-weekly)
3. Enhance only critical fields
4. Skip recently enhanced software

---

## 🎨 Future Enhancements

Potential additions:
- [ ] User feedback loop (approve/reject)
- [ ] Smart skipping (don't enhance recently updated)
- [ ] Multi-language support
- [ ] Image/logo enrichment
- [ ] Competitor analysis integration
- [ ] Sentiment analysis from reviews
- [ ] Pricing data extraction
- [ ] Feature comparison matrices
- [ ] Email summaries of enhancements
- [ ] Slack notifications for failures

---

## 📞 API Reference

### POST /api/enhancement/run
Trigger enhancement manually

**Body:**
```json
{
  "companyId": "uuid",      // For full portfolio
  "softwareId": "uuid",     // For single software
  "fields": ["description", "category"]  // Optional
}
```

### GET /api/enhancement/run
Get enhancement history

**Query:**
```
?companyId=uuid&limit=10
```

### POST /api/enhancement/schedule
Configure schedule

**Body:**
```json
{
  "companyId": "uuid",
  "enabled": true,
  "fields_to_enhance": ["description", "category"],
  "ai_provider": "gemini",
  "run_day_of_week": 1,
  "run_hour": 2
}
```

### GET /api/enhancement/schedule
Get current schedule

**Query:**
```
?companyId=uuid
```

### DELETE /api/enhancement/schedule
Disable enhancement

**Query:**
```
?companyId=uuid
```

### GET /api/cron/enhance
Cron endpoint (Vercel only)

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

---

**Built with ❤️ by the PRISM team**
