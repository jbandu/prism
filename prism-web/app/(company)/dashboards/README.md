# PRISM Dashboards

Comprehensive analytics dashboards for software portfolio optimization.

## Overview

PRISM provides six specialized dashboards tailored to different stakeholders:

1. **Executive Dashboard** - CIO/VP level portfolio overview
2. **Infrastructure Dashboard** - VP Infrastructure command center
3. **Department Dashboard** - Department-specific spend analysis
4. **Operations Dashboard** - IT operations and provisioning
5. **Finance Dashboard** - CFO budget and spend tracking
6. **Procurement Dashboard** - Vendor management and negotiations

## Directory Structure

```
dashboards/
├── page.tsx              # Main hub with tabs
├── executive/
│   └── page.tsx         # Executive dashboard (836 lines)
├── infrastructure/
│   └── page.tsx         # Infrastructure dashboard (763 lines)
├── department/
│   └── page.tsx         # Department dashboard (557 lines)
├── operations/
│   └── page.tsx         # Operations dashboard (557 lines)
├── finance/
│   └── page.tsx         # Finance dashboard (467 lines)
└── procurement/
    └── page.tsx         # Procurement dashboard (599 lines)
```

## Dashboard Descriptions

### 1. Executive Dashboard (`/dashboards/executive`)
**Target Audience:** CIO, VP Engineering, Board Members

**Features:**
- 6 hero metrics (Spend, Subscriptions, Savings, Utilization, Renewals, Compliance)
- Spend trend analysis (actual vs projected vs optimized)
- Top 10 cost drivers
- Portfolio health score (78/100)
- Savings opportunities breakdown
- Contract renewal risk matrix
- Department spend distribution
- 4 AI-powered insights with $1.95M total savings

**Key Metrics:**
- Total Spend: $12.4M
- Savings Identified: $524K
- Portfolio Health: 78/100

### 2. Infrastructure Dashboard (`/dashboards/infrastructure`)
**Target Audience:** VP Infrastructure, Engineering Managers, DevOps

**Features:**
- Focus Today section (7 action items)
- Live vendor management table (8 vendors)
- 4-week utilization heatmap (10 tools)
- Quarterly budget tracking
- Integration health monitoring (8 integrations)
- Search and filter functionality
- Real-time health indicators

**Key Metrics:**
- Actions Needed: 7
- Renewals Due: 23
- Integration Health: 5 healthy, 2 warning, 1 error

### 3. Department Dashboard (`/dashboards/department`)
**Target Audience:** Department Managers, Team Leads

**Features:**
- Department selector (6 departments)
- Team size and budget metrics
- Tools breakdown table
- Utilization tracking
- 3 optimization recommendations per department
- Annual savings calculations

**Departments:**
- Marketing ($1.6M, 45 employees, $156K savings)
- Engineering ($3.8M, 120 employees, $423K savings)
- Sales ($2.9M, 85 employees, $287K savings)
- IT/Operations ($2.2M, 52 employees, $198K savings)
- HR ($980K, 28 employees, $89K savings)
- Finance ($920K, 32 employees, $67K savings)

### 4. Operations Dashboard (`/dashboards/operations`)
**Target Audience:** IT Operations, System Administrators

**Features:**
- System health overview (10 platforms)
- License utilization trends (6 months)
- Provisioning task checklist (6 tasks)
- API usage monitoring (6 services)
- Performance metrics and uptime tracking

**Key Metrics:**
- Healthy Systems: 6/10
- Pending Tasks: 5
- API Health: 3 healthy, 3 warning

### 5. Finance Dashboard (`/dashboards/finance`)
**Target Audience:** CFO, Finance Controllers, Budget Managers

**Features:**
- Financial overview (Budget, YTD, Projected, Variance)
- Spend by category (pie & bar charts)
- Payment schedule (next 6 months)
- Cost per employee trend (vs industry benchmark)
- Quarterly performance tracking

**Key Metrics:**
- Annual Budget: $12M
- YTD Spend: $7.2M
- Projected EOY: $11.65M
- Cost/Employee: $2,389

### 6. Procurement Dashboard (`/dashboards/procurement`)
**Target Audience:** Procurement Team, Contract Managers

**Features:**
- Vendor negotiation opportunities (5 targets)
- Vendor scorecard (3 vendors analyzed)
- Contract renewal timeline
- Negotiation strategies and leverage points
- Total savings potential: $1.46M

**Top Opportunities:**
- Slack consolidation: $720K
- AWS optimization: $270K
- Salesforce licenses: $225K
- Adobe right-sizing: $130K

## URL Structure

All dashboards are accessible under the `/dashboards` route:

```
/dashboards                    # Main hub
/dashboards/executive          # Executive view
/dashboards/infrastructure     # Infrastructure view
/dashboards/department         # Department view
/dashboards/operations         # Operations view
/dashboards/finance            # Finance view
/dashboards/procurement        # Procurement view
```

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **Styling:** Tailwind CSS

## Data Sources

All dashboards currently use sample data from:
- `/lib/dashboard-data.ts` - Mock data structures
- BioRad Laboratories profile (8,500 employees, $12.4M budget)

To connect to real data:
1. Replace mock API functions in `/lib/dashboard-data.ts`
2. Update data fetching in each dashboard component
3. Add authentication/authorization checks

## Shared Components

See `/components/dashboards/` for reusable components:
- `MetricCard` - KPI display cards
- `ChartContainer` - Chart wrapper with export
- `HealthBadge` - Status indicators
- `ActionButton` - Standardized action buttons

## Helper Utilities

See `/lib/dashboard-utils.ts` for helper functions:
- `formatCurrency()` - Format as $12.4M
- `formatPercent()` - Format as 85%
- `calculateTrend()` - Percentage change
- `formatDaysUntil()` - Human-readable dates
- And 20+ more utilities

## Design Guidelines

### Colors
- **Primary:** Blue (#3b82f6)
- **Success:** Green (#10b981)
- **Warning:** Yellow (#f59e0b)
- **Danger:** Red (#ef4444)
- **BioRad Brand:** Green (#68BC00)

### Typography
- Large numbers: `text-4xl font-bold font-mono`
- Headers: `text-2xl font-semibold`
- Body: `text-base`

### Layout
- Grid system: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Spacing: `gap-6`, `p-6`
- Mobile-first responsive design

## Performance

All dashboards are optimized for:
- Fast initial load (< 2s)
- Responsive interactions
- Efficient re-renders
- Edge runtime compatibility

## Future Enhancements

- [ ] Real-time data updates via WebSocket
- [ ] PDF/Excel export functionality
- [ ] Drill-down modals for detailed analysis
- [ ] User preferences and saved views
- [ ] Customizable dashboard layouts
- [ ] Advanced filtering and sorting
- [ ] Integration with alerting systems
- [ ] Mobile app version

## Development

### Adding a New Dashboard

1. Create directory: `dashboards/your-dashboard/`
2. Create page: `dashboards/your-dashboard/page.tsx`
3. Use shared components from `/components/dashboards/`
4. Add to main hub in `dashboards/page.tsx`
5. Update this README

### Local Development

```bash
cd prism-web
npm run dev
```

Navigate to `http://localhost:3000/dashboards`

## Support

For questions or issues:
1. Check this README
2. Review component documentation in `/components/dashboards/README.md`
3. Review utility functions in `/lib/dashboard-utils.ts`
4. Contact the engineering team

## License

Proprietary - BioRad Laboratories
