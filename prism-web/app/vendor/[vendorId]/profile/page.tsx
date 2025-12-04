"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  BadgeCheck,
  Shield,
  Award,
  Save,
  Upload,
  Link as LinkIcon,
  Users,
  Briefcase
} from "lucide-react";
import { useParams } from "next/navigation";
import type { Vendor, VendorBadge, VendorCompanySize, VendorFundingStage } from "@/types/vendor";

export default function VendorProfile() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [badges, setBadges] = useState<VendorBadge[]>([]);
  const [formData, setFormData] = useState({
    vendor_name: "",
    description: "",
    category: "",
    company_size: "" as VendorCompanySize | "",
    founding_year: "",
    headquarters: "",
    funding_stage: "" as VendorFundingStage | "",
    funding_total: "",
    website_url: "",
    support_email: "",
    support_phone: "",
  });

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const v = result.data;
        setVendor(v);
        setFormData({
          vendor_name: v.vendor_name || "",
          description: v.description || "",
          category: v.category || "",
          company_size: v.company_size || "",
          founding_year: v.founding_year?.toString() || "",
          headquarters: v.headquarters || "",
          funding_stage: v.funding_stage || "",
          funding_total: v.funding_total?.toString() || "",
          website_url: v.website_url || "",
          support_email: v.support_email || "",
          support_phone: v.support_phone || "",
        });
      }

      // Fetch badges
      const badgesResponse = await fetch(`/api/vendors/${vendorId}/intelligence`);
      const badgesResult = await badgesResponse.json();
      if (badgesResult.success && badgesResult.data?.badges) {
        setBadges(badgesResult.data.badges);
      }
    } catch (error) {
      console.error("Error fetching vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_name: formData.vendor_name,
          description: formData.description,
          category: formData.category,
          company_size: formData.company_size || null,
          founding_year: formData.founding_year ? parseInt(formData.founding_year) : null,
          headquarters: formData.headquarters,
          funding_stage: formData.funding_stage || null,
          funding_total: formData.funding_total ? parseFloat(formData.funding_total) : null,
          website_url: formData.website_url,
          support_email: formData.support_email,
          support_phone: formData.support_phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVendor(result.data);
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
    } finally {
      setSaving(false);
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "prism_verified":
        return <BadgeCheck className="w-4 h-4" />;
      case "security_certified":
        return <Shield className="w-4 h-4" />;
      case "top_rated":
        return <Award className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your public profile in the PRISM marketplace
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* VERIFICATION STATUS & BADGES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-green-600" />
            Verification & Trust Badges
          </CardTitle>
          <CardDescription>
            Build trust with verified credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Verification Status */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {vendor?.verification_status === "verified" ? (
                <>
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">PRISM Verified</span>
                </>
              ) : (
                <>
                  <BadgeCheck className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Verification Pending</span>
                </>
              )}
            </div>

            {/* Earned Badges */}
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
              >
                {getBadgeIcon(badge.badge_type)}
                <span className="font-medium text-blue-700">{badge.display_name}</span>
              </div>
            ))}

            {badges.length === 0 && vendor?.verification_status !== "verified" && (
              <p className="text-gray-500 text-sm">
                Complete your profile and get verified to earn trust badges
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LOGO & BASIC INFO */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>Upload your company logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {vendor?.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.vendor_name}
                  className="w-32 h-32 rounded-lg object-contain bg-gray-50 p-4"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Company Name</label>
              <Input
                value={formData.vendor_name}
                onChange={(e) =>
                  setFormData({ ...formData, vendor_name: e.target.value })
                }
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tell potential customers about your company..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., CRM, Project Management"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company Size</label>
                <Select
                  value={formData.company_size}
                  onValueChange={(value: VendorCompanySize) =>
                    setFormData({ ...formData, company_size: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-10)</SelectItem>
                    <SelectItem value="small">Small (11-50)</SelectItem>
                    <SelectItem value="medium">Medium (51-200)</SelectItem>
                    <SelectItem value="large">Large (201-1000)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COMPANY DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Company Details
          </CardTitle>
          <CardDescription>
            Additional information about your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Founded Year
                </label>
                <Input
                  type="number"
                  value={formData.founding_year}
                  onChange={(e) =>
                    setFormData({ ...formData, founding_year: e.target.value })
                  }
                  placeholder="e.g., 2015"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Headquarters
                </label>
                <Input
                  value={formData.headquarters}
                  onChange={(e) =>
                    setFormData({ ...formData, headquarters: e.target.value })
                  }
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  Funding Stage
                </label>
                <Select
                  value={formData.funding_stage}
                  onValueChange={(value: VendorFundingStage) =>
                    setFormData({ ...formData, funding_stage: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series_a">Series A</SelectItem>
                    <SelectItem value="series_b">Series B</SelectItem>
                    <SelectItem value="series_c">Series C+</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  Total Funding ($)
                </label>
                <Input
                  type="number"
                  value={formData.funding_total}
                  onChange={(e) =>
                    setFormData({ ...formData, funding_total: e.target.value })
                  }
                  placeholder="e.g., 50000000"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONTACT INFO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            Contact Information
          </CardTitle>
          <CardDescription>
            How customers can reach you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Website
              </label>
              <Input
                type="url"
                value={formData.website_url}
                onChange={(e) =>
                  setFormData({ ...formData, website_url: e.target.value })
                }
                placeholder="https://yourcompany.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Support Email
              </label>
              <Input
                type="email"
                value={formData.support_email}
                onChange={(e) =>
                  setFormData({ ...formData, support_email: e.target.value })
                }
                placeholder="support@yourcompany.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Support Phone
              </label>
              <Input
                type="tel"
                value={formData.support_phone}
                onChange={(e) =>
                  setFormData({ ...formData, support_phone: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PROFILE COMPLETENESS */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Profile Completeness</h3>
              <p className="text-blue-700 mt-1">
                Complete your profile to improve visibility in the marketplace
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {calculateCompleteness(formData)}%
              </p>
              <p className="text-sm text-blue-500">Complete</p>
            </div>
          </div>
          <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${calculateCompleteness(formData)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateCompleteness(data: any): number {
  const fields = [
    "vendor_name",
    "description",
    "category",
    "company_size",
    "founding_year",
    "headquarters",
    "website_url",
    "support_email",
  ];
  const filled = fields.filter((f) => data[f] && data[f].toString().trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}
