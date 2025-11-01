"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Search,
  Plus,
  Download,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  Layers,
} from "lucide-react";
import type { Software } from "@/types";

export default function SoftwarePage({
  params,
}: {
  params: { companyId: string };
}) {
  const [software, setSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [actualCompanyId, setActualCompanyId] = useState<string>("");

  useEffect(() => {
    fetchCompanyAndSoftware();
  }, [params.companyId, categoryFilter]);

  const fetchCompanyAndSoftware = async () => {
    try {
      setLoading(true);

      // First, fetch company to get the actual ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;
        setActualCompanyId(companyId);

        // Now fetch software using the actual company ID
        const queryParams = new URLSearchParams({
          companyId: companyId,
        });

        if (categoryFilter && categoryFilter !== "all") {
          queryParams.append("category", categoryFilter);
        }

        const response = await fetch(`/api/software?${queryParams}`);
        const result = await response.json();

        if (result.success) {
          setSoftware(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching software:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getDaysToRenewal = (renewalDate: Date | string) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-700 hover:bg-green-200",
      expiring_soon: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      expired: "bg-red-100 text-red-700 hover:bg-red-200",
      renewed: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    };
    return statusColors[status] || statusColors.active;
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return { color: "bg-green-100 text-green-700", label: "Healthy" };
    if (rate >= 50) return { color: "bg-yellow-100 text-yellow-700", label: "Moderate" };
    return { color: "bg-red-100 text-red-700", label: "Low" };
  };

  // Calculate summary metrics
  // Note: Neon returns NUMERIC/DECIMAL as strings, so we need to parse them
  const totalSoftware = software.length;
  const totalAnnualSpend = software.reduce((sum, s) => sum + (parseFloat(s.total_annual_cost as any) || 0), 0);
  const totalWaste = software.reduce((sum, s) => sum + (parseFloat(s.waste_amount as any) || 0), 0);
  const avgUtilization = software.length > 0
    ? software.reduce((sum, s) => sum + (parseFloat(s.utilization_rate as any) || 0), 0) / software.length
    : 0;

  // Filter software based on search
  const filteredSoftware = software.filter((s) => {
    const matchesSearch = searchTerm === "" ||
      s.software_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(software.map(s => s.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Software Portfolio</h1>
          <p className="text-gray-600 mt-2">
            Manage and optimize your software subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Export functionality coming soon!", {
              description: "CSV/Excel export will be available in the next update."
            })}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => toast.info("Add Software form coming soon!", {
              description: "You'll be able to add software manually or import from CSV."
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Software
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Software</p>
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
                <p className="text-sm text-gray-600">Annual Spend</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {formatCurrency(totalAnnualSpend)}
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
                <p className="text-sm text-gray-600">Total Waste</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalWaste)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
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
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Software Inventory</CardTitle>
              <CardDescription>
                {filteredSoftware.length} of {totalSoftware} applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading software...</p>
            </div>
          ) : filteredSoftware.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No software found</p>
              <p className="text-sm text-gray-400">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first software to get started"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Annual Cost</TableHead>
                    <TableHead>Licenses</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Waste</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSoftware.map((item) => {
                    const utilization = parseFloat(item.utilization_rate as any) || 0;
                    const utilizationBadge = getUtilizationBadge(utilization);
                    const daysToRenewal = getDaysToRenewal(item.renewal_date);
                    const annualCost = parseFloat(item.total_annual_cost as any) || 0;
                    const costPerLicense = item.total_licenses > 0
                      ? annualCost / item.total_licenses
                      : 0;
                    const wasteAmount = parseFloat(item.waste_amount as any) || 0;

                    return (
                      <TableRow key={item.id || item.software_id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{item.software_name}</p>
                            <p className="text-sm text-gray-500">{item.vendor_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{formatCurrency(annualCost)}</p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(costPerLicense)}/license
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{item.active_users}</span>
                            <span className="text-gray-500">/ {item.total_licenses}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                              <div
                                className={`h-2 rounded-full ${
                                  utilization >= 80
                                    ? "bg-green-500"
                                    : utilization >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {utilization.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {wasteAmount > 0 ? (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(wasteAmount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDate(item.renewal_date)}</p>
                            <p className={`text-xs ${
                              daysToRenewal <= 30 ? "text-red-600" :
                              daysToRenewal <= 90 ? "text-yellow-600" :
                              "text-gray-500"
                            }`}>
                              {daysToRenewal > 0 ? `${daysToRenewal} days` : "Expired"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(item.contract_status || "active")}>
                            {(item.contract_status || "active").replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info("Edit feature coming soon!", {
                                description: "You'll be able to edit software details in the next update."
                              })}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => toast.info("Delete feature coming soon!", {
                                description: "You'll be able to remove software from inventory in the next update."
                              })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
