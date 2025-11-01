"use client";

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

// Mock data - replace with real API calls
const mockData = {
  overview: {
    activeClients: 2,
    totalUnderManagement: 12400000,
    softwareAnalyzed: 67,
    savingsIdentified: 2100000
  },
  recentActivity: [
    { time: "2 hours ago", action: "BioRad: AI analyzed Tableau - Found 3 alternatives", type: "analysis" },
    { time: "Yesterday", action: "CoorsTek: New prospect added", type: "client" },
    { time: "2 days ago", action: "BioRad: Cost optimization completed - $2.1M savings found", type: "savings" },
    { time: "3 days ago", action: "System: Vendor risk data updated for 15 vendors", type: "system" }
  ],
  systemHealth: {
    lastAgentRun: "12 minutes ago",
    dbStatus: "Connected",
    apiRateLimit: "2,450 / 5,000",
    dbUsage: "34.2 MB / 512 MB",
    errors: 0
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

export default function AdminDashboard() {
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
            <p className="text-3xl font-bold">{mockData.overview.activeClients}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <p className="text-sm text-blue-100">Under Management</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(mockData.overview.totalUnderManagement)}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5" />
              <p className="text-sm text-blue-100">Software Analyzed</p>
            </div>
            <p className="text-3xl font-bold">{mockData.overview.softwareAnalyzed}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-300" />
              <p className="text-sm text-blue-100">Savings Identified</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(mockData.overview.savingsIdentified)}</p>
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
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'savings' ? 'bg-green-100' :
                    activity.type === 'analysis' ? 'bg-blue-100' :
                    activity.type === 'client' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <Activity className={`w-4 h-4 ${
                      activity.type === 'savings' ? 'text-green-600' :
                      activity.type === 'analysis' ? 'text-blue-600' :
                      activity.type === 'client' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <p className="text-sm text-gray-900 mt-1">{activity.action}</p>
                  </div>
                </div>
              ))}
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
              <p className="text-sm font-medium text-gray-900">{mockData.systemHealth.lastAgentRun}</p>
              <Badge className="mt-1 bg-green-100 text-green-700">Active</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Database Status</p>
              <p className="text-sm font-medium text-gray-900">{mockData.systemHealth.dbStatus}</p>
              <Badge className="mt-1 bg-green-100 text-green-700">Healthy</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">API Rate Limit</p>
              <p className="text-sm font-medium text-gray-900">{mockData.systemHealth.apiRateLimit}</p>
              <Badge className="mt-1 bg-blue-100 text-blue-700">49%</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">DB Usage</p>
              <p className="text-sm font-medium text-gray-900">{mockData.systemHealth.dbUsage}</p>
              <Badge className="mt-1 bg-blue-100 text-blue-700">6.7%</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Errors (24h)</p>
              <p className="text-sm font-medium text-gray-900">{mockData.systemHealth.errors} errors</p>
              <Badge className="mt-1 bg-green-100 text-green-700">Clean</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
