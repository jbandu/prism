"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  Bell,
  FileText,
  User,
  Upload,
  MessageSquare,
  X,
  Check,
  MinusCircle,
  RefreshCw,
  Users,
  BarChart3,
  Info,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface RenewalSoftware {
  id: string;
  software_name: string;
  vendor_name: string;
  renewal_date: Date;
  contract_end_date: Date;
  total_annual_cost: number | string;
  utilization_rate: number | string;
  active_users: number;
  total_licenses: number;
  waste_amount: number | string;
  contract_status: string;
  auto_renewal: boolean;
  notice_period_days: number;
  cost_per_user?: number | string;
  contract_start_date?: Date;
}

export default function RenewalsPage({
  params,
}: {
  params: { companyId: string };
}) {
  const [renewals, setRenewals] = useState<RenewalSoftware[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"30" | "60" | "90" | "all">("90");
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalSoftware | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [actionDecision, setActionDecision] = useState<"renew" | "renegotiate" | "cancel" | null>(null);

  useEffect(() => {
    fetchRenewals();
  }, [params.companyId]);

  const fetchRenewals = async () => {
    try {
      setLoading(true);

      // Fetch company to get ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;

        // Fetch all software for this company
        const softwareResponse = await fetch(`/api/software?companyId=${companyId}`);
        const softwareResult = await softwareResponse.json();

        if (softwareResult.success) {
          setRenewals(softwareResult.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching renewals:", error);
      toast.error("Failed to load renewal data");
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

  const getRenewalUrgency = (daysToRenewal: number) => {
    if (daysToRenewal < 0) return { color: "bg-red-100 text-red-700", label: "Expired", icon: AlertTriangle };
    if (daysToRenewal <= 30) return { color: "bg-red-100 text-red-700", label: "Critical", icon: AlertTriangle };
    if (daysToRenewal <= 60) return { color: "bg-yellow-100 text-yellow-700", label: "Urgent", icon: Clock };
    if (daysToRenewal <= 90) return { color: "bg-blue-100 text-blue-700", label: "Soon", icon: Bell };
    return { color: "bg-gray-100 text-gray-700", label: "Scheduled", icon: Calendar };
  };

  const getRecommendation = (utilization: number, waste: number, annualCost: number) => {
    if (utilization < 30) return {
      action: "Cancel",
      color: "text-red-600",
      icon: X,
      reason: "Very low utilization - consider canceling",
      details: "Less than 30% of licenses are being used. This suggests the software may not be essential to operations.",
      savings: annualCost
    };
    if (utilization < 50) return {
      action: "Renegotiate",
      color: "text-yellow-600",
      icon: RefreshCw,
      reason: "Low utilization - renegotiate for fewer licenses",
      details: "Usage is below 50%. Negotiate to reduce license count and save on unused capacity.",
      savings: waste
    };
    if (waste > 50000) return {
      action: "Optimize",
      color: "text-yellow-600",
      icon: TrendingDown,
      reason: "High waste - optimize license count",
      details: `Currently wasting ${formatCurrency(waste)} on unused licenses. Right-size your subscription.`,
      savings: waste
    };
    return {
      action: "Renew",
      color: "text-green-600",
      icon: Check,
      reason: "Good utilization - proceed with renewal",
      details: "Software is being utilized effectively. Consider negotiating for better rates or multi-year discounts.",
      savings: 0
    };
  };

  const openActionDialog = (renewal: RenewalSoftware) => {
    setSelectedRenewal(renewal);
    setShowActionDialog(true);
    setActionNotes("");
    setActionDecision(null);
  };

  const handleActionSubmit = () => {
    if (!actionDecision) {
      toast.error("Please select an action");
      return;
    }

    // In a real app, this would save to the database
    toast.success(`Action recorded: ${actionDecision}`, {
      description: `Your decision to ${actionDecision} ${selectedRenewal?.software_name} has been saved.`
    });

    setShowActionDialog(false);
    setSelectedRenewal(null);
    setActionNotes("");
    setActionDecision(null);
  };

  // Filter renewals by time period
  const filteredRenewals = renewals
    .map(r => ({
      ...r,
      daysToRenewal: getDaysToRenewal(r.renewal_date)
    }))
    .filter(r => {
      if (timeFilter === "all") return true;
      const days = parseInt(timeFilter);
      return r.daysToRenewal <= days && r.daysToRenewal >= 0;
    })
    .sort((a, b) => a.daysToRenewal - b.daysToRenewal);

  // Calculate summary metrics
  const totalRenewalValue = filteredRenewals.reduce((sum, r) =>
    sum + (parseFloat(r.total_annual_cost as any) || 0), 0
  );
  const criticalRenewals = filteredRenewals.filter(r => r.daysToRenewal <= 30).length;
  const potentialSavings = filteredRenewals.reduce((sum, r) =>
    sum + (parseFloat(r.waste_amount as any) || 0), 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading renewals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Contract Renewals</h1>
          <p className="text-gray-600 mt-2">
            Manage upcoming renewals and negotiation strategies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Export functionality coming soon!")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => toast.info("Reminder settings coming soon!")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Set Reminders
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Renewals</p>
                <p className="text-2xl font-bold text-prism-dark">{filteredRenewals.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-prism-dark">
                  {formatCurrency(totalRenewalValue)}
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
                <p className="text-sm text-gray-600">Critical (≤30 days)</p>
                <p className="text-2xl font-bold text-red-600">{criticalRenewals}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(potentialSavings)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 mr-4">Show renewals in:</span>
            <div className="flex gap-2">
              <Button
                variant={timeFilter === "30" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("30")}
              >
                30 days
              </Button>
              <Button
                variant={timeFilter === "60" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("60")}
              >
                60 days
              </Button>
              <Button
                variant={timeFilter === "90" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("90")}
              >
                90 days
              </Button>
              <Button
                variant={timeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("all")}
              >
                All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals ({filteredRenewals.length})</CardTitle>
          <CardDescription>
            Contracts requiring action in the next {timeFilter === "all" ? "year" : `${timeFilter} days`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRenewals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No renewals in this time period</p>
              <p className="text-sm text-gray-400">
                Try adjusting your filter to see more renewals
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Annual Cost</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Waste</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRenewals.map((item) => {
                    const urgency = getRenewalUrgency(item.daysToRenewal);
                    const UrgencyIcon = urgency.icon;
                    const utilization = parseFloat(item.utilization_rate as any) || 0;
                    const waste = parseFloat(item.waste_amount as any) || 0;
                    const annualCost = parseFloat(item.total_annual_cost as any) || 0;
                    const recommendation = getRecommendation(utilization, waste, annualCost);

                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{item.software_name}</p>
                            <p className="text-sm text-gray-500">{item.vendor_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{formatDate(item.renewal_date)}</p>
                            {item.auto_renewal && (
                              <Badge variant="outline" className="mt-1">
                                Auto-renews
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={urgency.color}>
                            <UrgencyIcon className="w-3 h-3 mr-1" />
                            {item.daysToRenewal > 0
                              ? `${item.daysToRenewal} days`
                              : "Expired"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">{formatCurrency(annualCost)}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{utilization.toFixed(0)}%</p>
                            <p className="text-xs text-gray-500">
                              {item.active_users} / {item.total_licenses} licenses
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {waste > 0 ? (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(waste)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`font-semibold ${recommendation.color}`}>
                              {recommendation.action}
                            </p>
                            <p className="text-xs text-gray-500">{recommendation.reason}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog(item)}
                          >
                            Take Action
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

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Renewal Action: {selectedRenewal?.software_name}</DialogTitle>
            <DialogDescription>
              Review details and decide on the best course of action for this renewal
            </DialogDescription>
          </DialogHeader>

          {selectedRenewal && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="action">Take Action</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Contract Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vendor:</span>
                        <span className="text-sm font-medium">{selectedRenewal.vendor_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Renewal Date:</span>
                        <span className="text-sm font-medium">{formatDate(selectedRenewal.renewal_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Days Remaining:</span>
                        <Badge className={getRenewalUrgency(getDaysToRenewal(selectedRenewal.renewal_date)).color}>
                          {getDaysToRenewal(selectedRenewal.renewal_date)} days
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Auto-Renewal:</span>
                        <span className="text-sm font-medium">{selectedRenewal.auto_renewal ? "Yes" : "No"}</span>
                      </div>
                      {selectedRenewal.notice_period_days && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Notice Period:</span>
                          <span className="text-sm font-medium">{selectedRenewal.notice_period_days} days</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Cost Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Annual Cost:</span>
                        <span className="text-sm font-medium">{formatCurrency(parseFloat(selectedRenewal.total_annual_cost as any))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cost per User:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency((parseFloat(selectedRenewal.total_annual_cost as any) || 0) / selectedRenewal.total_licenses)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Licenses:</span>
                        <span className="text-sm font-medium">{selectedRenewal.total_licenses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Users:</span>
                        <span className="text-sm font-medium">{selectedRenewal.active_users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Annual Waste:</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(parseFloat(selectedRenewal.waste_amount as any) || 0)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Utilization Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">License Utilization</span>
                          <span className="text-sm font-medium">{(parseFloat(selectedRenewal.utilization_rate as any) || 0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              (parseFloat(selectedRenewal.utilization_rate as any) || 0) >= 80
                                ? "bg-green-500"
                                : (parseFloat(selectedRenewal.utilization_rate as any) || 0) >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(parseFloat(selectedRenewal.utilization_rate as any) || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{selectedRenewal.active_users} active users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MinusCircle className="w-4 h-4 text-gray-400" />
                          <span>{selectedRenewal.total_licenses - selectedRenewal.active_users} unused licenses</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-4">
                {(() => {
                  const utilization = parseFloat(selectedRenewal.utilization_rate as any) || 0;
                  const waste = parseFloat(selectedRenewal.waste_amount as any) || 0;
                  const annualCost = parseFloat(selectedRenewal.total_annual_cost as any) || 0;
                  const recommendation = getRecommendation(utilization, waste, annualCost);
                  const RecommendIcon = recommendation.icon;

                  return (
                    <>
                      <Card className="border-2 border-prism-primary">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-prism-primary" />
                            AI Recommendation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${recommendation.color === "text-green-600" ? "bg-green-100" : recommendation.color === "text-red-600" ? "bg-red-100" : "bg-yellow-100"}`}>
                              <RecommendIcon className={`w-6 h-6 ${recommendation.color}`} />
                            </div>
                            <div>
                              <h3 className={`text-xl font-bold ${recommendation.color}`}>{recommendation.action}</h3>
                              <p className="text-sm text-gray-600">{recommendation.reason}</p>
                            </div>
                          </div>
                          <p className="text-gray-700">{recommendation.details}</p>
                          {recommendation.savings > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-900">Potential Annual Savings</p>
                                  <p className="text-2xl font-bold text-green-600">{formatCurrency(recommendation.savings)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Cost Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Annual Cost:</span>
                              <span className="font-medium">{formatCurrency(annualCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cost for Active Users:</span>
                              <span className="font-medium">
                                {formatCurrency(annualCost * (utilization / 100))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Wasted on Unused:</span>
                              <span className="font-medium text-red-600">{formatCurrency(waste)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-600">Optimized Cost:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(annualCost - waste)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Usage Insights</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Utilization Rate</p>
                                <p className="text-gray-600">{utilization.toFixed(1)}% of licenses are actively used</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Unused Capacity</p>
                                <p className="text-gray-600">{selectedRenewal.total_licenses - selectedRenewal.active_users} licenses available to reassign</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-blue-900 mb-2">Negotiation Tips</h4>
                          <ul className="space-y-1 text-sm text-blue-800">
                            <li>• Request multi-year discount (typically 10-15% off)</li>
                            <li>• Ask for volume pricing if you&apos;re a large customer</li>
                            <li>• Request free training or support upgrades</li>
                            <li>• Negotiate flexible licensing (seasonal adjustments)</li>
                            <li>• Compare with alternative solutions for leverage</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </TabsContent>

              {/* Action Tab */}
              <TabsContent value="action" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Your Action</CardTitle>
                    <CardDescription>Choose how you want to proceed with this renewal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={actionDecision === "renew" ? "default" : "outline"}
                        className="h-24 flex-col gap-2"
                        onClick={() => setActionDecision("renew")}
                      >
                        <Check className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-semibold">Renew</div>
                          <div className="text-xs">Proceed with current terms</div>
                        </div>
                      </Button>

                      <Button
                        variant={actionDecision === "renegotiate" ? "default" : "outline"}
                        className="h-24 flex-col gap-2"
                        onClick={() => setActionDecision("renegotiate")}
                      >
                        <RefreshCw className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-semibold">Renegotiate</div>
                          <div className="text-xs">Negotiate better terms</div>
                        </div>
                      </Button>

                      <Button
                        variant={actionDecision === "cancel" ? "default" : "outline"}
                        className="h-24 flex-col gap-2"
                        onClick={() => setActionDecision("cancel")}
                      >
                        <X className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-semibold">Cancel</div>
                          <div className="text-xs">Do not renew</div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2"
                        onClick={() => toast.info("Meeting scheduling coming soon!")}
                      >
                        <Calendar className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-semibold">Schedule Meeting</div>
                          <div className="text-xs">Discuss with vendor</div>
                        </div>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Action Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about your decision, negotiation points, or next steps..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Upload Contract Documents</p>
                      <p className="text-xs text-gray-500">Drag and drop files or click to browse</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.info("File upload coming soon!")}>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1"
                        onClick={handleActionSubmit}
                        disabled={!actionDecision}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Save Action
                      </Button>
                      <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-yellow-900 mb-1">Important Reminders</p>
                        <ul className="text-yellow-800 space-y-1">
                          <li>• Check notice period requirements before canceling</li>
                          <li>• Document all vendor communications</li>
                          <li>• Get renewal quotes in writing</li>
                          <li>• Review alternative solutions before committing</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
