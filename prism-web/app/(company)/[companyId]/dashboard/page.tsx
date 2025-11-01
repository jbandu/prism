"use client";

import { useEffect, useState } from "react";
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
  Clock,
  Upload,
  GitCompare,
  BarChart3,
  Settings,
  Sparkles
} from "lucide-react";
import Link from "next/link";
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

export default function CompanyDashboard({
  params,
}: {
  params: { companyId: string };
}) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [software, setSoftware] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [params.companyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch company details (by slug or ID)
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const fetchedCompany = companyResult.data;
        setCompany(fetchedCompany);

        // Fetch software data using the company's actual ID
        const softwareResponse = await fetch(`/api/software?companyId=${fetchedCompany.id}`);
        const softwareResult = await softwareResponse.json();

        if (softwareResult.success) {
          setSoftware(softwareResult.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate metrics from real data
  // Note: Neon returns NUMERIC/DECIMAL as strings, so we need to parse them
  const totalSoftware = software.length;
  const totalAnnualSpend = software.reduce((sum, s) => sum + (parseFloat(s.total_annual_cost as any) || 0), 0);
  const totalWaste = software.reduce((sum, s) => sum + (parseFloat(s.waste_amount as any) || 0), 0);
  const totalSavings = software.reduce((sum, s) => sum + (parseFloat(s.potential_savings as any) || 0), 0);
  const avgUtilization = software.length > 0
    ? software.reduce((sum, s) => sum + (parseFloat(s.utilization_rate as any) || 0), 0) / software.length
    : 0;

  // Get software with savings opportunities
  const savingsOpportunities = software
    .filter(s => (parseFloat(s.potential_savings as any) || 0) > 0)
    .sort((a, b) => (parseFloat(b.potential_savings as any) || 0) - (parseFloat(a.potential_savings as any) || 0))
    .slice(0, 3);

  // Get top spending software
  const topSoftware = [...software]
    .sort((a, b) => (parseFloat(b.total_annual_cost as any) || 0) - (parseFloat(a.total_annual_cost as any) || 0))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-prism-primary to-prism-secondary rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {company?.company_name || 'Company'} - Software Portfolio
        </h1>
        <p className="text-blue-100 mb-6">Comprehensive view of your software investments and optimization opportunities</p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-white" />
                <p className="text-sm text-blue-100">Annual Spend</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalAnnualSpend)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-300" />
                <p className="text-sm text-blue-100">Potential Savings</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
              {totalAnnualSpend > 0 && (
                <p className="text-xs text-green-300">
                  ({((totalSavings / totalAnnualSpend) * 100).toFixed(0)}%)
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-white" />
                <p className="text-sm text-blue-100">Software</p>
              </div>
              <p className="text-2xl font-bold">{totalSoftware}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <p className="text-sm text-blue-100">Avg Utilization</p>
              </div>
              <p className="text-2xl font-bold">{avgUtilization.toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <p className="text-sm text-blue-100">Waste</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalWaste)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-white" />
                <p className="text-sm text-blue-100">Employees</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(company?.employee_count || 0)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-prism-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and data management operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href={`/${params.companyId}/analysis`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-prism-primary hover:bg-prism-primary/5 border-2"
              >
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-prism-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Run AI Analysis</p>
                  <p className="text-xs text-gray-500">Discover insights</p>
                </div>
              </Button>
            </Link>

            <Link href={`/${params.companyId}/import`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-50"
              >
                <Upload className="w-6 h-6 text-green-600" />
                <div className="text-center">
                  <p className="font-semibold">Import CSV</p>
                  <p className="text-xs text-gray-500">Upload software data</p>
                </div>
              </Button>
            </Link>

            <Link href={`/${params.companyId}/alternatives`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-50"
              >
                <GitCompare className="w-6 h-6 text-purple-600" />
                <div className="text-center">
                  <p className="font-semibold">Find Alternatives</p>
                  <p className="text-xs text-gray-500">Discover savings</p>
                </div>
              </Button>
            </Link>

            <Link href={`/${params.companyId}/renewals`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50"
              >
                <Calendar className="w-6 h-6 text-orange-600" />
                <div className="text-center">
                  <p className="font-semibold">Manage Renewals</p>
                  <p className="text-xs text-gray-500">Track contracts</p>
                </div>
              </Button>
            </Link>

            <Link href={`/${params.companyId}/reports`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50"
              >
                <FileText className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <p className="font-semibold">Generate Report</p>
                  <p className="text-xs text-gray-500">Export insights</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* TOP OPPORTUNITIES */}
      {savingsOpportunities.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {savingsOpportunities.map((software, index) => (
            <Card
              key={software.software_id}
              className={`border-${index === 0 ? 'green' : index === 1 ? 'blue' : 'orange'}-200 bg-${index === 0 ? 'green' : index === 1 ? 'blue' : 'orange'}-50/50 hover:shadow-lg transition-shadow cursor-pointer`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  {index === 0 ? <Target className="w-8 h-8 text-green-600" /> :
                   index === 1 ? <Zap className="w-8 h-8 text-blue-600" /> :
                   <Bell className="w-8 h-8 text-orange-600" />}
                  <Badge className={`bg-${index === 0 ? 'green' : index === 1 ? 'blue' : 'orange'}-600`}>
                    {index === 0 ? 'Top Opportunity' : index === 1 ? 'Quick Win' : 'Action Required'}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4">{software.software_name}</CardTitle>
                <CardDescription className={`text-lg font-semibold text-${index === 0 ? 'green' : index === 1 ? 'blue' : 'orange'}-700`}>
                  Save {formatCurrency(software.potential_savings || 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className={`w-full bg-${index === 0 ? 'green' : index === 1 ? 'blue' : 'orange'}-600 hover:bg-${index === 0 ? 'green' : index === 1 ? 'blue' : 'orange'}-700`}>
                  View Details <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TOP SOFTWARE BY SPEND */}
      {topSoftware.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Software by Spend</CardTitle>
            <CardDescription>Largest cost drivers in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSoftware} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="software_name" type="category" width={150} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total_annual_cost" fill="#0066FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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

      {software.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No software data yet</h3>
              <p className="text-gray-600 mb-6">
                Add your software inventory to start tracking and optimizing your spend
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Software
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
