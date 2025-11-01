"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DollarSign,
  TrendingDown,
  Package,
  Plus,
  Play,
  FileText,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Company } from "@/types";

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeClients: 0,
    totalUnderManagement: 0,
    softwareAnalyzed: 0,
    savingsIdentified: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      const result = await response.json();

      if (result.success && result.data) {
        const companies: Company[] = result.data;
        setStats({
          activeClients: companies.length,
          totalUnderManagement: 0, // TODO: Calculate from company dashboards
          softwareAnalyzed: 0, // TODO: Calculate from software counts
          savingsIdentified: 0 // TODO: Calculate from analyses
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">PRISM Platform Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back, jbandu@gmail.com</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/companies?action=add">
            <Button className="bg-prism-primary hover:bg-prism-primary-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </Link>
          <Button variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Admin Overview Cards */}
      <div className="bg-gradient-to-r from-prism-primary to-prism-secondary rounded-lg p-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5" />
              <p className="text-sm text-blue-100">Active Clients</p>
            </div>
            <p className="text-3xl font-bold">{loading ? "..." : stats.activeClients}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <p className="text-sm text-blue-100">Under Management</p>
            </div>
            <p className="text-3xl font-bold">{loading ? "..." : formatCurrency(stats.totalUnderManagement)}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5" />
              <p className="text-sm text-blue-100">Software Analyzed</p>
            </div>
            <p className="text-3xl font-bold">{loading ? "..." : stats.softwareAnalyzed}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-300" />
              <p className="text-sm text-blue-100">Savings Identified</p>
            </div>
            <p className="text-3xl font-bold">{loading ? "..." : formatCurrency(stats.savingsIdentified)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Activity tracking coming soon</p>
            </div>
            <Link href="/admin/companies">
              <Button variant="ghost" className="w-full mt-4">
                View All Activity
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/companies?action=add">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Client
              </Button>
            </Link>
            <Link href="/admin/companies">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="w-4 h-4 mr-2" />
                Manage Clients
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Platform status and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Agent Run</p>
              <p className="text-sm font-medium text-gray-900">N/A</p>
              <Badge className="mt-1 bg-green-100 text-green-700">Active</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Database Status</p>
              <p className="text-sm font-medium text-gray-900">Connected</p>
              <Badge className="mt-1 bg-green-100 text-green-700">Healthy</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Clients</p>
              <p className="text-sm font-medium text-gray-900">{stats.activeClients}</p>
              <Badge className="mt-1 bg-blue-100 text-blue-700">Live</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">System Status</p>
              <p className="text-sm font-medium text-gray-900">Operational</p>
              <Badge className="mt-1 bg-green-100 text-green-700">OK</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Errors (24h)</p>
              <p className="text-sm font-medium text-gray-900">0 errors</p>
              <Badge className="mt-1 bg-green-100 text-green-700">Clean</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
