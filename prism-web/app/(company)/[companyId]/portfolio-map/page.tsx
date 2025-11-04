"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  Grid3x3,
  TrendingDown,
  Package,
  DollarSign,
  Search,
  Download,
  BarChart3,
  Activity,
  Box,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import type { Software } from "@/types";
import { LogoImage } from "@/components/ui/logo-image";

type ViewMode = "grid" | "treemap" | "category" | "spend";

interface CategoryGroup {
  category: string;
  software: Software[];
  totalCost: number;
  count: number;
}

export default function PortfolioMapPage({
  params,
}: {
  params: { companyId: string };
}) {
  const [software, setSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSoftware();
  }, [params.companyId]);

  const fetchSoftware = async () => {
    try {
      setLoading(true);
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;
        const response = await fetch(`/api/software?companyId=${companyId}`);
        const result = await response.json();

        if (result.success) {
          setSoftware(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching software:", error);
      toast.error("Failed to load software portfolio");
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
    return `$${value.toFixed(0)}`;
  };

  // Filter software
  const filteredSoftware = software.filter((s) =>
    searchTerm === "" ||
    s.software_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category
  const categoryGroups: CategoryGroup[] = Object.values(
    filteredSoftware.reduce((acc, s) => {
      const category = s.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          software: [],
          totalCost: 0,
          count: 0,
        };
      }
      acc[category].software.push(s);
      acc[category].totalCost += parseFloat(s.total_annual_cost as any) || 0;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, CategoryGroup>)
  ).sort((a, b) => b.totalCost - a.totalCost);

  // Calculate metrics
  const totalSoftware = filteredSoftware.length;
  const totalSpend = filteredSoftware.reduce((sum, s) => sum + (parseFloat(s.total_annual_cost as any) || 0), 0);
  const avgUtilization = filteredSoftware.length > 0
    ? filteredSoftware.reduce((sum, s) => sum + (parseFloat(s.utilization_rate as any) || 0), 0) / filteredSoftware.length
    : 0;

  // Sort by spend for spend view
  const softwareBySpend = [...filteredSoftware].sort(
    (a, b) => (parseFloat(b.total_annual_cost as any) || 0) - (parseFloat(a.total_annual_cost as any) || 0)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Layers className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading portfolio map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Portfolio Map</h1>
          <p className="text-gray-600 mt-2">
            Visual overview of your software ecosystem
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Export functionality coming soon!")}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-prism-dark">{totalSoftware}</p>
              </div>
              <Package className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Annual Spend</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {formatCurrency(totalSpend)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-prism-dark">{categoryGroups.length}</p>
              </div>
              <Layers className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {avgUtilization.toFixed(0)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search software, vendor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "category" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("category")}
              >
                <Box className="w-4 h-4 mr-2" />
                Categories
              </Button>
              <Button
                variant={viewMode === "treemap" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("treemap")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Treemap
              </Button>
              <Button
                variant={viewMode === "spend" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("spend")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                By Spend
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredSoftware.map((item) => {
            const annualCost = parseFloat(item.total_annual_cost as any) || 0;
            const utilization = parseFloat(item.utilization_rate as any) || 0;

            return (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => toast.info(`${item.software_name} Details`, {
                  description: `${item.vendor_name} • ${formatCurrency(annualCost)}/yr`
                })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-3">
                    <LogoImage
                      name={item.vendor_name || item.software_name}
                      size={64}
                      className="rounded-lg"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                    {item.software_name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">{item.vendor_name}</p>
                  <Badge variant="outline" className="text-xs mb-2">
                    {item.category}
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(annualCost)}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            utilization >= 80 ? "bg-green-500" :
                            utilization >= 50 ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{utilization.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category View */}
      {viewMode === "category" && (
        <div className="space-y-6">
          {categoryGroups.map((group) => (
            <Card key={group.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-prism-primary" />
                      {group.category}
                    </CardTitle>
                    <CardDescription>
                      {group.count} applications • {formatCurrency(group.totalCost)} annual spend
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {formatCurrency(group.totalCost)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {group.software.map((item) => {
                    const annualCost = parseFloat(item.total_annual_cost as any) || 0;
                    const utilization = parseFloat(item.utilization_rate as any) || 0;

                    return (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => toast.info(`${item.software_name} Details`, {
                          description: `${item.vendor_name} • ${formatCurrency(annualCost)}/yr`
                        })}
                      >
                        <div className="w-12 h-12 mx-auto mb-2">
                          <LogoImage
                            name={item.vendor_name || item.software_name}
                            size={48}
                            className="rounded-lg"
                          />
                        </div>
                        <p className="font-medium text-xs text-gray-900 mb-1 truncate">
                          {item.software_name}
                        </p>
                        <p className="text-xs text-gray-500 mb-1 truncate">{item.vendor_name}</p>
                        <p className="text-xs font-semibold text-gray-900">
                          {formatCurrency(annualCost)}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${
                                utilization >= 80 ? "bg-green-500" :
                                utilization >= 50 ? "bg-yellow-500" :
                                "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Treemap View */}
      {viewMode === "treemap" && (
        <Card>
          <CardHeader>
            <CardTitle>Software Spend Visualization</CardTitle>
            <CardDescription>
              Box size represents annual cost - larger boxes indicate higher spend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2 auto-rows-fr">
              {softwareBySpend.map((item, index) => {
                const annualCost = parseFloat(item.total_annual_cost as any) || 0;
                const utilization = parseFloat(item.utilization_rate as any) || 0;
                const percentage = (annualCost / totalSpend) * 100;

                // Calculate grid span based on cost (min 2, max 6)
                const span = Math.max(2, Math.min(6, Math.ceil(percentage / 5)));

                return (
                  <div
                    key={item.id}
                    className={`col-span-${span} row-span-1 rounded-lg p-4 hover:opacity-90 transition-opacity cursor-pointer flex flex-col justify-between min-h-[120px]`}
                    style={{
                      backgroundColor: utilization >= 80 ? '#10b981' :
                                     utilization >= 50 ? '#f59e0b' :
                                     '#ef4444',
                      opacity: 0.1 + (percentage / 100) * 0.9,
                      gridColumn: `span ${span}`,
                    }}
                    onClick={() => toast.info(`${item.software_name} Details`, {
                      description: `Annual Cost: ${formatCurrency(annualCost)} (${percentage.toFixed(1)}% of total)`
                    })}
                  >
                    <div>
                      <p className="font-bold text-white text-sm mb-1 truncate">
                        {item.software_name}
                      </p>
                      <p className="text-xs text-white/90 truncate">{item.vendor_name}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(annualCost)}
                      </p>
                      <p className="text-xs text-white/90">
                        {percentage.toFixed(1)}% of spend
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span>High Utilization (≥80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span>Medium Utilization (50-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span>Low Utilization (&lt;50%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spend View */}
      {viewMode === "spend" && (
        <Card>
          <CardHeader>
            <CardTitle>Software Ranked by Annual Spend</CardTitle>
            <CardDescription>
              Top spending applications with utilization metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {softwareBySpend.map((item, index) => {
                const annualCost = parseFloat(item.total_annual_cost as any) || 0;
                const utilization = parseFloat(item.utilization_rate as any) || 0;
                const percentage = (annualCost / totalSpend) * 100;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toast.info(`${item.software_name} Details`, {
                      description: `Rank #${index + 1} by spend`
                    })}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-prism-primary text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-shrink-0">
                      <LogoImage
                        name={item.vendor_name || item.software_name}
                        size={48}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.software_name}</p>
                      <p className="text-sm text-gray-500 truncate">{item.vendor_name}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="flex-shrink-0 w-32">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              utilization >= 80 ? "bg-green-500" :
                              utilization >= 50 ? "bg-yellow-500" :
                              "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {utilization.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 text-right">utilization</p>
                    </div>
                    <div className="flex-shrink-0 text-right w-32">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(annualCost)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredSoftware.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No software found</p>
            <p className="text-sm text-gray-400">
              {searchTerm ? "Try adjusting your search" : "Add software to see your portfolio map"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
