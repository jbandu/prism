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
  GitCompare,
  TrendingDown,
  Star,
  DollarSign,
  Search,
  Filter,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface Alternative {
  id: string;
  original_software_id: string;
  original_software_name: string;
  original_vendor_name: string;
  original_annual_cost: number | string;
  alternative_name: string;
  alternative_vendor: string;
  alternative_type: string;
  cost_comparison: number | string;
  cost_savings_percentage: number | string;
  feature_parity_score: number | string;
  implementation_complexity: string;
  estimated_migration_time_weeks: number;
  payback_period_months: number;
  three_year_total_savings: number | string;
  recommendation_status: string;
  recommendation_reasoning: string;
}

export default function AlternativesPage({
  params,
}: {
  params: { companyId: string };
}) {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchAlternatives();
  }, [params.companyId]);

  const fetchAlternatives = async () => {
    try {
      setLoading(true);

      // Fetch company to get ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;

        // Fetch alternatives
        const altResponse = await fetch(`/api/alternatives?companyId=${companyId}`);
        const altResult = await altResponse.json();

        if (altResult.success) {
          setAlternatives(altResult.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching alternatives:", error);
      toast.error("Failed to load alternatives");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const getRecommendationBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      "strongly-recommend": { color: "bg-green-100 text-green-700", label: "Strongly Recommend", icon: CheckCircle },
      "recommend": { color: "bg-blue-100 text-blue-700", label: "Recommend", icon: Star },
      "consider": { color: "bg-yellow-100 text-yellow-700", label: "Consider", icon: AlertCircle },
      "not-recommended": { color: "bg-red-100 text-red-700", label: "Not Recommended", icon: AlertCircle },
    };
    return badges[status] || badges["consider"];
  };

  const getComplexityBadge = (complexity: string) => {
    const badges: Record<string, string> = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-red-100 text-red-700",
    };
    return badges[complexity] || badges.medium;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      "open-source": "bg-purple-100 text-purple-700",
      commercial: "bg-blue-100 text-blue-700",
      freemium: "bg-green-100 text-green-700",
    };
    return badges[type] || "bg-gray-100 text-gray-700";
  };

  // Filter alternatives
  const filteredAlternatives = alternatives
    .filter((alt) => {
      const matchesSearch = searchTerm === "" ||
        alt.alternative_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.original_software_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.alternative_vendor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || alt.alternative_type === typeFilter;

      return matchesSearch && matchesType;
    });

  // Calculate summary metrics
  const totalPotentialSavings = alternatives.reduce((sum, alt) => {
    const savings = parseFloat(alt.three_year_total_savings as any) || 0;
    return sum + savings;
  }, 0);

  const avgSavingsPercentage = alternatives.length > 0
    ? alternatives.reduce((sum, alt) => sum + (parseFloat(alt.cost_savings_percentage as any) || 0), 0) / alternatives.length
    : 0;

  const stronglyRecommended = alternatives.filter(alt => alt.recommendation_status === "strongly-recommend").length;

  const uniqueTypes = ["all", ...Array.from(new Set(alternatives.map(alt => alt.alternative_type)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <GitCompare className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading alternatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Software Alternatives</h1>
          <p className="text-gray-600 mt-2">
            AI-powered alternative software recommendations
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
                <p className="text-sm text-gray-600">Total Alternatives</p>
                <p className="text-2xl font-bold text-prism-dark">{alternatives.length}</p>
              </div>
              <GitCompare className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">3-Year Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPotentialSavings)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Savings</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {avgSavingsPercentage.toFixed(0)}%
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
                <p className="text-sm text-gray-600">Highly Recommended</p>
                <p className="text-2xl font-bold text-green-600">{stronglyRecommended}</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search alternatives or current software..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative Recommendations ({filteredAlternatives.length})</CardTitle>
          <CardDescription>
            Better, cheaper alternatives to your current software
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAlternatives.length === 0 ? (
            <div className="text-center py-12">
              <GitCompare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No alternatives found</p>
              <p className="text-sm text-gray-400">
                {searchTerm || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No alternative solutions available yet"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Current Software</TableHead>
                    <TableHead>Alternative</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cost Comparison</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Feature Match</TableHead>
                    <TableHead>Implementation</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlternatives.map((alt) => {
                    const recommendation = getRecommendationBadge(alt.recommendation_status);
                    const RecommendIcon = recommendation.icon;
                    const originalCost = parseFloat(alt.original_annual_cost as any) || 0;
                    const altCost = parseFloat(alt.cost_comparison as any) || 0;
                    const savingsPercent = parseFloat(alt.cost_savings_percentage as any) || 0;
                    const featureParity = parseFloat(alt.feature_parity_score as any) || 0;

                    return (
                      <TableRow key={alt.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{alt.original_software_name}</p>
                            <p className="text-sm text-gray-500">{alt.original_vendor_name}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Current: {formatCurrency(originalCost)}/yr
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-prism-primary">{alt.alternative_name}</p>
                            <p className="text-sm text-gray-500">{alt.alternative_vendor}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              New: {formatCurrency(altCost)}/yr
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadge(alt.alternative_type)}>
                            {alt.alternative_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{formatCurrency(originalCost - altCost)}</p>
                            <p className="text-xs text-gray-500">annual savings</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              {savingsPercent.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                                <div
                                  className={`h-2 rounded-full ${
                                    featureParity >= 0.9
                                      ? "bg-green-500"
                                      : featureParity >= 0.7
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${(featureParity * 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {(featureParity * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge className={getComplexityBadge(alt.implementation_complexity)}>
                              {alt.implementation_complexity}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {alt.estimated_migration_time_weeks}w migration
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={recommendation.color}>
                              <RecommendIcon className="w-3 h-3 mr-1" />
                              {recommendation.label}
                            </Badge>
                          </div>
                          {alt.payback_period_months && (
                            <p className="text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {alt.payback_period_months}mo payback
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info("Detailed comparison coming soon!", {
                              description: alt.recommendation_reasoning
                            })}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Details
                          </Button>
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

      {/* AI Insight Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Zap className="w-8 h-8 text-prism-primary flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-prism-dark mb-2">
                AI-Powered Recommendations
              </h3>
              <p className="text-gray-600 mb-4">
                Our AI analyzes your software usage, feature requirements, and budget to recommend the best alternatives.
                Each recommendation includes implementation complexity, migration time, and expected ROI.
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Feature compatibility analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>Cost-benefit calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>Migration planning</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
