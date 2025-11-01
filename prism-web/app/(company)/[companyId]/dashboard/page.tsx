"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingDown,
  AlertCircle,
  Package,
  Users,
  Calendar,
  Target,
  Zap,
  Bell,
  Plus,
  FileText,
  PlayCircle,
  Download,
  ArrowRight,
  TrendingUp,
  Clock
} from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data - In production, this would come from your API
const mockData = {
  heroMetrics: {
    annualSpend: 12400000,
    savingsFound: 2100000,
    savingsPercentage: 17,
    totalSoftware: 67,
    highRiskVendors: 3,
    renewalsNext90Days: 5,
    totalUsers: 4200
  },
  spendByCategory: [
    { name: "ERP", value: 8500000, color: "#0066FF" },
    { name: "CRM", value: 1200000, color: "#00C9A7" },
    { name: "Collaboration", value: 772000, color: "#FF6B6B" },
    { name: "Analytics", value: 650000, color: "#9B59B6" },
    { name: "Security", value: 520000, color: "#F39C12" },
    { name: "Other", value: 758000, color: "#95A5A6" }
  ],
  topSoftware: [
    { name: "SAP", spend: 8500000 },
    { name: "Salesforce", spend: 1200000 },
    { name: "ServiceNow", spend: 950000 },
    { name: "Tableau", spend: 650000 },
    { name: "Zoom", spend: 420000 },
    { name: "Slack", spend: 320000 },
    { name: "Asana", spend: 95000 },
    { name: "DocuSign", spend: 85000 },
    { name: "Adobe CC", spend: 72000 },
    { name: "Airtable", spend: 45000 }
  ],
  replacementOpportunities: [
    {
      software: "Asana",
      currentCost: 95000,
      alternative: "ClickUp",
      potentialSavings: 83000,
      savingsPercent: 87,
      status: "Ready",
      statusColor: "green"
    },
    {
      software: "DocuSign",
      currentCost: 85000,
      alternative: "Adobe Sign",
      potentialSavings: 42000,
      savingsPercent: 49,
      status: "Evaluation",
      statusColor: "yellow"
    },
    {
      software: "Zoom",
      currentCost: 420000,
      alternative: "Google Meet",
      potentialSavings: 350000,
      savingsPercent: 83,
      status: "Ready",
      statusColor: "green"
    },
    {
      software: "Airtable",
      currentCost: 45000,
      alternative: "Microsoft Lists",
      potentialSavings: 38000,
      savingsPercent: 84,
      status: "Ready",
      statusColor: "green"
    }
  ],
  costTrend: [
    { month: "May", spend: 1050000, forecast: null },
    { month: "Jun", spend: 1020000, forecast: null },
    { month: "Jul", spend: 1080000, forecast: null },
    { month: "Aug", spend: 1040000, forecast: null },
    { month: "Sep", spend: 1100000, forecast: null },
    { month: "Oct", spend: 1030000, forecast: null },
    { month: "Nov", spend: null, forecast: 980000 },
    { month: "Dec", spend: null, forecast: 950000 },
    { month: "Jan", spend: null, forecast: 920000 },
    { month: "Feb", spend: null, forecast: 910000 },
    { month: "Mar", spend: null, forecast: 900000 },
    { month: "Apr", spend: null, forecast: 890000 }
  ],
  riskAlerts: [
    {
      type: "high",
      title: "Airtable Financial Risk",
      description: "Vendor financial health score: 0.6 - Consider alternatives",
      color: "red"
    },
    {
      type: "medium",
      title: "Salesforce Renewal in 45 Days",
      description: "Contract value: $1.2M - Negotiation playbook available",
      color: "yellow"
    },
    {
      type: "low",
      title: "Tableau License Waste Detected",
      description: "140 unused licenses - Immediate optimization available",
      color: "blue"
    }
  ],
  recentActivity: [
    { time: "2 hours ago", action: "AI analyzed Tableau - Found 3 alternatives" },
    { time: "Yesterday", action: "Asana contract uploaded" },
    { time: "2 days ago", action: "Vendor risk updated for Zoom" },
    { time: "3 days ago", action: "Cost optimization completed for Slack" }
  ]
};

export default function CompanyDashboard({
  params,
}: {
  params: { companyId: string };
}) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-prism-primary to-prism-secondary rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">BioRad Laboratories - Software Portfolio</h1>
        <p className="text-blue-100 mb-6">Comprehensive view of your software investments and optimization opportunities</p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-white" />
                <p className="text-sm text-blue-100">Annual Spend</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(mockData.heroMetrics.annualSpend)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-300" />
                <p className="text-sm text-blue-100">Savings Found</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(mockData.heroMetrics.savingsFound)}</p>
              <p className="text-xs text-green-300">({mockData.heroMetrics.savingsPercentage}%)</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-white" />
                <p className="text-sm text-blue-100">Software</p>
              </div>
              <p className="text-2xl font-bold">{mockData.heroMetrics.totalSoftware}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <p className="text-sm text-blue-100">High Risk</p>
              </div>
              <p className="text-2xl font-bold">{mockData.heroMetrics.highRiskVendors}</p>
              <p className="text-xs text-blue-100">Vendors</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-yellow-300" />
                <p className="text-sm text-blue-100">Renewals</p>
              </div>
              <p className="text-2xl font-bold">{mockData.heroMetrics.renewalsNext90Days}</p>
              <p className="text-xs text-blue-100">Next 90 Days</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-white" />
                <p className="text-sm text-blue-100">Total Users</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(mockData.heroMetrics.totalUsers)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* INSIGHTS CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50/50 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Target className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-600">Top Opportunity</Badge>
            </div>
            <CardTitle className="text-xl mt-4">Replace Asana with ClickUp</CardTitle>
            <CardDescription className="text-lg font-semibold text-green-700">
              Save $83K annually (87% savings)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              View Details <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Zap className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-600">Quick Win</Badge>
            </div>
            <CardTitle className="text-xl mt-4">Right-size Tableau licenses</CardTitle>
            <CardDescription className="text-lg font-semibold text-blue-700">
              Remove 140 unused licenses<br />Save $168K immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Optimize Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Bell className="w-8 h-8 text-orange-600" />
              <Badge className="bg-orange-600">Action Required</Badge>
            </div>
            <CardTitle className="text-xl mt-4">Salesforce renews in 45 days</CardTitle>
            <CardDescription className="text-lg font-semibold text-orange-700">
              Negotiate 20% discount<br />Playbook ready
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              View Strategy <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* PORTFOLIO BREAKDOWN */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>Distribution of annual software spend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.spendByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.spendByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Software by Spend</CardTitle>
            <CardDescription>Largest cost drivers in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.topSoftware} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="spend" fill="#0066FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* REPLACEMENT OPPORTUNITIES */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Replacement Opportunities</CardTitle>
              <CardDescription>AI-identified alternatives with significant savings potential</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Quick Wins</Button>
              <Button variant="outline" size="sm">Evaluation</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Software</TableHead>
                <TableHead>Current Cost</TableHead>
                <TableHead>Alternative</TableHead>
                <TableHead>Potential Savings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.replacementOpportunities.map((opp) => (
                <TableRow key={opp.software} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{opp.software}</TableCell>
                  <TableCell>{formatCurrency(opp.currentCost)}</TableCell>
                  <TableCell>{opp.alternative}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(opp.potentialSavings)}
                      </span>
                      <span className="text-xs text-gray-500">({opp.savingsPercent}%)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        opp.statusColor === "green"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }
                    >
                      {opp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Review <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* COST TREND */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend & Forecast</CardTitle>
          <CardDescription>Monthly spend with 6-month forecast (showing potential savings if opportunities implemented)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData.costTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="#0066FF"
                strokeWidth={2}
                name="Actual Spend"
                dot={{ fill: '#0066FF' }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#00C9A7"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast (With Savings)"
                dot={{ fill: '#00C9A7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* RISK ALERTS & RECENT ACTIVITY */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.riskAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  alert.color === "red"
                    ? "bg-red-50 border-red-500"
                    : alert.color === "yellow"
                    ? "bg-yellow-50 border-yellow-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  </div>
                  <AlertCircle
                    className={`w-5 h-5 ${
                      alert.color === "red"
                        ? "text-red-500"
                        : alert.color === "yellow"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <Clock className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <p className="text-sm text-gray-900 mt-1">{activity.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Add Software</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
              <Download className="w-6 h-6" />
              <span className="text-sm">Import CSV</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
              <PlayCircle className="w-6 h-6" />
              <span className="text-sm">Run AI Analysis</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule Review</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
