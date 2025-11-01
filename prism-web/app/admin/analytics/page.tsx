"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Activity } from "lucide-react";

// Mock data for analytics
const portfolioValueOverTime = [
  { month: "Jan", value: 8200000 },
  { month: "Feb", value: 8800000 },
  { month: "Mar", value: 9400000 },
  { month: "Apr", value: 10200000 },
  { month: "May", value: 11100000 },
  { month: "Jun", value: 12400000 }
];

const savingsDelivered = [
  { month: "Jan", savings: 180000 },
  { month: "Feb", savings: 220000 },
  { month: "Mar", savings: 340000 },
  { month: "Apr", savings: 480000 },
  { month: "May", savings: 680000 },
  { month: "Jun", savings: 850000 }
];

const clientAcquisition = [
  { stage: "Leads", count: 45, color: "#0066FF" },
  { stage: "Qualified", count: 18, color: "#00C9A7" },
  { stage: "Proposal", count: 8, color: "#9B59B6" },
  { stage: "Negotiation", count: 4, color: "#F39C12" },
  { stage: "Closed", count: 2, color: "#27AE60" }
];

const softwareCategories = [
  { name: "ERP", count: 15, color: "#0066FF" },
  { name: "CRM", count: 12, color: "#00C9A7" },
  { name: "Collaboration", count: 18, color: "#FF6B6B" },
  { name: "Analytics", count: 8, color: "#9B59B6" },
  { name: "Security", count: 10, color: "#F39C12" },
  { name: "Other", count: 4, color: "#95A5A6" }
];

const topVendors = [
  { name: "Microsoft", frequency: 24 },
  { name: "Salesforce", frequency: 18 },
  { name: "Oracle", frequency: 15 },
  { name: "SAP", frequency: 12 },
  { name: "Adobe", frequency: 10 },
  { name: "Atlassian", frequency: 8 },
  { name: "Zoom", frequency: 7 },
  { name: "Slack", frequency: 6 }
];

const agentActivity = [
  { week: "Week 1", analyses: 12 },
  { week: "Week 2", analyses: 18 },
  { week: "Week 3", analyses: 15 },
  { week: "Week 4", analyses: 24 },
  { week: "Week 5", analyses: 21 },
  { week: "Week 6", analyses: 28 }
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Platform Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value Managed</CardTitle>
            <DollarSign className="w-5 h-5 text-prism-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-prism-dark">$12.4M</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-600">+51% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Savings Delivered</CardTitle>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-prism-dark">$2.1M</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-600">+25% this month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
            <Users className="w-5 h-5 text-prism-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-prism-dark">2</div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-sm text-gray-600">4 prospects in pipeline</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Software Analyzed</CardTitle>
            <Package className="w-5 h-5 text-prism-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-prism-dark">67</div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-sm text-gray-600">Across all clients</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Value Over Time</CardTitle>
            <CardDescription>Total value under management growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioValueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0066FF"
                  strokeWidth={2}
                  dot={{ fill: '#0066FF', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Savings Delivered</CardTitle>
            <CardDescription>Total savings identified by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsDelivered}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#00C9A7"
                  strokeWidth={2}
                  dot={{ fill: '#00C9A7', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Acquisition Funnel</CardTitle>
            <CardDescription>Pipeline from leads to closed deals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientAcquisition} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0066FF">
                  {clientAcquisition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Software Categories Analyzed</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={softwareCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name} (${count})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {softwareCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Frequency</CardTitle>
            <CardDescription>Most common vendors across clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVendors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#0066FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Agent Analysis Activity</CardTitle>
            <CardDescription>Weekly analysis completions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={agentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="analyses"
                  stroke="#9B59B6"
                  strokeWidth={2}
                  dot={{ fill: '#9B59B6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Email Engagement Rates</CardTitle>
          <CardDescription>Client communication metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-prism-dark">156</div>
              <div className="text-sm text-gray-600 mt-1">Emails Sent</div>
              <Badge className="mt-2 bg-blue-100 text-blue-700">This Month</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">68%</div>
              <div className="text-sm text-gray-600 mt-1">Open Rate</div>
              <Badge className="mt-2 bg-green-100 text-green-700">+5% vs avg</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-prism-secondary">42%</div>
              <div className="text-sm text-gray-600 mt-1">Click Rate</div>
              <Badge className="mt-2 bg-teal-100 text-teal-700">+8% vs avg</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-orange-600">12</div>
              <div className="text-sm text-gray-600 mt-1">Responses</div>
              <Badge className="mt-2 bg-orange-100 text-orange-700">8% rate</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
