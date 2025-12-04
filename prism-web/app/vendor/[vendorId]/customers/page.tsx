"use client";

import { useEffect, useState } from "react";
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
  Users,
  Search,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  Mail,
  ChevronDown,
  Filter,
  Download
} from "lucide-react";
import { useParams } from "next/navigation";
import type { CustomerHealthData } from "@/types/vendor";

interface CustomerSummary {
  total_customers: number;
  avg_health_score: number;
  at_risk_count: number;
  renewals_next_30: number;
  total_revenue: number;
}

export default function VendorCustomers() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerHealthData[]>([]);
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("renewal_date");

  useEffect(() => {
    fetchCustomers();
  }, [vendorId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}/customers`);
      const result = await response.json();

      if (result.success && result.data) {
        setCustomers(result.data.customers || []);
        setSummary(result.data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
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

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return <Badge variant="destructive">High Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Medium Risk</Badge>;
      case "low":
        return <Badge className="bg-green-500">Healthy</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredCustomers = customers
    .filter((c) => {
      if (searchQuery) {
        return c.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter((c) => {
      if (riskFilter !== "all") {
        return c.risk_level === riskFilter;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "renewal_date":
          return (a.days_to_renewal || 999) - (b.days_to_renewal || 999);
        case "health_score":
          return a.health_score - b.health_score;
        case "annual_value":
          return b.annual_value - a.annual_value;
        case "company_name":
          return a.company_name.localeCompare(b.company_name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Customers</h1>
        <p className="text-gray-600 mt-1">
          PRISM clients currently using your software
        </p>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Total Customers</p>
            </div>
            <p className="text-2xl font-bold">{summary?.total_customers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Avg Health Score</p>
            </div>
            <p className="text-2xl font-bold">{summary?.avg_health_score || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-500">At Risk</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{summary?.at_risk_count || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-500">Renewals (30d)</p>
            </div>
            <p className="text-2xl font-bold">{summary?.renewals_next_30 || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary?.total_revenue || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Healthy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ChevronDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renewal_date">Renewal Date</SelectItem>
                <SelectItem value="health_score">Health Score</SelectItem>
                <SelectItem value="annual_value">Annual Value</SelectItem>
                <SelectItem value="company_name">Company Name</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CUSTOMERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Health Overview</CardTitle>
          <CardDescription>
            Monitor customer health and identify churn risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">
                {customers.length === 0
                  ? "You don't have any PRISM customers yet"
                  : "No customers match your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Annual Value</TableHead>
                  <TableHead>Renewal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.company_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-medium">{customer.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{customer.product_name}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getHealthScoreColor(customer.health_score)}`}>
                        {customer.health_score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              customer.utilization_rate >= 80
                                ? "bg-green-500"
                                : customer.utilization_rate >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${customer.utilization_rate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {customer.utilization_rate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(customer.annual_value)}</TableCell>
                    <TableCell>
                      {customer.renewal_date ? (
                        <div>
                          <div className="text-sm">
                            {new Date(customer.renewal_date).toLocaleDateString()}
                          </div>
                          {customer.days_to_renewal !== undefined && (
                            <div
                              className={`text-xs ${
                                customer.days_to_renewal <= 30
                                  ? "text-red-600"
                                  : customer.days_to_renewal <= 90
                                  ? "text-orange-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {customer.days_to_renewal} days
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getRiskBadge(customer.risk_level)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Engage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
