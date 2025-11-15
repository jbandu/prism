# Dashboard Components

Reusable React components for building PRISM dashboards. These components provide consistent UI/UX patterns across all dashboard views.

## Components

### MetricCard
Displays key performance indicators with optional trend indicators.

```tsx
import { MetricCard } from '@/components/dashboards/MetricCard';

<MetricCard
  title="Total Spend"
  value="$12.4M"
  change={-8.2}
  period="vs Q3"
  icon={<DollarSign />}
  positive={false} // decrease is good for spend
/>
```

**Props:**
- `title`: string - Metric title
- `value`: string | number - The metric value
- `change?`: number - Percentage change
- `period?`: string - Period label (e.g., "vs Q3")
- `icon?`: ReactNode - Icon component
- `trend?`: "up" | "down" | "neutral" - Trend direction
- `positive?`: boolean - Whether increase is good (default: true)
- `className?`: string - Additional CSS classes
- `subtitle?`: string - Additional context

### ChartContainer
Wrapper component for charts with consistent header styling and export functionality.

```tsx
import { ChartContainer } from '@/components/dashboards/ChartContainer';

<ChartContainer
  title="Spend Trend"
  description="Historical spend analysis"
  icon={<BarChart3 />}
  onExport={() => exportData()}
>
  {/* Your Recharts component */}
</ChartContainer>
```

**Props:**
- `title`: string - Chart title
- `description?`: string - Chart description
- `icon?`: ReactNode - Title icon
- `children`: ReactNode - Chart component
- `onExport?`: () => void - Export handler
- `exportLabel?`: string - Export button label (default: "Export")
- `className?`: string - Additional CSS classes
- `actions?`: ReactNode - Additional actions

### HealthBadge
Color-coded status indicators for system health.

```tsx
import { HealthBadge } from '@/components/dashboards/HealthBadge';

<HealthBadge status="healthy" />
<HealthBadge status="warning" label="Needs Attention" />
<HealthBadge status="critical" showIcon={false} />
```

**Props:**
- `status`: "healthy" | "good" | "warning" | "critical" | "degraded" | "error" | "down"
- `label?`: string - Custom label (overrides default)
- `showIcon?`: boolean - Show status icon (default: true)
- `className?`: string - Additional CSS classes

**Helper Function:**
```tsx
import { getHealthColor } from '@/components/dashboards/HealthBadge';

const color = getHealthColor("warning"); // Returns "#f59e0b"
```

### ActionButton
Standardized action buttons with pre-configured icons and variants.

```tsx
import { ActionButton } from '@/components/dashboards/ActionButton';

<ActionButton action="view" onClick={handleView} />
<ActionButton action="export" label="Download PDF" />
<ActionButton action="delete" variant="destructive" />
<ActionButton action="custom" icon={<Settings />} label="Configure" />
```

**Props:**
- `action`: "view" | "edit" | "delete" | "export" | "refresh" | "external" | "navigate" | "custom"
- `label?`: string - Button label
- `onClick?`: () => void - Click handler
- `disabled?`: boolean - Disabled state
- `variant?`: "default" | "outline" | "ghost" | "destructive" | "secondary"
- `size?`: "default" | "sm" | "lg" | "icon"
- `icon?`: ReactNode - Custom icon (for action="custom")
- `className?`: string - Additional CSS classes

## Design System

### Colors
- **Healthy/Success:** Green (#10b981)
- **Warning:** Yellow (#f59e0b)
- **Degraded:** Orange (#f97316)
- **Critical/Error:** Red (#ef4444)
- **Primary:** Blue (#3b82f6)
- **BioRad Brand:** Green (#68BC00)

### Typography
- **Large Numbers:** `text-4xl font-bold font-mono`
- **Headers:** `text-2xl font-semibold`
- **Body:** `text-base`

### Layout
- Use consistent spacing: `gap-6`, `p-6`
- Grid system: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Mobile-first responsive design

## Usage Examples

### Complete Dashboard Card
```tsx
<ChartContainer
  title="Monthly Spend Trend"
  description="Last 12 months of software spending"
  icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
  onExport={() => exportChart('spend-trend')}
>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={spendData}>
      {/* Chart configuration */}
    </LineChart>
  </ResponsiveContainer>
</ChartContainer>
```

### Metrics Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <MetricCard
    title="Total Spend"
    value="$12.4M"
    change={-8.2}
    period="vs Q3"
    icon={<DollarSign className="w-5 h-5 text-green-600" />}
    positive={false}
  />
  <MetricCard
    title="Active Tools"
    value={127}
    change={-12}
    period="vs Q3"
    icon={<Package className="w-5 h-5 text-blue-600" />}
    positive={false}
  />
  {/* More metrics... */}
</div>
```

## Best Practices

1. **Consistent Icons**: Use Lucide React icons throughout
2. **Color Semantics**: Green = good, Red = bad, Yellow = warning
3. **Responsive Design**: Always test on mobile, tablet, desktop
4. **Loading States**: Show skeletons while data loads
5. **Error Handling**: Display user-friendly error messages
6. **Accessibility**: Include ARIA labels where appropriate

## Dependencies

- React 18+
- shadcn/ui components
- Lucide React icons
- Tailwind CSS

## See Also

- [Dashboard Utilities](/lib/dashboard-utils.ts) - Helper functions
- [Dashboard Data](/lib/dashboard-data.ts) - Sample data structures
- [Dashboard Pages](/app/(company)/dashboards/) - Dashboard implementations
