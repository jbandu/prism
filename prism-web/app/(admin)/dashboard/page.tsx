"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Plus,
  Play,
  FileText,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  prospects: number;
  churned: number;
  totalPortfolioValue: number;
  totalSavingsDelivered: number;
  activeAnalyses: number;
}

interface RecentActivity {
  id: string;
  type: "company_added" | "analysis_completed" | "report_generated" | "savings_identified";
  company: string;
  description: string;
  timestamp: string;
  amount?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    prospects: 0,
    churned: 0,
    totalPortfolioValue: 0,
    totalSavingsDelivered: 0,
    activeAnalyses: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    // TODO: Replace with actual API call
    setStats({
      totalClients: 12,
      activeClients: 10,
      prospects: 2,
      churned: 0,
      totalPortfolioValue: 2400000,
      totalSavingsDelivered: 480000,
      activeAnalyses: 5,
    });

    setRecentActivity([
      {
        id: "1",
        type: "savings_identified",
        company: "Acme Corporation",
        description: "Cost optimization analysis completed",
        timestamp: "2 hours ago",
        amount: 64000,
      },
      {
        id: "2",
        type: "company_added",
        company: "Globex Industries",
        description: "New company onboarded",
        timestamp: "5 hours ago",
      },
      {
        id: "3",
        type: "report_generated",
        company: "TechStart Inc",
        description: "Quarterly review report generated",
        timestamp: "1 day ago",
      },
      {
        id: "4",
        type: "analysis_completed",
        company: "InnovateCo",
        description: "Alternative discovery analysis completed",
        timestamp: "2 days ago",
      },
    ]);

    setLoading(false);
  }, []);

  const overviewCards = [
    {
      title: "Total Clients",
      value: stats.totalClients.toString(),
      description: `${stats.activeClients} active, ${stats.prospects} prospects`,
      icon: Building2,
      color: "text-prism-primary",
      bgColor: "bg-prism-primary/10",
    },
    {
      title: "Portfolio Under Management",
      value: formatCurrency(stats.totalPortfolioValue),
      description: "Across all clients",
      icon: DollarSign,
      color: "text-prism-secondary",
      bgColor: "bg-prism-secondary/10",
    },
    {
      title: "Total Savings Delivered",
      value: formatCurrency(stats.totalSavingsDelivered),
      description: `${((stats.totalSavingsDelivered / stats.totalPortfolioValue) * 100).toFixed(1)}% reduction potential`,
      icon: TrendingDown,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active AI Analyses",
      value: stats.activeAnalyses.toString(),
      description: "In progress or pending review",
      icon: AlertTriangle,
      color: "text-prism-accent",
      bgColor: "bg-prism-accent/10",
    },
  ];

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "company_added":
        return <Building2 className="w-4 h-4" />;
      case "analysis_completed":
        return <Activity className="w-4 h-4" />;
      case "report_generated":
        return <FileText className="w-4 h-4" />;
      case "savings_identified":
        return <TrendingDown className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "company_added":
        return "text-blue-600 bg-blue-100";
      case "analysis_completed":
        return "text-purple-600 bg-purple-100";
      case "report_generated":
        return "text-gray-600 bg-gray-100";
      case "savings_identified":
        return "text-green-600 bg-green-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prism-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, jbandu@gmail.com
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/companies?action=add">
            <Button className="bg-prism-primary hover:bg-prism-primary-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-prism-dark">{card.value}</div>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
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
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-prism-dark">{activity.company}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.amount && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        {formatCurrency(activity.amount)} in savings
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
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
            <CardDescription>Common tasks and shortcuts</CardDescription>
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
                View All Clients
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Play className="w-4 h-4 mr-2" />
              Run AI Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Client Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Client Status Overview</CardTitle>
          <CardDescription>Distribution of clients by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {stats.activeClients}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Clients</div>
              <Badge variant="success" className="mt-2">
                {((stats.activeClients / stats.totalClients) * 100).toFixed(0)}%
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.prospects}
              </div>
              <div className="text-sm text-gray-600 mt-1">Prospects</div>
              <Badge variant="warning" className="mt-2">
                {((stats.prospects / stats.totalClients) * 100).toFixed(0)}%
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {stats.churned}
              </div>
              <div className="text-sm text-gray-600 mt-1">Churned</div>
              <Badge variant="danger" className="mt-2">
                {((stats.churned / stats.totalClients) * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
