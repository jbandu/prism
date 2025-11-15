"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Server,
  Users,
  Activity,
  DollarSign,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const dashboards = [
    {
      id: "executive",
      name: "Executive",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "CIO Portfolio Overview - High-level metrics and insights",
      path: "/dashboards/executive",
      color: "blue",
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      icon: <Server className="w-5 h-5" />,
      description: "VP Infrastructure Command Center - Real-time operations",
      path: "/dashboards/infrastructure",
      color: "purple",
    },
    {
      id: "department",
      name: "Department",
      icon: <Users className="w-5 h-5" />,
      description: "Department View - Software spend by team",
      path: "/dashboards/department",
      color: "green",
    },
    {
      id: "operations",
      name: "Operations",
      icon: <Activity className="w-5 h-5" />,
      description: "IT Operations - System health and provisioning",
      path: "/dashboards/operations",
      color: "orange",
    },
    {
      id: "finance",
      name: "Finance",
      icon: <DollarSign className="w-5 h-5" />,
      description: "CFO View - Budget analysis and projections",
      path: "/dashboards/finance",
      color: "teal",
    },
    {
      id: "procurement",
      name: "Procurement",
      icon: <ShoppingCart className="w-5 h-5" />,
      description: "Vendor Management - Negotiations and contracts",
      path: "/dashboards/procurement",
      color: "red",
    },
  ];

  const getColorClasses = (color: string, variant: "bg" | "border" | "text" | "hover") => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        hover: "hover:bg-green-100",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        hover: "hover:bg-orange-100",
      },
      teal: {
        bg: "bg-teal-50",
        border: "border-teal-200",
        text: "text-teal-700",
        hover: "hover:bg-teal-100",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        hover: "hover:bg-red-100",
      },
    };
    return colorMap[color]?.[variant] || "";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-prism-primary" />
            PRISM Dashboards
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Comprehensive portfolio analytics for BioRad Laboratories
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
          {dashboards.map((dashboard) => (
            <TabsTrigger
              key={dashboard.id}
              value={dashboard.id}
              className="flex items-center gap-2 py-3"
            >
              {dashboard.icon}
              <span className="hidden sm:inline">{dashboard.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-prism-primary to-prism-secondary text-white">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome to PRISM Dashboards</h2>
                <p className="text-blue-100 text-lg mb-6">
                  Select a dashboard below to explore your software portfolio insights
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-100">Total Spend</p>
                    <p className="text-2xl font-bold">$12.4M</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Tools</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Savings Found</p>
                    <p className="text-2xl font-bold">$524K</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Utilization</p>
                    <p className="text-2xl font-bold">67%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <Link key={dashboard.id} href={dashboard.path}>
                  <Card
                    className={`cursor-pointer transition-all duration-200 border-2 ${getColorClasses(
                      dashboard.color,
                      "border"
                    )} ${getColorClasses(dashboard.color, "bg")} ${getColorClasses(
                      dashboard.color,
                      "hover"
                    )}`}
                  >
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg bg-white shadow-sm ${getColorClasses(
                            dashboard.color,
                            "text"
                          )}`}
                        >
                          {dashboard.icon}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-xl font-bold mb-2 ${getColorClasses(
                              dashboard.color,
                              "text"
                            )}`}
                          >
                            {dashboard.name}
                          </h3>
                          <p className="text-sm text-gray-700">{dashboard.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab(dashboard.id);
                        }}
                      >
                        Open Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Top Opportunity</h3>
                  <p className="text-2xl font-bold text-gray-900">Consolidate Slack</p>
                  <p className="text-green-600 font-semibold mt-1">Save $720K/year</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Critical Renewals</h3>
                  <p className="text-2xl font-bold text-gray-900">2 Contracts</p>
                  <p className="text-red-600 font-semibold mt-1">Due in 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Portfolio Health</h3>
                  <p className="text-2xl font-bold text-gray-900">78/100</p>
                  <p className="text-yellow-600 font-semibold mt-1">Good</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Individual Dashboard Tabs - These will embed the actual dashboard components */}
        {dashboards.map((dashboard) => (
          <TabsContent key={dashboard.id} value={dashboard.id} className="mt-6">
            <Card>
              <CardContent className="pt-8">
                <div className="text-center py-12">
                  <div className={`inline-flex p-6 rounded-full ${getColorClasses(dashboard.color, "bg")} mb-4`}>
                    <div className={getColorClasses(dashboard.color, "text")}>{dashboard.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{dashboard.name} Dashboard</h3>
                  <p className="text-gray-600 mb-6">{dashboard.description}</p>
                  <Link href={dashboard.path}>
                    <Button size="lg" className="bg-prism-primary hover:bg-prism-primary/90">
                      Open Full Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Info Footer */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6 pb-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Need help navigating?</h4>
            <p className="text-sm text-gray-600 mb-4">
              Each dashboard is tailored for different stakeholders in your organization.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-semibold text-gray-900">Executive</p>
                <p className="text-gray-600">CIO, VP</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-semibold text-gray-900">Infrastructure</p>
                <p className="text-gray-600">VP Infra</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-semibold text-gray-900">Department</p>
                <p className="text-gray-600">Managers</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-semibold text-gray-900">Operations</p>
                <p className="text-gray-600">IT Ops</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-semibold text-gray-900">Finance</p>
                <p className="text-gray-600">CFO</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-semibold text-gray-900">Procurement</p>
                <p className="text-gray-600">Buyers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
