"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Lightbulb,
  Award,
  AlertTriangle,
  RefreshCw,
  Building2
} from "lucide-react";
import { useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Vendor, VendorMarketIntelligence, VendorBadge } from "@/types/vendor";

const COLORS = ["#0066FF", "#00C9A7", "#FF6B6B", "#FFB800", "#8B5CF6"];

export default function VendorIntelligence() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [intelligence, setIntelligence] = useState<VendorMarketIntelligence | null>(null);
  const [badges, setBadges] = useState<VendorBadge[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    fetchIntelligence();
  }, [vendorId]);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}/intelligence`);
      const result = await response.json();

      if (result.success && result.data) {
        setVendor(result.data.vendor);
        setIntelligence(result.data.intelligence);
        setBadges(result.data.badges || []);
        setInsights(result.data.insights || []);
      }
    } catch (error) {
      console.error("Error fetching intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!num) return "$0";
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatPercent = (value: number | string | undefined) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!num) return "0%";
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string | undefined) => {
    switch (trend) {
      case "growing":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <LineChart className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendBadge = (trend: string | undefined) => {
    switch (trend) {
      case "growing":
        return <Badge className="bg-green-500">Growing</Badge>;
      case "declining":
        return <Badge variant="destructive">Declining</Badge>;
      default:
        return <Badge variant="outline">Stable</Badge>;
    }
  };

  // Mock competitive data for visualization
  const competitiveData = intelligence?.top_competitors?.slice(0, 5) || [];
  const winLossData = [
    { name: "Wins", value: intelligence?.win_loss_data?.wins?.total || 0 },
    { name: "Losses", value: intelligence?.win_loss_data?.losses?.total || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LineChart className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading market intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
          <p className="text-gray-600 mt-1">
            Competitive positioning and market insights for {vendor?.vendor_name}
          </p>
        </div>
        <Button onClick={fetchIntelligence} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500">Market Rank</p>
            </div>
            <p className="text-3xl font-bold">
              {intelligence?.market_rank ? `#${intelligence.market_rank}` : "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">in {vendor?.category || "category"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Market Share</p>
            </div>
            <p className="text-3xl font-bold">
              {formatPercent(intelligence?.market_share_prism)}
            </p>
            <p className="text-xs text-gray-500 mt-1">among PRISM clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {getTrendIcon(intelligence?.adoption_trend)}
              <p className="text-sm text-gray-500">Adoption Trend</p>
            </div>
            <div className="flex items-center gap-2">
              {getTrendBadge(intelligence?.adoption_trend)}
              <span className="text-sm text-gray-600">
                {intelligence?.adoption_growth_rate
                  ? `${formatPercent(intelligence.adoption_growth_rate)} YoY`
                  : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-500">Evaluation Frequency</p>
            </div>
            <p className="text-3xl font-bold">
              {intelligence?.evaluation_frequency || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">searches this quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* INSIGHTS PANEL */}
      {insights.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-700">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PRICING & SATISFACTION */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Pricing Intelligence
            </CardTitle>
            <CardDescription>How your pricing compares in the market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Avg Price Per User</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(intelligence?.avg_price_per_user)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Price Percentile</p>
                  <p className="text-xl font-semibold">
                    {intelligence?.price_percentile
                      ? `${intelligence.price_percentile}th`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Typical Discount Rate</p>
                  <p className="text-2xl font-bold">
                    {formatPercent(intelligence?.typical_discount_rate)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-sm">
                    At Renewal
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Customer Insights
            </CardTitle>
            <CardDescription>Customer health and satisfaction metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Avg Satisfaction</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {intelligence?.avg_customer_satisfaction
                        ? Number(intelligence.avg_customer_satisfaction).toFixed(1)
                        : "-"}
                    </p>
                    <span className="text-gray-500">/ 5.0</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">NPS Score</p>
                  <p className="text-xl font-semibold">
                    {intelligence?.net_promoter_score ?? "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Avg Utilization</p>
                  <p className="text-2xl font-bold">
                    {formatPercent(intelligence?.avg_utilization_rate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Churn Rate</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatPercent(intelligence?.churn_rate_prism)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COMPETITIVE LANDSCAPE */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Top Competitors
            </CardTitle>
            <CardDescription>Market share comparison among PRISM clients</CardDescription>
          </CardHeader>
          <CardContent>
            {competitiveData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={competitiveData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="vendor_name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="market_share" fill="#0066FF" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Competitive data not yet available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Win/Loss Analysis
            </CardTitle>
            <CardDescription>When clients switch vendors</CardDescription>
          </CardHeader>
          <CardContent>
            {winLossData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#00C9A7" : "#FF6B6B"}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Win/loss data not yet available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FEATURE ANALYSIS */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Most Valued Features
            </CardTitle>
            <CardDescription>Features your customers love most</CardDescription>
          </CardHeader>
          <CardContent>
            {intelligence?.most_valued_features &&
            intelligence.most_valued_features.length > 0 ? (
              <div className="space-y-2">
                {intelligence.most_valued_features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Feature analysis not yet available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Feature Gaps
            </CardTitle>
            <CardDescription>Features commonly requested but missing</CardDescription>
          </CardHeader>
          <CardContent>
            {intelligence?.feature_gaps && intelligence.feature_gaps.length > 0 ? (
              <div className="space-y-2">
                {intelligence.feature_gaps.map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700">{gap}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No feature gaps identified</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
