"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronRight,
  CircleDot,
  XCircle,
  Minus,
  BarChart3,
  Target,
} from "lucide-react";

// Mock data for VP Infrastructure Dashboard
const INFRA_DASHBOARD_DATA = {
  focusToday: {
    actionsNeeded: 7,
    renewalsDue: 23,
    savingsIdentified: 524000,
    urgent: [
      { task: "Salesforce contract review meeting", date: "Thursday 2pm", daysUntil: 2, priority: "high" },
      { task: "Tableau license audit completion", date: "Overdue", daysUntil: -2, priority: "critical" },
      { task: "Adobe pricing negotiation call", date: "Monday 10am", daysUntil: 3, priority: "high" },
    ],
    highPriority: [
      { task: "ServiceNow renewal documentation", daysUntil: 15, category: "Renewal" },
      { task: "Slack Enterprise usage review", daysUntil: 20, category: "Optimization" },
      { task: "GitHub license optimization", daysUntil: 25, category: "Cost Savings" },
      { task: "AWS Reserved Instance planning", daysUntil: 28, category: "Budget" },
    ],
  },
  vendors: [
    {
      name: "Salesforce",
      annualCost: 2100000,
      renewalDays: 45,
      renewalDate: "Dec 30, 2025",
      health: "warning",
      utilization: 67,
      savingsOpportunity: 245000,
      contracts: 3,
    },
    {
      name: "Microsoft 365",
      annualCost: 1800000,
      renewalDays: 240,
      renewalDate: "Aug 15, 2026",
      health: "good",
      utilization: 95,
      savingsOpportunity: 0,
      contracts: 2,
    },
    {
      name: "Adobe Creative Cloud",
      annualCost: 540000,
      renewalDays: 60,
      renewalDate: "Jan 14, 2026",
      health: "critical",
      utilization: 45,
      savingsOpportunity: 232000,
      contracts: 1,
    },
    {
      name: "AWS",
      annualCost: 1500000,
      renewalDays: 30,
      renewalDate: "Dec 15, 2025",
      health: "warning",
      utilization: 73,
      savingsOpportunity: 510000,
      contracts: 5,
    },
    {
      name: "ServiceNow",
      annualCost: 980000,
      renewalDays: 120,
      renewalDate: "Mar 25, 2026",
      health: "good",
      utilization: 88,
      savingsOpportunity: 0,
      contracts: 2,
    },
    {
      name: "Slack",
      annualCost: 720000,
      renewalDays: 180,
      renewalDate: "Jun 13, 2026",
      health: "critical",
      utilization: 78,
      savingsOpportunity: 720000,
      contracts: 1,
    },
    {
      name: "Zoom",
      annualCost: 650000,
      renewalDays: 90,
      renewalDate: "Feb 22, 2026",
      health: "good",
      utilization: 92,
      savingsOpportunity: 0,
      contracts: 1,
    },
    {
      name: "Atlassian Suite",
      annualCost: 480000,
      renewalDays: 150,
      renewalDate: "May 4, 2026",
      health: "good",
      utilization: 85,
      savingsOpportunity: 0,
      contracts: 4,
    },
  ],
  utilizationHeatmap: [
    { tool: "Salesforce", weeks: [89, 91, 87, 88], average: 89, trend: "stable" },
    { tool: "Microsoft 365", weeks: [94, 96, 95, 93], average: 95, trend: "stable" },
    { tool: "Adobe Creative", weeks: [42, 45, 38, 48], average: 45, warning: true, trend: "volatile" },
    { tool: "AWS", weeks: [71, 74, 72, 75], average: 73, trend: "up" },
    { tool: "ServiceNow", weeks: [86, 89, 88, 90], average: 88, trend: "up" },
    { tool: "Slack", weeks: [76, 79, 78, 77], average: 78, trend: "stable" },
    { tool: "Zoom", weeks: [90, 93, 92, 94], average: 92, trend: "up" },
    { tool: "Atlassian", weeks: [83, 86, 84, 87], average: 85, trend: "up" },
    { tool: "GitHub", weeks: [55, 58, 52, 61], average: 57, warning: true, trend: "volatile" },
    { tool: "Tableau", weeks: [48, 51, 46, 50], average: 49, warning: true, trend: "down" },
  ],
  budget: {
    q1: { budget: 3100000, actual: 2900000, variance: -200000, variancePercent: -6.5 },
    q2: { budget: 3000000, forecast: 2700000, variance: -300000, variancePercent: -10 },
    q3: { budget: 3050000, forecast: 2850000, variance: -200000, variancePercent: -6.6 },
    q4: { budget: 2850000, forecast: 2750000, variance: -100000, variancePercent: -3.5 },
    annual: {
      budget: 12000000,
      forecast: 11200000,
      savings: 800000,
      withPrismOptimizations: 1800000,
    },
  },
  integrations: [
    { from: "Salesforce", to: "Slack", status: "healthy", lastSync: "2 min ago", syncRate: "99.9%" },
    { from: "ServiceNow", to: "Slack", status: "error", lastSync: "3 hours ago", error: "API rate limit exceeded", syncRate: "87.2%" },
    { from: "GitHub", to: "Slack", status: "healthy", lastSync: "1 min ago", syncRate: "99.8%" },
    { from: "AWS CloudWatch", to: "ServiceNow", status: "healthy", lastSync: "5 min ago", syncRate: "98.5%" },
    { from: "Tableau", to: "Salesforce", status: "warning", lastSync: "45 min ago", error: "Slow response time", syncRate: "94.1%" },
    { from: "Jira", to: "GitHub", status: "healthy", lastSync: "1 min ago", syncRate: "99.7%" },
    { from: "Zoom", to: "Calendar", status: "healthy", lastSync: "30 sec ago", syncRate: "99.9%" },
    { from: "Adobe CC", to: "SharePoint", status: "degraded", lastSync: "2 hours ago", error: "Connection timeout", syncRate: "91.3%" },
  ],
};

export default function InfrastructureDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [healthFilter, setHealthFilter] = useState<string>("all");

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "good":
        return <Badge className="bg-green-500">🟢 Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">🟡 Warning</Badge>;
      case "critical":
        return <Badge className="bg-red-500">🔴 Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getIntegrationStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "bg-green-500";
    if (utilization >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getUtilizationHeatColor = (value: number) => {
    if (value >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (value >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const filteredVendors = INFRA_DASHBOARD_DATA.vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHealth = healthFilter === "all" || vendor.health === healthFilter;
    return matchesSearch && matchesHealth;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Infrastructure Command Center</h1>
          <p className="text-gray-600 mt-1">VP Infrastructure Dashboard - Real-time Operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* FOCUS TODAY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Today's Priority</CardTitle>
            <CardDescription>Action items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-900 font-medium">Actions Needed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {INFRA_DASHBOARD_DATA.focusToday.actionsNeeded}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-900 font-medium">Renewals Due</p>
                  <p className="text-xl font-bold text-orange-600">
                    {INFRA_DASHBOARD_DATA.focusToday.renewalsDue}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-900 font-medium">Savings ID'd</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(INFRA_DASHBOARD_DATA.focusToday.savingsIdentified)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgent Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Urgent Items (Next 7 Days)
            </CardTitle>
            <CardDescription>Critical tasks requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {INFRA_DASHBOARD_DATA.focusToday.urgent.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.priority === "critical"
                      ? "bg-red-50 border-red-500"
                      : "bg-orange-50 border-orange-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{item.task}</p>
                        {item.daysUntil < 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            OVERDUE
                          </Badge>
                        ) : (
                          <Badge
                            className={`text-xs ${
                              item.priority === "critical" ? "bg-red-600" : "bg-orange-600"
                            }`}
                          >
                            {item.daysUntil} days
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* High Priority Next 30 Days */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                High Priority (Next 30 Days)
              </h4>
              <div className="space-y-2">
                {INFRA_DASHBOARD_DATA.focusToday.highPriority.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <CircleDot className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.task}</p>
                        <p className="text-xs text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {item.daysUntil} days
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LIVE VENDOR TABLE */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-prism-primary" />
                Live Vendor Management
              </CardTitle>
              <CardDescription>Real-time vendor health and renewal tracking</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-prism-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-prism-primary focus:border-transparent"
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="good">Healthy</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold">Annual Cost</TableHead>
                  <TableHead className="font-semibold">Next Renewal</TableHead>
                  <TableHead className="font-semibold">Utilization</TableHead>
                  <TableHead className="font-semibold">Health Status</TableHead>
                  <TableHead className="font-semibold">Savings Opp.</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow
                    key={vendor.name}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.contracts} contract(s)</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-gray-900">{formatCurrency(vendor.annualCost)}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.renewalDate}</p>
                        <p
                          className={`text-xs ${
                            vendor.renewalDays <= 30
                              ? "text-red-600 font-semibold"
                              : vendor.renewalDays <= 90
                              ? "text-orange-600"
                              : "text-gray-500"
                          }`}
                        >
                          {vendor.renewalDays} days
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress
                            value={vendor.utilization}
                            className="h-2"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12">
                          {vendor.utilization}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getHealthBadge(vendor.health)}</TableCell>
                    <TableCell>
                      {vendor.savingsOpportunity > 0 ? (
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(vendor.savingsOpportunity)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        Details
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* UTILIZATION HEATMAP & BUDGET TRACKING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-prism-primary" />
              Utilization Heatmap
            </CardTitle>
            <CardDescription>4-week utilization trends by tool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-gray-600 pb-2 border-b">
                <div className="col-span-2">Tool</div>
                <div className="text-center">Week 1</div>
                <div className="text-center">Week 2</div>
                <div className="text-center">Week 3</div>
                <div className="text-center">Week 4</div>
              </div>
              {INFRA_DASHBOARD_DATA.utilizationHeatmap.map((item) => (
                <div key={item.tool} className="grid grid-cols-6 gap-2 items-center">
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{item.tool}</p>
                      {item.warning && (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Avg: {item.average}%</p>
                  </div>
                  {item.weeks.map((week, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-center font-semibold text-sm border ${getUtilizationHeatColor(
                        week
                      )}`}
                    >
                      {week}%
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                  <span className="text-gray-700">High (≥80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
                  <span className="text-gray-700">Medium (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                  <span className="text-gray-700">Low (&lt;60%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Budget Tracking
            </CardTitle>
            <CardDescription>Quarterly and annual budget performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Q1 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Q1 2025</h4>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(Math.abs(INFRA_DASHBOARD_DATA.budget.q1.variance))} under
                    </p>
                  </div>
                </div>
                <Progress
                  value={(INFRA_DASHBOARD_DATA.budget.q1.actual / INFRA_DASHBOARD_DATA.budget.q1.budget) * 100}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Actual: {formatCurrency(INFRA_DASHBOARD_DATA.budget.q1.actual)}</span>
                  <span>Budget: {formatCurrency(INFRA_DASHBOARD_DATA.budget.q1.budget)}</span>
                </div>
              </div>

              {/* Q2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Q2 2025</h4>
                    <Badge className="bg-blue-600">Current</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(Math.abs(INFRA_DASHBOARD_DATA.budget.q2.variance))} under
                    </p>
                  </div>
                </div>
                <Progress
                  value={(INFRA_DASHBOARD_DATA.budget.q2.forecast / INFRA_DASHBOARD_DATA.budget.q2.budget) * 100}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Forecast: {formatCurrency(INFRA_DASHBOARD_DATA.budget.q2.forecast)}</span>
                  <span>Budget: {formatCurrency(INFRA_DASHBOARD_DATA.budget.q2.budget)}</span>
                </div>
              </div>

              {/* Q3 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Q3 2025</h4>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(Math.abs(INFRA_DASHBOARD_DATA.budget.q3.variance))} projected
                    </p>
                  </div>
                </div>
                <Progress
                  value={(INFRA_DASHBOARD_DATA.budget.q3.forecast / INFRA_DASHBOARD_DATA.budget.q3.budget) * 100}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Forecast: {formatCurrency(INFRA_DASHBOARD_DATA.budget.q3.forecast)}</span>
                  <span>Budget: {formatCurrency(INFRA_DASHBOARD_DATA.budget.q3.budget)}</span>
                </div>
              </div>

              {/* Annual Summary */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3">Annual Projection</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Budget</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(INFRA_DASHBOARD_DATA.budget.annual.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Forecast</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(INFRA_DASHBOARD_DATA.budget.annual.forecast)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Current Savings</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(INFRA_DASHBOARD_DATA.budget.annual.savings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">w/ PRISM</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(INFRA_DASHBOARD_DATA.budget.annual.withPrismOptimizations)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* INTEGRATION HEALTH */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Integration Health Monitor
          </CardTitle>
          <CardDescription>Real-time status of critical system integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INFRA_DASHBOARD_DATA.integrations.map((integration, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  integration.status === "healthy"
                    ? "bg-green-50 border-green-200"
                    : integration.status === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getIntegrationStatusIcon(integration.status)}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {integration.from} → {integration.to}
                      </p>
                      <p className="text-xs text-gray-600">Last sync: {integration.lastSync}</p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs ${
                      integration.status === "healthy"
                        ? "bg-green-600"
                        : integration.status === "error"
                        ? "bg-red-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {integration.syncRate}
                  </Badge>
                </div>
                {integration.error && (
                  <div className="p-2 bg-white rounded border border-gray-200 mt-2">
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {integration.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Integration Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {INFRA_DASHBOARD_DATA.integrations.filter((i) => i.status === "healthy").length}
                </p>
                <p className="text-xs text-gray-600">Healthy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {INFRA_DASHBOARD_DATA.integrations.filter((i) => i.status === "warning" || i.status === "degraded").length}
                </p>
                <p className="text-xs text-gray-600">Warning</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {INFRA_DASHBOARD_DATA.integrations.filter((i) => i.status === "error").length}
                </p>
                <p className="text-xs text-gray-600">Error</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {INFRA_DASHBOARD_DATA.integrations.length}
                </p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
