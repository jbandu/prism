"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Megaphone,
  Plus,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Pause,
  Play,
  BarChart3,
  Eye,
  MousePointer,
  CheckCircle,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useParams } from "next/navigation";
import type { VendorCampaign, CampaignType } from "@/types/vendor";

interface CampaignSummary {
  total: number;
  active: number;
  draft: number;
  completed: number;
  total_spent: number;
  total_leads: number;
  total_conversions: number;
}

const campaignTypeLabels: Record<CampaignType, { label: string; color: string }> = {
  competitive_displacement: { label: "Competitive Displacement", color: "bg-red-500" },
  renewal_retention: { label: "Renewal Retention", color: "bg-blue-500" },
  category_promotion: { label: "Category Promotion", color: "bg-purple-500" },
  rfp_response: { label: "RFP Response", color: "bg-green-500" },
  expansion_upsell: { label: "Expansion Upsell", color: "bg-orange-500" },
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  pending_review: "bg-yellow-500",
  active: "bg-green-500",
  paused: "bg-orange-500",
  completed: "bg-blue-500",
  rejected: "bg-red-500",
};

export default function VendorCampaigns() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<VendorCampaign[]>([]);
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    campaign_name: "",
    campaign_type: "category_promotion" as CampaignType,
    description: "",
    budget_total: "",
    discount_percentage: "",
    promo_code: "",
  });

  useEffect(() => {
    fetchCampaigns();
  }, [vendorId]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}/campaigns`);
      const result = await response.json();

      if (result.success && result.data) {
        setCampaigns(result.data.campaigns || []);
        setSummary(result.data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      setCreating(true);
      const response = await fetch(`/api/vendors/${vendorId}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: newCampaign.campaign_name,
          campaign_type: newCampaign.campaign_type,
          description: newCampaign.description,
          budget_total: newCampaign.budget_total ? parseFloat(newCampaign.budget_total) : null,
          offer_details: {
            discount_percentage: newCampaign.discount_percentage
              ? parseFloat(newCampaign.discount_percentage)
              : null,
            promo_code: newCampaign.promo_code || null,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateDialog(false);
        setNewCampaign({
          campaign_name: "",
          campaign_type: "category_promotion",
          description: "",
          budget_total: "",
          discount_percentage: "",
          promo_code: "",
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!num) return "$0";
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatNumber = (value: number | undefined) => {
    if (!value) return "0";
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Megaphone className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offers & Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Create targeted promotions to reach prospects
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCampaigns} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a targeted campaign to reach qualified prospects
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Campaign Name</label>
                  <Input
                    placeholder="e.g., Q1 Competitive Offer"
                    value={newCampaign.campaign_name}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, campaign_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Campaign Type</label>
                  <Select
                    value={newCampaign.campaign_type}
                    onValueChange={(value: CampaignType) =>
                      setNewCampaign({ ...newCampaign, campaign_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(campaignTypeLabels).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your campaign goals..."
                    value={newCampaign.description}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Budget ($)</label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={newCampaign.budget_total}
                      onChange={(e) =>
                        setNewCampaign({ ...newCampaign, budget_total: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Discount (%)</label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={newCampaign.discount_percentage}
                      onChange={(e) =>
                        setNewCampaign({ ...newCampaign, discount_percentage: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Promo Code (Optional)</label>
                  <Input
                    placeholder="e.g., SWITCH20"
                    value={newCampaign.promo_code}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, promo_code: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.campaign_name || creating}
                >
                  {creating ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500">Active Campaigns</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{summary?.active || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Total Impressions</p>
            </div>
            <p className="text-3xl font-bold">
              {formatNumber(
                campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-500">Leads Generated</p>
            </div>
            <p className="text-3xl font-bold">{summary?.total_leads || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary?.total_spent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* CAMPAIGNS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Manage your marketing campaigns and track performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first campaign to start reaching prospects
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const typeConfig = campaignTypeLabels[campaign.campaign_type];
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{campaign.campaign_name}</span>
                          {campaign.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {campaign.description.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeConfig?.color || "bg-gray-500"}>
                          {typeConfig?.label || campaign.campaign_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status] || "bg-gray-500"}>
                          {campaign.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          {formatNumber(campaign.impressions)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-4 h-4 text-gray-400" />
                          {formatNumber(campaign.clicks)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          {formatNumber(campaign.leads_generated)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm">
                            {formatCurrency(campaign.budget_spent)} / {formatCurrency(campaign.budget_total)}
                          </span>
                          {campaign.budget_total && (
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((Number(campaign.budget_spent) || 0) /
                                      Number(campaign.budget_total)) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.status === "active" ? (
                          <Button variant="ghost" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : campaign.status === "paused" ? (
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
