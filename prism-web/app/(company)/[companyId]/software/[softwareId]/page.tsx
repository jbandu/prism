"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Building2,
  FileText,
  UserCog,
  BarChart3,
} from "lucide-react";
import type { Software } from "@/types";
import { StakeholdersSection } from "@/components/stakeholders/StakeholdersSection";

export default function SoftwareDetailPage({
  params,
}: {
  params: { companyId: string; softwareId: string };
}) {
  const router = useRouter();
  const [software, setSoftware] = useState<Software | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualCompanyId, setActualCompanyId] = useState<string>("");

  useEffect(() => {
    fetchSoftwareDetails();
  }, [params.softwareId]);

  const fetchSoftwareDetails = async () => {
    try {
      setLoading(true);

      // First, fetch company to get the actual ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;
        setActualCompanyId(companyId);

        // Fetch software details
        const response = await fetch(`/api/software/${params.softwareId}`);
        const result = await response.json();

        if (result.success) {
          setSoftware(result.data);
        } else {
          toast.error("Failed to load software details");
        }
      }
    } catch (error) {
      console.error("Error fetching software details:", error);
      toast.error("Failed to load software details");
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
      month: "long",
      day: "numeric",
      year: "numeric",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prism-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading software details...</p>
        </div>
      </div>
    );
  }

  if (!software) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Software Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The software you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const annualCost = parseFloat(software.total_annual_cost as any) || 0;
  const utilization = parseFloat(software.utilization_rate as any) || 0;
  const wasteAmount = parseFloat(software.waste_amount as any) || 0;
  const daysToRenewal = getDaysToRenewal(software.renewal_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-prism-dark">
              {software.software_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {software.vendor_name} • {software.category}
            </p>
          </div>
        </div>
        <Badge className={getStatusBadge(software.contract_status || "active")}>
          {(software.contract_status || "active").replace("_", " ")}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Annual Cost</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {formatCurrency(annualCost)}
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
                <p className="text-sm text-gray-600">Licenses</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {software.active_users} / {software.total_licenses}
                </p>
              </div>
              <Users className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {utilization.toFixed(0)}%
                </p>
              </div>
              <TrendingUp
                className={`w-8 h-8 ${
                  utilization >= 80
                    ? "text-green-600"
                    : utilization >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Renewal</p>
                <p
                  className={`text-2xl font-bold ${
                    daysToRenewal <= 30
                      ? "text-red-600"
                      : daysToRenewal <= 90
                      ? "text-yellow-600"
                      : "text-prism-dark"
                  }`}
                >
                  {daysToRenewal > 0 ? `${daysToRenewal}d` : "Expired"}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="stakeholders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stakeholders">
            <UserCog className="w-4 h-4 mr-2" />
            Stakeholders
          </TabsTrigger>
          <TabsTrigger value="overview">
            <Building2 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage">
            <BarChart3 className="w-4 h-4 mr-2" />
            Usage Analytics
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="w-4 h-4 mr-2" />
            Contracts
          </TabsTrigger>
        </TabsList>

        {/* Stakeholders Tab */}
        <TabsContent value="stakeholders" className="space-y-4">
          <StakeholdersSection
            softwareId={params.softwareId}
            companyId={actualCompanyId}
          />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Software Details</CardTitle>
              <CardDescription>
                Complete information about this software
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Software Name</p>
                  <p className="font-medium">{software.software_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vendor</p>
                  <p className="font-medium">{software.vendor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <Badge variant="outline">{software.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">License Type</p>
                  <p className="font-medium">{software.license_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Renewal Date</p>
                  <p className="font-medium">{formatDate(software.renewal_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Licenses</p>
                  <p className="font-medium">{software.total_licenses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="font-medium">{software.active_users}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Waste Amount</p>
                  <p className="font-medium text-red-600">
                    {wasteAmount > 0 ? formatCurrency(wasteAmount) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Analytics Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Coming soon - detailed usage metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Usage analytics will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>
                Coming soon - contract documents and terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Contract management will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
