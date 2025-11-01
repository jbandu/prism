"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, DollarSign, Users, Package, Activity } from "lucide-react";

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({
    totalClients: 0,
    totalSoftware: 0,
    totalSpend: 0,
    totalSavings: 0,
    categories: [],
    vendors: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch companies
      const companiesRes = await fetch('/api/companies');
      const companiesData = await companiesRes.json();
      const companies = companiesData.success ? companiesData.data : [];

      // Fetch all software across all companies
      const softwarePromises = companies.map((c: any) =>
        fetch(`/api/software?companyId=${c.company_id}`).then(r => r.json())
      );
      const softwareResults = await Promise.all(softwarePromises);

      const allSoftware = softwareResults
        .filter(r => r.success)
        .flatMap(r => r.data || []);

      // Calculate metrics
      // Note: Neon returns NUMERIC/DECIMAL as strings, so we need to parse them
      const totalSpend = allSoftware.reduce((sum, s) => sum + (parseFloat(s.total_annual_cost) || 0), 0);
      const totalSavings = allSoftware.reduce((sum, s) => sum + (parseFloat(s.potential_savings) || 0), 0);

      // Group by category
      const categoryMap = new Map();
      allSoftware.forEach((s: any) => {
        const cat = s.category || 'Other';
        const existing = categoryMap.get(cat) || { name: cat, count: 0, spend: 0 };
        categoryMap.set(cat, {
          name: cat,
          count: existing.count + 1,
          spend: existing.spend + (parseFloat(s.total_annual_cost) || 0)
        });
      });
      const categories = Array.from(categoryMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Group by vendor
      const vendorMap = new Map();
      allSoftware.forEach((s: any) => {
        const vendor = s.vendor_name || 'Unknown';
        const existing = vendorMap.get(vendor) || { name: vendor, frequency: 0, spend: 0 };
        vendorMap.set(vendor, {
          name: vendor,
          frequency: existing.frequency + 1,
          spend: existing.spend + (parseFloat(s.total_annual_cost) || 0)
        });
      });
      const vendors = Array.from(vendorMap.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 8);

      setAnalytics({
        totalClients: companies.length,
        totalSoftware: allSoftware.length,
        totalSpend,
        totalSavings,
        categories,
        vendors,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = [
    "#0066FF", "#00C9A7", "#FF6B6B", "#9B59B6", "#F39C12", "#95A5A6"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Platform Analytics</h1>
        <p className="text-gray-600 mt-2">Real-time insights from your Neon database</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value Managed</CardTitle>
            <DollarSign className="w-5 h-5 text-prism-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-prism-dark">
              {formatCurrency(analytics.totalSpend)}
            </div>
            <p className="text-sm text-gray-600 mt-2">Across all clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Potential Savings</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(analytics.totalSavings)}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {analytics.totalSpend > 0
                ? `${((analytics.totalSavings / analytics.totalSpend) * 100).toFixed(1)}% potential savings`
                : 'No data yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
            <Users className="w-5 h-5 text-prism-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-prism-dark">
              {analytics.totalClients}
            </div>
            <p className="text-sm text-gray-600 mt-2">Companies in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Software Assets</CardTitle>
            <Package className="w-5 h-5 text-prism-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-prism-dark">
              {analytics.totalSoftware}
            </div>
            <p className="text-sm text-gray-600 mt-2">Across all clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Software Categories</CardTitle>
            <CardDescription>Distribution by category ({analytics.categories.length} categories)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Spend Distribution</CardTitle>
            <CardDescription>Annual spend by category</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="spend" fill="#0066FF" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No spend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Frequency</CardTitle>
            <CardDescription>Most common vendors across all clients</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.vendors.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.vendors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#0066FF" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No vendor data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Spend Analysis</CardTitle>
            <CardDescription>Total spend by vendor</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.vendors.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.vendors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="spend" fill="#00C9A7" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No vendor spend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
          <CardDescription>Aggregated metrics from live database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-3xl font-bold text-prism-dark">{analytics.totalClients}</div>
              <div className="text-sm text-gray-600 mt-1">Total Clients</div>
              <Badge className="mt-2 bg-blue-100 text-blue-700">Live Data</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-3xl font-bold text-prism-dark">{analytics.totalSoftware}</div>
              <div className="text-sm text-gray-600 mt-1">Software Assets</div>
              <Badge className="mt-2 bg-green-100 text-green-700">Tracked</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-3xl font-bold text-prism-dark">
                {analytics.categories.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Software Categories</div>
              <Badge className="mt-2 bg-purple-100 text-purple-700">Analyzed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <Activity className="w-12 h-12 text-prism-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-prism-dark mb-2">
              Advanced Analytics Coming Soon
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Time-series tracking, email engagement metrics, AI agent activity logs, and client acquisition
              funnel will be available once we start collecting historical data and usage analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
