"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Package,
  Calendar,
  Shield,
  Download,
  FileText,
  Mail,
  Presentation,
  Lightbulb,
  Target,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts";

// Mock data for the Executive Dashboard
const HERO_METRICS = {
  totalSpend: { value: 12400000, change: -8.2, period: "vs Q3" },
  activeSubscriptions: { value: 127, change: -12, period: "vs Q3" },
  savingsIdentified: { value: 524000, percentage: 4.2 },
  utilizationRate: { value: 67, change: 5, period: "vs Q3" },
  renewalAlerts: { count: 23, value: 2100000, period: "in 90 days" },
  complianceScore: { value: 94, issues: 2, critical: true },
};

// Spend trend data
const SPEND_TREND_DATA = [
  { month: "Jan", actual: 1050000, projected: 1050000, optimized: 1050000 },
  { month: "Feb", actual: 1080000, projected: 1080000, optimized: 1050000 },
  { month: "Mar", actual: 1120000, projected: 1100000, optimized: 1040000 },
  { month: "Apr", actual: 1090000, projected: 1110000, optimized: 1030000 },
  { month: "May", actual: 1150000, projected: 1130000, optimized: 1020000 },
  { month: "Jun", actual: 1100000, projected: 1140000, optimized: 1010000 },
  { month: "Jul", actual: 1060000, projected: 1150000, optimized: 1000000 },
  { month: "Aug", actual: 1040000, projected: 1160000, optimized: 990000 },
  { month: "Sep", actual: 1020000, projected: 1170000, optimized: 980000 },
  { month: "Oct", actual: null, projected: 1180000, optimized: 970000 },
  { month: "Nov", actual: null, projected: 1190000, optimized: 960000 },
  { month: "Dec", actual: null, projected: 1200000, optimized: 950000 },
];

// Top cost drivers
const TOP_COST_DRIVERS = [
  { name: "Salesforce", spend: 2100000, category: "CRM" },
  { name: "Microsoft 365", spend: 1800000, category: "Productivity" },
  { name: "AWS", spend: 1500000, category: "Infrastructure" },
  { name: "ServiceNow", spend: 980000, category: "ITSM" },
  { name: "Slack", spend: 720000, category: "Communication" },
  { name: "Zoom", spend: 650000, category: "Communication" },
  { name: "Adobe Creative Cloud", spend: 540000, category: "Design" },
  { name: "Atlassian Suite", spend: 480000, category: "DevOps" },
  { name: "Workday", spend: 450000, category: "HR" },
  { name: "Tableau", spend: 420000, category: "Analytics" },
];

// Savings opportunities treemap
const SAVINGS_OPPORTUNITIES = [
  { name: "License Consolidation", value: 245000, category: "Consolidation", percentage: 46.8 },
  { name: "Unused Licenses", value: 156000, category: "Optimization", percentage: 29.8 },
  { name: "Contract Renegotiation", value: 78000, category: "Negotiation", percentage: 14.9 },
  { name: "Duplicate Tools", value: 45000, category: "Consolidation", percentage: 8.5 },
];

// Risk matrix data
const RISK_MATRIX_DATA = [
  { tool: "Salesforce", daysToRenewal: 15, value: 2100000, risk: "high" },
  { tool: "AWS", daysToRenewal: 30, value: 1500000, risk: "high" },
  { tool: "Microsoft 365", daysToRenewal: 45, value: 1800000, risk: "medium" },
  { tool: "ServiceNow", daysToRenewal: 60, value: 980000, risk: "medium" },
  { tool: "Slack", daysToRenewal: 75, value: 720000, risk: "medium" },
  { tool: "Zoom", daysToRenewal: 85, value: 650000, risk: "low" },
  { tool: "Adobe CC", daysToRenewal: 120, value: 540000, risk: "low" },
  { tool: "Atlassian", daysToRenewal: 150, value: 480000, risk: "low" },
  { tool: "Workday", daysToRenewal: 200, value: 450000, risk: "low" },
  { tool: "Tableau", daysToRenewal: 270, value: 420000, risk: "low" },
];

// Department spend data
const DEPARTMENT_SPEND = [
  { name: "Engineering", value: 3800000, percentage: 30.6 },
  { name: "Sales", value: 2900000, percentage: 23.4 },
  { name: "IT/Operations", value: 2200000, percentage: 17.7 },
  { name: "Marketing", value: 1600000, percentage: 12.9 },
  { name: "HR", value: 980000, percentage: 7.9 },
  { name: "Finance", value: 920000, percentage: 7.4 },
];

const COLORS = {
  primary: "#0066FF",
  secondary: "#00C896",
  warning: "#FF9500",
  danger: "#FF3B30",
  purple: "#AF52DE",
  teal: "#5AC8FA",
};

const PIE_COLORS = ["#0066FF", "#00C896", "#FF9500", "#AF52DE", "#5AC8FA", "#FF3B30"];

export default function ExecutiveDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("ytd");
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const handleExport = async (type: string) => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Exporting as ${type}...`);
    setIsExporting(false);
  };

  // Calculate portfolio health score (0-100)
  const portfolioHealthScore = 78;
  const getHealthColor = (score: number) => {
    if (score >= 80) return COLORS.secondary;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">CIO Portfolio Overview - BioRad Laboratories</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("ppt")}
            disabled={isExporting}
          >
            <Presentation className="w-4 h-4 mr-2" />
            PowerPoint
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleExport("email")}
            disabled={isExporting}
            className="bg-prism-primary hover:bg-prism-primary/90"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Report
          </Button>
        </div>
      </div>

      {/* HERO METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Annual Spend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-prism-primary" />
              <p className="text-sm text-gray-600 font-medium">Total Annual Spend</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(HERO_METRICS.totalSpend.value)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDown className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                {Math.abs(HERO_METRICS.totalSpend.change)}%
              </span>
              <span className="text-xs text-gray-500">{HERO_METRICS.totalSpend.period}</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600 font-medium">Active Subscriptions</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {HERO_METRICS.activeSubscriptions.value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDown className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                {Math.abs(HERO_METRICS.activeSubscriptions.change)} tools
              </span>
              <span className="text-xs text-gray-500">{HERO_METRICS.activeSubscriptions.period}</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Identified */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Savings Identified</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(HERO_METRICS.savingsIdentified.value)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm text-green-600 font-medium">
                {HERO_METRICS.savingsIdentified.percentage}%
              </span>
              <span className="text-xs text-gray-500">of total spend</span>
            </div>
          </CardContent>
        </Card>

        {/* Utilization Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Utilization Rate</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {HERO_METRICS.utilizationRate.value}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                {HERO_METRICS.utilizationRate.change}%
              </span>
              <span className="text-xs text-gray-500">{HERO_METRICS.utilizationRate.period}</span>
            </div>
          </CardContent>
        </Card>

        {/* Renewal Alerts */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600 font-medium">Renewal Alerts</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {HERO_METRICS.renewalAlerts.count}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm text-orange-600 font-medium">
                {formatCurrency(HERO_METRICS.renewalAlerts.value)}
              </span>
              <span className="text-xs text-gray-500">{HERO_METRICS.renewalAlerts.period}</span>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Compliance Score</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {HERO_METRICS.complianceScore.value}/100
            </p>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-600 font-medium">
                {HERO_METRICS.complianceScore.issues} critical
              </span>
              <span className="text-xs text-gray-500">issues</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TIME FILTER */}
      <Tabs defaultValue="ytd" className="w-full">
        <TabsList>
          <TabsTrigger value="qtd">QTD</TabsTrigger>
          <TabsTrigger value="ytd">YTD</TabsTrigger>
          <TabsTrigger value="12m">12 Months</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* MAIN VISUALIZATIONS - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Spend Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend Trend Analysis</CardTitle>
            <CardDescription>Historical vs Projected vs Optimized Spend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={SPEND_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                  name="Actual Spend"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke={COLORS.warning}
                  fill={COLORS.warning}
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                  name="Projected (No Action)"
                />
                <Area
                  type="monotone"
                  dataKey="optimized"
                  stroke={COLORS.secondary}
                  fill={COLORS.secondary}
                  fillOpacity={0.3}
                  strokeDasharray="3 3"
                  name="Optimized Path"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Insight:</strong> With optimization, you can save{" "}
                <strong className="text-blue-700">$2.4M annually</strong> by following the optimized path.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Top 10 Cost Drivers */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Cost Drivers</CardTitle>
            <CardDescription>Largest investments in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={TOP_COST_DRIVERS} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
                <Bar dataKey="spend" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900">
                <strong>Top 3 tools</strong> account for <strong>43%</strong> of total spend
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN VISUALIZATIONS - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Portfolio Health Score Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Health Score</CardTitle>
            <CardDescription>Overall optimization grade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={getHealthColor(portfolioHealthScore)}
                    strokeWidth="20"
                    strokeDasharray={`${(portfolioHealthScore / 100) * 502.4} 502.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: getHealthColor(portfolioHealthScore) }}>
                    {portfolioHealthScore}
                  </span>
                  <span className="text-gray-500 text-sm">/ 100</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Badge
                  className="mb-2"
                  style={{ backgroundColor: getHealthColor(portfolioHealthScore) }}
                >
                  Good
                </Badge>
                <p className="text-sm text-gray-600">
                  22 points to reach Excellent
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Utilization</span>
                <span className="font-medium">85/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cost Efficiency</span>
                <span className="font-medium">72/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Compliance</span>
                <span className="font-medium">94/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vendor Management</span>
                <span className="font-medium">61/100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Savings Opportunities Treemap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Savings Opportunities Breakdown</CardTitle>
            <CardDescription>Potential savings by category ({formatCurrency(524000)} total)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SAVINGS_OPPORTUNITIES.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="h-16 rounded flex items-center justify-center text-white font-semibold text-sm px-4"
                    style={{
                      backgroundColor: PIE_COLORS[index],
                      width: `${item.percentage}%`,
                      minWidth: "120px",
                    }}
                  >
                    {formatCurrency(item.value)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.percentage}% of total</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-900 mb-1">Quick Wins</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(201000)}</p>
                <p className="text-xs text-green-600 mt-1">Can be captured in 30 days</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 mb-1">Strategic Projects</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(323000)}</p>
                <p className="text-xs text-blue-600 mt-1">Requires 90-day initiative</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN VISUALIZATIONS - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Risk Matrix Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Renewal Risk Matrix</CardTitle>
            <CardDescription>Renewals by timing and contract value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="daysToRenewal"
                  name="Days to Renewal"
                  label={{ value: "Days to Renewal", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  type="number"
                  dataKey="value"
                  name="Contract Value"
                  tickFormatter={(value) => formatCurrency(value)}
                  label={{ value: "Contract Value", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value: any, name: string) => {
                    if (name === "Contract Value") return formatCurrency(value);
                    return value;
                  }}
                  labelFormatter={(label) => ""}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.tool}</p>
                          <p className="text-sm text-gray-600">
                            Value: {formatCurrency(data.value)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Renewal: {data.daysToRenewal} days
                          </p>
                          <Badge
                            className="mt-1"
                            variant={data.risk === "high" ? "destructive" : "secondary"}
                          >
                            {data.risk.toUpperCase()} Risk
                          </Badge>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Contracts" data={RISK_MATRIX_DATA} fill={COLORS.primary}>
                  {RISK_MATRIX_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.risk === "high"
                          ? COLORS.danger
                          : entry.risk === "medium"
                          ? COLORS.warning
                          : COLORS.secondary
                      }
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.danger }} />
                <span>High Risk (0-30 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.warning }} />
                <span>Medium Risk (31-90 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.secondary }} />
                <span>Low Risk (90+ days)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Department Spend Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Department</CardTitle>
            <CardDescription>Software investment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={DEPARTMENT_SPEND}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${percentage}%`}
                >
                  {DEPARTMENT_SPEND.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {DEPARTMENT_SPEND.map((dept, index) => (
                <div key={dept.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-gray-700">{dept.name}</span>
                  <span className="text-gray-500 ml-auto">{formatCurrency(dept.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KEY INSIGHTS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Key Insights & Recommendations
          </CardTitle>
          <CardDescription>AI-powered actionable insights for immediate impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insight 1 */}
            <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">
                    Consolidate Communication Tools
                  </h4>
                  <p className="text-sm text-green-800 mb-2">
                    You&apos;re using both Slack ($720K) and Microsoft Teams (included in M365). 67% of
                    users active on both platforms.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">$720K/year savings</Badge>
                    <span className="text-xs text-green-700">30-day implementation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">
                    Critical: Salesforce Renewal in 15 Days
                  </h4>
                  <p className="text-sm text-orange-800 mb-2">
                    $2.1M contract auto-renews on Dec 1st. Usage data shows 23% of licenses unused.
                    Negotiate before deadline.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-600">$483K potential savings</Badge>
                    <span className="text-xs text-orange-700">Action required now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Right-Size AWS Infrastructure
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Analysis shows 34% over-provisioning in EC2 instances. Average CPU utilization
                    at 41% vs. recommended 70-80%.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600">$510K/year savings</Badge>
                    <span className="text-xs text-blue-700">90-day optimization project</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 4 */}
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">
                    Reclaim Unused Adobe Licenses
                  </h4>
                  <p className="text-sm text-purple-800 mb-2">
                    156 Adobe Creative Cloud licenses purchased, but only 89 used in last 90 days.
                    67 licenses can be reassigned or removed.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600">$232K/year savings</Badge>
                    <span className="text-xs text-purple-700">Immediate action</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Action Bar */}
          <div className="mt-6 p-4 bg-gradient-to-r from-prism-primary to-prism-secondary rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg mb-1">Total Opportunity</h4>
                <p className="text-sm text-blue-100">
                  Implementing these 4 recommendations can save{" "}
                  <strong className="text-white text-lg">$1.95M annually</strong> (15.7% reduction)
                </p>
              </div>
              <Button variant="secondary" size="lg" className="bg-white text-prism-primary hover:bg-gray-100">
                <Zap className="w-4 h-4 mr-2" />
                Generate Action Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EXPORT OPTIONS FOOTER */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Need to share this dashboard?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export this executive summary in multiple formats for presentations and reports
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("ppt")}
                disabled={isExporting}
              >
                <Presentation className="w-4 h-4 mr-2" />
                PowerPoint Deck
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("excel")}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel Workbook
              </Button>
              <Button
                onClick={() => handleExport("email")}
                disabled={isExporting}
                className="bg-prism-primary hover:bg-prism-primary/90"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email to Stakeholders
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
