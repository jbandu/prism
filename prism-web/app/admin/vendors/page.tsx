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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Search,
  Plus,
  BadgeCheck,
  Clock,
  XCircle,
  Users,
  DollarSign,
  Building2,
  ExternalLink,
  MoreVertical,
  RefreshCw,
  Crown,
  Filter
} from "lucide-react";
import Link from "next/link";
import type { Vendor, VendorSubscriptionTier, VendorVerificationStatus } from "@/types/vendor";

const verificationStatusConfig: Record<
  VendorVerificationStatus,
  { label: string; color: string; icon: any }
> = {
  verified: { label: "Verified", color: "bg-green-500", icon: BadgeCheck },
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
};

const subscriptionTierConfig: Record<
  VendorSubscriptionTier,
  { label: string; color: string }
> = {
  free: { label: "Free", color: "bg-gray-500" },
  growth: { label: "Growth", color: "bg-blue-500" },
  pro: { label: "Pro", color: "bg-purple-500" },
  enterprise: { label: "Enterprise", color: "bg-yellow-500" },
};

export default function AdminVendors() {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newVendor, setNewVendor] = useState({
    vendor_name: "",
    domain: "",
    category: "",
    description: "",
    website_url: "",
    support_email: "",
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vendors");
      const result = await response.json();

      if (result.success) {
        setVendors(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async () => {
    try {
      setCreating(true);
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVendor),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateDialog(false);
        setNewVendor({
          vendor_name: "",
          domain: "",
          category: "",
          description: "",
          website_url: "",
          support_email: "",
        });
        fetchVendors();
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
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

  const filteredVendors = vendors
    .filter((v) => {
      if (searchQuery) {
        return (
          v.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    })
    .filter((v) => {
      if (verificationFilter !== "all") {
        return v.verification_status === verificationFilter;
      }
      return true;
    })
    .filter((v) => {
      if (tierFilter !== "all") {
        return v.subscription_tier === tierFilter;
      }
      return true;
    })
    .sort((a, b) => a.vendor_name.localeCompare(b.vendor_name));

  // Calculate summary stats
  const totalVendors = vendors.length;
  const verifiedVendors = vendors.filter((v) => v.verification_status === "verified").length;
  const paidVendors = vendors.filter((v) => v.subscription_tier !== "free").length;
  const totalRevenue = vendors.reduce((sum, v) => sum + (Number(v.total_revenue_in_prism) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Store className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Manage SaaS vendors in the PRISM marketplace
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchVendors} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Create a new vendor profile in the marketplace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Vendor Name *</label>
                  <Input
                    placeholder="e.g., Salesforce"
                    value={newVendor.vendor_name}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, vendor_name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Domain</label>
                    <Input
                      placeholder="salesforce.com"
                      value={newVendor.domain}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, domain: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Input
                      placeholder="e.g., CRM"
                      value={newVendor.category}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, category: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Brief description of the vendor..."
                    value={newVendor.description}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Website</label>
                    <Input
                      placeholder="https://salesforce.com"
                      value={newVendor.website_url}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, website_url: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Support Email</label>
                    <Input
                      placeholder="support@salesforce.com"
                      value={newVendor.support_email}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, support_email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateVendor}
                  disabled={!newVendor.vendor_name || creating}
                >
                  {creating ? "Creating..." : "Create Vendor"}
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
              <Store className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Total Vendors</p>
            </div>
            <p className="text-3xl font-bold">{totalVendors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Verified</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{verifiedVendors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500">Paid Subscribers</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{paidVendors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Total Platform Revenue</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
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
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[180px]">
                <BadgeCheck className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[180px]">
                <Crown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* VENDORS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>
            Manage vendor profiles and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600 mb-4">
                {vendors.length === 0
                  ? "Add your first vendor to the marketplace"
                  : "No vendors match your filters"}
              </p>
              {vendors.length === 0 && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>PRISM Customers</TableHead>
                  <TableHead>Platform Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => {
                  const statusConfig = verificationStatusConfig[vendor.verification_status];
                  const StatusIcon = statusConfig?.icon || Clock;
                  const tierConfig = subscriptionTierConfig[vendor.subscription_tier];

                  return (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {vendor.logo_url ? (
                            <img
                              src={vendor.logo_url}
                              alt={vendor.vendor_name}
                              className="w-10 h-10 rounded-lg object-contain bg-gray-50"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{vendor.vendor_name}</p>
                            {vendor.domain && (
                              <p className="text-xs text-gray-500">{vendor.domain}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category || "Uncategorized"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig?.color || "bg-gray-500"}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig?.label || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={tierConfig?.color || "bg-gray-500"}>
                          {tierConfig?.label || vendor.subscription_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          {vendor.total_prism_customers || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(vendor.total_revenue_in_prism)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/vendor/${vendor.slug || vendor.id}/overview`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Portal
                          </Button>
                        </Link>
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
