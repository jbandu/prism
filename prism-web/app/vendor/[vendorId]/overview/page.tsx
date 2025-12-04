"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  LineChart,
  Megaphone,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowRight,
  Building2,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Clock,
  BadgeCheck
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Vendor, VendorDashboardMetrics, VendorBadge } from "@/types/vendor";

export default function VendorOverview() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [metrics, setMetrics] = useState<VendorDashboardMetrics | null>(null);
  const [badges, setBadges] = useState<VendorBadge[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [vendorId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}/dashboard`);
      const result = await response.json();

      if (result.success && result.data) {
        setVendor(result.data.vendor);
        setMetrics(result.data.metrics);
        setBadges(result.data.badges || []);
      }
    } catch (error) {
      console.error("Error fetching vendor dashboard:", error);
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

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading vendor portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {vendor?.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={vendor.vendor_name}
                className="w-16 h-16 rounded-lg bg-white p-2"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{vendor?.vendor_name || 'Vendor Portal'}</h1>
                {vendor?.verification_status === 'verified' && (
                  <BadgeCheck className="w-6 h-6 text-green-300" />
                )}
              </div>
              <p className="text-purple-200 mt-1">{vendor?.category || 'SaaS Vendor'}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="border-purple-300 text-purple-100">
                  {vendor?.subscription_tier?.toUpperCase() || 'FREE'} Plan
                </Badge>
                {badges.map((badge) => (
                  <Badge key={badge.id} variant="outline" className="border-green-300 text-green-100">
                    {badge.display_name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Link href={`/vendor/${vendorId}/profile`}>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-white/30 text-white">
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-white" />
                <p className="text-sm text-purple-200">PRISM Customers</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics?.total_customers || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-300" />
                <p className="text-sm text-purple-200">Hot Prospects</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics?.hot_prospects || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-300" />
                <p className="text-sm text-purple-200">Revenue in PRISM</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(metrics?.total_revenue_in_prism || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-yellow-300" />
                <p className="text-sm text-purple-200">Renewals (90d)</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics?.renewals_next_90_days || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-300" />
                <p className="text-sm text-purple-200">Avg Utilization</p>
              </div>
              <p className="text-2xl font-bold">{(metrics?.avg_license_utilization || 0).toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <p className="text-sm text-purple-200">At Risk</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics?.customers_at_risk || 0)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-prism-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Key actions to engage with customers and prospects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`/vendor/${vendorId}/customers`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 border-2"
              >
                <Users className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <p className="font-semibold">View Customers</p>
                  <p className="text-xs text-gray-500">{metrics?.total_customers || 0} companies</p>
                </div>
              </Button>
            </Link>

            <Link href={`/vendor/${vendorId}/prospects`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 border-2"
              >
                <Target className="w-6 h-6 text-orange-600" />
                <div className="text-center">
                  <p className="font-semibold">Discover Prospects</p>
                  <p className="text-xs text-gray-500">{metrics?.active_prospects || 0} signals</p>
                </div>
              </Button>
            </Link>

            <Link href={`/vendor/${vendorId}/campaigns`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-50 border-2"
              >
                <Megaphone className="w-6 h-6 text-purple-600" />
                <div className="text-center">
                  <p className="font-semibold">Run Campaign</p>
                  <p className="text-xs text-gray-500">{metrics?.active_campaigns || 0} active</p>
                </div>
              </Button>
            </Link>

            <Link href={`/vendor/${vendorId}/intelligence`}>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-50 border-2"
              >
                <LineChart className="w-6 h-6 text-green-600" />
                <div className="text-center">
                  <p className="font-semibold">Market Intelligence</p>
                  <p className="text-xs text-gray-500">Insights & trends</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ACTIVITY & PIPELINE */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Introduction Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Introduction Requests
            </CardTitle>
            <CardDescription>
              Warm introductions to qualified prospects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Pending Responses</p>
                    <p className="text-sm text-gray-500">Awaiting client approval</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics?.introductions_pending || 0}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Accepted</p>
                    <p className="text-sm text-gray-500">Ready to engage</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics?.introductions_accepted || 0}
                </div>
              </div>

              <Link href={`/vendor/${vendorId}/prospects`}>
                <Button className="w-full mt-2" variant="outline">
                  Request New Introduction <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Renewal Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Renewal Pipeline
            </CardTitle>
            <CardDescription>
              Upcoming customer renewals to manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium">Next 30 Days</p>
                    <p className="text-sm text-gray-500">Immediate attention</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {metrics?.renewals_next_30_days || 0}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Next 90 Days</p>
                    <p className="text-sm text-gray-500">Plan ahead</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics?.renewals_next_90_days || 0}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Pipeline Value</p>
                    <p className="text-sm text-gray-500">90-day opportunity</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics?.pipeline_value || 0)}
                </div>
              </div>

              <Link href={`/vendor/${vendorId}/customers`}>
                <Button className="w-full mt-2" variant="outline">
                  View All Renewals <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UPGRADE CTA - Show for non-enterprise tiers */}
      {vendor?.subscription_tier !== 'enterprise' && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">Unlock More Features</h3>
                <p className="text-indigo-700 mt-1">
                  Upgrade to Pro for prospect discovery, market intelligence, and unlimited introductions
                </p>
              </div>
              <Link href={`/vendor/${vendorId}/settings`}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
