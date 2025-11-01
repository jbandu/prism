# PRISM User Guide

Welcome to PRISM! This guide will help you maximize value from the platform.

## 📑 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Software](#managing-software)
4. [Running AI Analysis](#running-ai-analysis)
5. [Viewing Alternatives](#viewing-alternatives)
6. [Managing Renewals](#managing-renewals)
7. [Generating Reports](#generating-reports)
8. [FAQs](#faqs)

---

## 🚀 Getting Started

### First Login

1. **Receive Welcome Email**
   - Your admin will send you login credentials
   - Email: `your.email@company.com`
   - Temporary password provided

2. **Access the Platform**
   - Visit: `https://prism-hazel.vercel.app`
   - Or your custom domain if configured

3. **Login**
   - Enter your email and password
   - Click "Sign In"
   - You'll be redirected to your company dashboard

4. **Change Password** (Recommended)
   - Go to Settings → Account
   - Click "Change Password"
   - Enter new secure password

---

## 📊 Dashboard Overview

Your dashboard is your command center for software portfolio management.

### Hero Metrics

At the top, you'll see 6 key metrics:

- **💰 Annual Spend**: Total software spend across all contracts
- **💡 Savings Found**: Potential savings identified by AI
- **📦 Software Count**: Number of software products tracked
- **⚠️ High Risk Vendors**: Vendors with financial or operational risks
- **📅 Renewals**: Contracts renewing in next 90 days
- **👥 Total Users**: Total license count across all software

### Insights Cards

Three action-oriented cards highlight immediate opportunities:

1. **🎯 Top Opportunity**: Biggest potential savings
2. **⚡ Quick Win**: Easy optimizations (unused licenses, tier downgrades)
3. **🔔 Action Required**: Urgent items (upcoming renewals, risk alerts)

### Portfolio Breakdown

Two interactive charts show:
- **Spend by Category**: Distribution across ERP, CRM, Collaboration, etc.
- **Top 10 Software**: Largest cost drivers

### Replacement Opportunities

Table showing AI-identified alternatives:
- Current software and cost
- Recommended alternative
- Potential savings ($ and %)
- Status (Ready, Evaluation, Not Recommended)
- Action buttons

### Cost Trend & Forecast

Line chart showing:
- Last 6 months of actual spend
- Next 6 months projected (with savings opportunities)

### Risk Alerts

Color-coded alerts:
- 🔴 **Red**: High risk (vendor financial issues)
- 🟡 **Yellow**: Medium risk (upcoming renewals)
- 🔵 **Blue**: Low risk (optimization opportunities)

### Recent Activity

Timeline of latest updates:
- AI analyses completed
- Contracts uploaded
- Vendor risk updates
- Optimizations identified

---

## 📦 Managing Software

### Adding Software Manually

1. Click **"Add Software"** button
2. Fill in required fields:
   - Software Name (e.g., "Salesforce")
   - Vendor Name (e.g., "Salesforce Inc.")
   - Category (CRM, ERP, Collaboration, etc.)
   - Annual Cost
   - Total Licenses
   - Active Users
   - License Type (per user, per device, site license)
   - Renewal Date
3. Click **"Save Software"**

### Importing from CSV

1. Click **"Import CSV"** button
2. Download the CSV template
3. Fill in your data:
   ```csv
   software_name,vendor_name,category,annual_cost,total_licenses,active_users,renewal_date
   Salesforce,Salesforce Inc.,CRM,120000,150,135,2025-03-15
   Slack,Slack Technologies,Collaboration,48000,200,185,2024-12-01
   ```
4. Upload your CSV file
5. Review and confirm import
6. PRISM will process and add all software

### Editing Software

1. Go to **Software Inventory** page
2. Find the software you want to edit
3. Click the **pencil icon** (✏️)
4. Update fields
5. Click **"Save Changes"**

### Viewing Software Details

Click any software row to see:
- Usage statistics
- License utilization
- Cost breakdown
- Active users vs total licenses
- Feature usage (if available)
- Historical trends

---

## 🤖 Running AI Analysis

PRISM's AI agents analyze your software portfolio to identify savings opportunities.

### Automatic Analysis

- Runs weekly by default
- Analyzes all software in your portfolio
- Sends email notifications when significant savings found

### Manual Analysis

1. Go to your Dashboard
2. Click **"Run AI Analysis"** button
3. Select analysis type:
   - **Cost Optimization**: Find license waste, tier opportunities
   - **Alternative Discovery**: Find cheaper/better alternatives
   - **Vendor Intelligence**: Update vendor risk data
   - **Full Portfolio**: All analyses at once
4. Click **"Start Analysis"**
5. Progress bar shows completion
6. Results appear in 2-5 minutes

### Understanding Results

Each analysis provides:

#### Cost Optimization
- **License Optimization**: Remove unused licenses
- **Tier Optimization**: Switch to more appropriate tier
- **Negotiation Leverage**: Points to use in contract renewal

#### Alternative Discovery
- **Software Alternatives**: List of 3-5 alternatives
- **Feature Match Score**: How well features align (0-100%)
- **Migration Complexity**: Low, Medium, High
- **Potential Savings**: Annual cost reduction

#### Vendor Intelligence
- **Financial Health Score**: 0-1 (higher is better)
- **Market Position**: Leader, Challenger, Niche
- **Risk Factors**: List of concerns
- **Recommendation**: Keep, Monitor, or Consider Alternative

---

## 🔄 Viewing Alternatives

The Alternatives page shows AI-recommended replacements for your current software.

### Alternative Cards

Each alternative shows:
- **Alternative Name & Vendor**
- **Estimated Annual Cost**
- **Feature Match Score**: Percentage of current features available
- **Migration Complexity**: Effort required to switch
- **Potential Savings**: Annual cost reduction
- **Pros & Cons**: Key advantages and disadvantages

### Filtering Alternatives

Use filters to narrow down:
- **By Software**: See alternatives for specific software
- **By Savings**: Minimum savings threshold
- **By Match Score**: Minimum feature match percentage
- **By Status**: Ready, In Evaluation, Rejected

### Taking Action

For each alternative:
1. Click **"View Details"** to see full comparison
2. Download **Feature Comparison PDF**
3. Click **"Request Demo"** to schedule vendor demo
4. Mark as **"In Evaluation"** to track progress
5. Mark as **"Implemented"** when switched

---

## 📅 Managing Renewals

Never miss a contract renewal with PRISM's renewal tracking.

### Renewals Dashboard

Shows all contracts:
- **Expiring Soon** (< 30 days): Red priority
- **Upcoming** (30-90 days): Yellow attention
- **Future** (> 90 days): Blue informational

### Renewal Details

For each renewal:
- Contract value
- Renewal date
- Auto-renewal status
- Notice period required
- Current pricing vs market rate
- Negotiation playbook (if available)

### Negotiation Playbook

For major contracts, PRISM provides:
- **Market Benchmarks**: Typical pricing
- **Leverage Points**: Usage data, competitors, contract terms
- **Target Discount**: Recommended discount to negotiate
- **Scripts**: Sample negotiation talking points
- **Timeline**: When to start negotiation

### Setting Reminders

1. Click on any renewal
2. Set reminder dates (90 days, 60 days, 30 days)
3. Choose notification method (email, in-app)
4. Click **"Save Reminders"**

---

## 📑 Generating Reports

Create beautiful, shareable reports for executives and stakeholders.

### Report Types

1. **Executive Summary**
   - High-level overview
   - Key metrics and trends
   - Top opportunities
   - 2-3 pages, perfect for executives

2. **Detailed Analysis**
   - Comprehensive portfolio review
   - All software with full details
   - All alternatives and recommendations
   - 10-15 pages

3. **Quarterly Review**
   - Compare quarters
   - Trend analysis
   - Progress on implementations
   - 5-7 pages

### Creating a Report

1. Go to **Reports** page
2. Click **"Generate Report"**
3. Select report type
4. Choose date range (if applicable)
5. Select sections to include:
   - Portfolio Overview
   - Cost Analysis
   - Savings Opportunities
   - Alternatives
   - Vendor Risk
   - Recommendations
6. Click **"Generate"**
7. Report is created in 30-60 seconds

### Downloading & Sharing

- **Download PDF**: High-quality, branded PDF
- **Share Link**: Generate secure, expiring link
- **Email**: Send directly to stakeholders
- **Schedule**: Set up automatic monthly/quarterly reports

---

## ❓ FAQs

### General

**Q: How often is data updated?**
A: Real-time for your data, vendor intelligence updates weekly.

**Q: Can I export my data?**
A: Yes, export to CSV from any page.

**Q: Is my data secure?**
A: Yes, encrypted at rest and in transit. SOC 2 compliant.

### Software Management

**Q: What if I don't know exact costs?**
A: Enter estimates. AI will help verify via vendor intelligence.

**Q: Can I track usage?**
A: Yes, integrate with SSO or upload usage reports.

**Q: How do I delete software?**
A: Go to Software → Select software → Click Delete. (Cannot undo)

### AI Analysis

**Q: How accurate are the savings estimates?**
A: 85-90% accurate based on market data and actual implementations.

**Q: Can I dispute recommendations?**
A: Yes, mark as "Not Applicable" and provide feedback.

**Q: How long does analysis take?**
A: 2-5 minutes for individual software, 10-15 for full portfolio.

### Alternatives

**Q: Are alternatives vendors paid placements?**
A: No, 100% unbiased AI recommendations based on features and cost.

**Q: Can I add my own alternatives?**
A: Yes, use "Add Custom Alternative" button.

**Q: Do you get commission from vendors?**
A: No, PRISM is vendor-agnostic.

### Reports

**Q: Can I customize reports?**
A: Yes, choose sections, date ranges, and add custom notes.

**Q: Can I white-label reports?**
A: Yes, upload your logo in Settings → Branding.

**Q: How long are reports stored?**
A: Forever. Access all historical reports anytime.

### Renewals

**Q: How do you know my renewal dates?**
A: You enter them, or upload contracts and AI extracts dates.

**Q: Will you negotiate on my behalf?**
A: No, but we provide negotiation playbooks and benchmarks.

**Q: Can I track multiple renewals for one software?**
A: Yes, if you have multiple contracts/SKUs.

### Support

**Q: How do I get help?**
A: Click "Help" button (bottom right) or email support@prism.com.

**Q: Do you offer training?**
A: Yes, 30-minute onboarding call included. Additional training available.

**Q: Can I request new features?**
A: Yes, use "Feature Request" in Help menu.

---

## 🎯 Best Practices

1. **Update Software Regularly**: Keep costs and licenses current
2. **Run Monthly Analysis**: Catch new opportunities early
3. **Set Renewal Reminders**: Start negotiating 90 days before renewal
4. **Review Alternatives**: Even if happy, know your options
5. **Track Implementation**: Mark alternatives as "Implemented" when switched
6. **Share Reports**: Keep executives informed with quarterly reports
7. **Provide Feedback**: Help AI improve by rating recommendations

---

## 📞 Getting Help

- **In-App Help**: Click "?" icon in bottom right
- **Email**: support@prism.com
- **Live Chat**: Available 9am-5pm PT Monday-Friday
- **Documentation**: docs.prism.com

---

**Welcome to smarter software management! 🚀**
