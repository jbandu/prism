# PRISM Admin Guide

Complete guide for platform administrators managing PRISM.

## 📑 Table of Contents

1. [Admin Dashboard](#admin-dashboard)
2. [Client Management](#client-management)
3. [Platform Analytics](#platform-analytics)
4. [System Settings](#system-settings)
5. [AI Agent Configuration](#ai-agent-configuration)
6. [User Management](#user-management)
7. [Troubleshooting](#troubleshooting)
8. [API Management](#api-management)

---

## 🎛️ Admin Dashboard

Your command center for managing all clients and platform operations.

### Accessing Admin Dashboard

- URL: `https://prism-hazel.vercel.app/admin/dashboard`
- Login: `jbandu@gmail.com`

### Overview Metrics

Four key metrics displayed:

1. **💼 Active Clients**: Number of paying clients
2. **💰 Under Management**: Total portfolio value across all clients
3. **📦 Software Analyzed**: Total software products tracked
4. **💡 Savings Identified**: Cumulative savings found for all clients

### Recent Activity Feed

Monitors all platform activity:
- New client additions
- AI analyses completed
- Reports generated
- Savings identified
- System events

### System Health

Real-time monitoring:
- **Last Agent Run**: Timestamp of last AI analysis
- **Database Status**: Connection health
- **API Rate Limits**: Usage vs limits (OpenAI, Anthropic)
- **DB Usage**: Storage consumption
- **Errors (24h)**: Count of errors in last 24 hours

### Quick Actions

- Add New Client
- Manage Clients
- View Analytics
- Generate Report
- Settings

---

## 👥 Client Management

### Viewing All Clients

Navigate to **Admin → Clients** to see the clients table.

#### Table Columns
- **Company**: Client name
- **Contact**: Primary contact name and email
- **Status**: 🟢 Active, 🟡 Prospect, 🔴 Churned
- **Software**: Number of software products
- **Annual Spend**: Total portfolio value
- **Savings**: Identified savings opportunities
- **Last Active**: Last login or activity
- **Actions**: View, Edit, Analyze buttons

#### Search & Filter

- **Search**: Type company or contact name
- **Status Filters**:
  - All
  - Active (paying clients)
  - Prospect (trial or sales stage)
  - Churned (canceled)

#### Sorting

Click column headers to sort by:
- Company name (alphabetical)
- Annual spend (highest first)
- Savings (highest first)
- Last active (most recent first)

### Adding New Client

Click **"Add Client"** button to launch the 4-step form:

#### Step 1: Company Information
- **Company Name** * (required)
- **Industry** * (e.g., Life Sciences, Technology)
- **Headquarters Location** (optional)
- **Employee Count** * (used for benchmarking)
- **Logo Upload** (optional, for white-labeled reports)

#### Step 2: Primary Contact
- **Full Name** * (main point of contact)
- **Email** * (used for login and notifications)
- **Phone** (optional)
- **Title** (e.g., IT Director, VP of Operations)
- **Create Login**: Checkbox to auto-create user account

#### Step 3: Contract Details
- **Status** *: Prospect, Active, Paused
- **Start Date**: When they became a client
- **Contract Value**: Annual fee they pay YOU
- **Billing Frequency**: Monthly, Quarterly, Annual
- **Notes**: Any additional information

#### Step 4: Review & Create
- Review all entered information
- Checkbox: Send welcome email to contact
- Click **"Create Client"**

**Result**:
- Client account created
- Login credentials emailed to contact
- Client can now access their dashboard

### Viewing Client Details

Click any row in the clients table to open detail modal:

**Information Displayed**:
- Primary contact details
- Industry and employee count
- Status badge
- Portfolio summary:
  - Software count
  - Annual spend
  - Savings identified

**Quick Actions**:
- **View Dashboard**: See client's dashboard
- **Run Analysis**: Trigger AI analysis for this client
- **Generate Report**: Create report for client
- **Send Email**: Compose email to client
- **Edit Details**: Modify client information

### Editing Client

1. Open client detail modal
2. Click **"Edit Details"**
3. Modify any fields
4. Click **"Save Changes"**

**Editable Fields**:
- Company information
- Primary contact
- Contract status
- Billing information

### Deactivating Client

1. Open client detail modal
2. Click **"Edit Details"**
3. Change Status to "Churned"
4. Add reason in Notes
5. Save Changes

**Effects**:
- Client loses access to platform
- Data preserved (can reactivate later)
- Removed from active client counts
- Still appears in "Churned" filter

---

## 📊 Platform Analytics

Navigate to **Admin → Analytics** for comprehensive insights.

### Key Metrics

Top row shows 4 metrics with trends:
- **Total Value Managed**: Growth over time
- **Savings Delivered**: Cumulative savings
- **Active Clients**: Current count
- **Software Analyzed**: Total products

### Portfolio Value Over Time

Line chart showing growth of total portfolio value (last 6 months).

**Insights**:
- Upward trend = healthy client acquisition
- Flat = retention without growth
- Downward = churn exceeding acquisition

### Cumulative Savings Delivered

Line chart showing total savings identified (last 6 months).

**Insights**:
- Demonstrates value delivered to clients
- Use in sales presentations
- Calculate ROI: Savings / Platform Fees

### Client Acquisition Funnel

Bar chart showing pipeline stages:
1. **Leads**: Initial interest
2. **Qualified**: Met criteria
3. **Proposal**: Sent proposal
4. **Negotiation**: Discussing terms
5. **Closed**: Signed contracts

**Actions**:
- Click bars to see list of companies in each stage
- Identify bottlenecks (high drop-off between stages)
- Forecast revenue based on pipeline

### Software Categories Analyzed

Pie chart showing distribution:
- ERP (Enterprise Resource Planning)
- CRM (Customer Relationship Management)
- Collaboration (Slack, Teams, Zoom)
- Analytics (Tableau, Power BI)
- Security (Crowdstrike, Okta)
- Other

**Insights**:
- Understand which categories you analyze most
- Identify expertise areas
- Target marketing to these categories

### Top Vendors by Frequency

Bar chart of most common vendors across all clients.

**Use Cases**:
- Negotiate enterprise deals (volume discounts)
- Build vendor partnerships
- Create specialized playbooks for common vendors

### AI Agent Analysis Activity

Line chart showing weekly analysis completions.

**Monitoring**:
- Consistent activity = healthy usage
- Spikes = new clients or big analyses
- Drops = investigate technical issues

### Email Engagement Metrics

Grid showing:
- **Emails Sent**: Total sent this month
- **Open Rate**: Percentage opened (target: 60%+)
- **Click Rate**: Percentage clicked links (target: 30%+)
- **Responses**: Count of replies

**Improvement Actions**:
- Low open rate → Improve subject lines
- Low click rate → Better CTAs, more compelling content
- Low responses → Add specific questions or requests

---

## ⚙️ System Settings

Navigate to **Admin → Settings** to configure the platform.

### API Keys Management

Secure storage for integration keys.

#### Displayed Keys

1. **OpenAI API Key** - For GPT-4 analyses
2. **Anthropic API Key** - For Claude analyses
3. **SendGrid API Key** - For email sending
4. **Neon Database Connection** - PostgreSQL connection string

#### Managing Keys

- **Show/Hide**: Click eye icon to reveal keys
- **Copy**: Click copy icon to copy to clipboard
- **Add New**: Click "Add New API Key" to add another service
- **Rotate**: Delete old key, add new key with same name

**Security Best Practices**:
- Rotate keys every 90 days
- Never share keys
- Use different keys for dev/staging/production
- Monitor usage to detect unauthorized access

### Email Templates

Customize automated emails sent to clients.

#### Available Templates

1. **Welcome Email**: Sent when new client onboarded
   - Subject: Welcome to PRISM!
   - Content: Login info, getting started guide, support contact

2. **Weekly Report**: Automated portfolio summary
   - Subject: Your Weekly Software Portfolio Update
   - Content: New savings, upcoming renewals, recommendations

3. **Savings Alert**: Notification of new opportunities
   - Subject: New Savings Opportunity: $X,XXX
   - Content: Details of opportunity, action steps

4. **Renewal Reminder**: Alert for upcoming renewals
   - Subject: Contract Renewal in X Days
   - Content: Renewal date, contract value, negotiation tips

#### Editing Templates

1. Click **"Edit"** next to any template
2. Modal opens with editor
3. Modify:
   - Subject line
   - Email body (supports HTML)
   - Variables: `{{client_name}}`, `{{savings_amount}}`, etc.
4. Preview changes
5. Click **"Save Template"**

#### Variables Available

- `{{client_name}}`: Company name
- `{{contact_name}}`: Primary contact
- `{{savings_amount}}`: Formatted dollar amount
- `{{software_name}}`: Name of software
- `{{renewal_date}}`: Formatted date
- `{{dashboard_link}}`: Link to client dashboard

---

## 🤖 AI Agent Configuration

Control how AI agents analyze client portfolios.

### Analysis Frequency

Set how often automatic analyses run:
- **Daily**: Run every day at midnight
- **Weekly**: Every Monday
- **Monthly**: First day of month
- **Manual Only**: No automatic runs

**Recommendation**: Weekly for most clients, daily for high-value.

### Confidence Threshold

Minimum confidence for showing recommendations:
- **High (90%+)**: Only show very confident recommendations
- **Medium (70%+)**: Balanced (recommended)
- **Low (50%+)**: Show more options, may include false positives

### Max Alternatives per Software

Limit number of alternatives shown (1-10).

**Recommendation**: 5 alternatives (manageable for clients to review).

### Minimum Savings Threshold

Don't show savings opportunities below this amount.

**Examples**:
- $5,000: Standard threshold
- $1,000: For smaller clients
- $50,000: For enterprise clients only

### Auto-Notify Clients

Checkbox: Automatically email clients when significant savings found.

**When enabled**:
- Threshold: ≥ $10,000 savings identified
- Email sent within 1 hour
- Includes link to view details

### Vendor Risk Monitoring

Checkbox: Continuously monitor vendor financial health.

**When enabled**:
- Weekly updates from financial data sources
- Alerts sent if risk score drops below 0.6
- Historical risk tracking

---

## 👤 User Management

Manage admin users and permissions.

### Current Admin Users

List showing:
- Profile picture or initials
- Email address
- Role (Super Admin, Admin, Viewer)
- Status (Active, Inactive)

### Adding Team Members

1. Click **"Invite Team Member"**
2. Enter email address
3. Select role:
   - **Super Admin**: Full access, can add/remove admins
   - **Admin**: Manage clients, view analytics, no system settings
   - **Viewer**: Read-only access
4. Click **"Send Invitation"**

Invitation email sent with:
- Link to set password
- Expires in 7 days
- Can resend if needed

### Role Permissions

| Permission | Super Admin | Admin | Viewer |
|------------|-------------|-------|--------|
| View all clients | ✅ | ✅ | ✅ |
| Add/edit clients | ✅ | ✅ | ❌ |
| Delete clients | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ |
| Manage settings | ✅ | ❌ | ❌ |
| Manage API keys | ✅ | ❌ | ❌ |
| Add/remove admins | ✅ | ❌ | ❌ |

### Removing Team Members

1. Find user in list
2. Click **"Remove"** button
3. Confirm removal
4. User loses access immediately

**Data**: User's activity history preserved for audit.

---

## 🔧 Troubleshooting

Common issues and solutions.

### Client Can't Log In

**Symptoms**: "Invalid email or password" error

**Troubleshooting**:
1. Verify email spelling in Admin → Clients
2. Check user status is "Active"
3. Click "Reset Password" to send reset link
4. Check spam folder for email
5. Verify email service (SendGrid) is working

**Solution**: If still failing, delete and recreate user account.

### AI Analysis Not Running

**Symptoms**: No analysis results, "Pending" status stuck

**Troubleshooting**:
1. Check System Health → API Rate Limits
2. Verify Anthropic/OpenAI keys in Settings
3. Check error logs for API failures
4. Test single software analysis manually

**Common Causes**:
- API key expired or invalid
- Rate limit exceeded
- Software missing required fields
- Network/firewall blocking API calls

**Solution**: Update API keys, wait for rate limit reset, or contact support.

### Emails Not Sending

**Symptoms**: Clients not receiving welcome emails or alerts

**Troubleshooting**:
1. Check SendGrid API key in Settings
2. Verify email templates exist
3. Check SendGrid dashboard for bounces
4. Test email by sending to yourself

**Common Causes**:
- SendGrid key invalid
- Email addresses invalid
- Domain not verified in SendGrid
- Recipient's spam filter

**Solution**: Verify SendGrid setup, ask client to whitelist emails.

### Data Not Showing in Dashboard

**Symptoms**: Blank cards, "No data" messages

**Troubleshooting**:
1. Check database connection in System Health
2. Verify software exists for client
3. Check browser console for errors
4. Try different browser
5. Clear cache and refresh

**Solution**: Usually a temporary database connection issue. Refresh page.

### Slow Performance

**Symptoms**: Pages taking >5 seconds to load

**Troubleshooting**:
1. Check database query performance
2. Review Vercel logs for errors
3. Check API rate limiting
4. Test from different network

**Common Causes**:
- Database needs indexing
- Too many records (need pagination)
- Network issues
- Vercel cold start

**Solution**: Optimize queries, add indexes, implement pagination.

---

## 🔌 API Management

For integrations and advanced usage.

### API Base URL

Production: `https://prism-hazel.vercel.app/api`

### Authentication

All API endpoints require authentication:

```bash
Authorization: Bearer YOUR_SESSION_TOKEN
```

### Key Endpoints

#### Get All Clients
```
GET /api/companies
```

#### Get Client Details
```
GET /api/companies/[id]
```

#### Add Software
```
POST /api/software
Body: {
  company_id, software_name, vendor_name,
  category, annual_cost, total_licenses,
  active_users, renewal_date
}
```

#### Run Analysis
```
POST /api/agents/analyze
Body: {
  company_id, software_id, analysis_type
}
```

#### Generate Report
```
POST /api/reports
Body: {
  company_id, report_type, period_start, period_end
}
```

### Rate Limits

- 1000 requests per hour per API key
- 100 requests per minute per endpoint

### Webhooks (Coming Soon)

Subscribe to events:
- `client.created`
- `analysis.completed`
- `savings.identified`
- `renewal.upcoming`

---

## 📈 Best Practices

1. **Onboard Clients Properly**
   - Complete 30-minute onboarding call
   - Help import initial software list
   - Review first AI analysis together
   - Set up automated reports

2. **Monitor System Health Daily**
   - Check error count
   - Verify AI agents running
   - Monitor API limits
   - Review activity feed

3. **Regular Data Quality Checks**
   - Ensure clients update costs quarterly
   - Verify renewal dates accurate
   - Remove inactive software
   - Update license counts

4. **Proactive Communication**
   - Monthly check-ins with each client
   - Share platform updates
   - Provide training on new features
   - Act on feedback quickly

5. **Security**
   - Rotate API keys quarterly
   - Review user access monthly
   - Monitor for suspicious activity
   - Keep all software updated

---

## 📞 Support

- **System Issues**: Email tech@prism.com
- **Client Questions**: Forward to support@prism.com
- **Feature Requests**: Submit at feedback.prism.com
- **Emergency**: Call +1 (555) 123-4567

---

**You're the command center. Keep PRISM running smoothly! 🚀**
