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
  Target,
  Search,
  Flame,
  TrendingUp,
  Clock,
  Building2,
  Filter,
  MessageSquare,
  Zap,
  Eye,
  Calendar,
  Users,
  RefreshCw
} from "lucide-react";
import { useParams } from "next/navigation";
import type { ProspectWithCompany, SignalType } from "@/types/vendor";

interface ProspectSummary {
  total: number;
  hot: number;
  warm: number;
  cool: number;
  by_signal_type: Record<string, number>;
}

const signalTypeLabels: Record<SignalType, { label: string; description: string; icon: any }> = {
  active_evaluator: {
    label: "Active Evaluator",
    description: "Currently evaluating alternatives in your category",
    icon: Search,
  },
  competitor_churn_risk: {
    label: "Competitor Churn Risk",
    description: "High churn risk with a competitor's product",
    icon: TrendingUp,
  },
  renewal_window: {
    label: "Renewal Window",
    description: "Competitor contract renewing soon",
    icon: Calendar,
  },
  category_interest: {
    label: "Category Interest",
    description: "Viewed your category in software catalog",
    icon: Eye,
  },
  icp_match: {
    label: "ICP Match",
    description: "Matches your ideal customer profile",
    icon: Users,
  },
};

export default function VendorProspects() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(true);
  const [prospects, setProspects] = useState<ProspectWithCompany[]>([]);
  const [summary, setSummary] = useState<ProspectSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [signalFilter, setSignalFilter] = useState<string>("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [selectedProspect, setSelectedProspect] = useState<ProspectWithCompany | null>(null);
  const [introMessage, setIntroMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProspects();
  }, [vendorId]);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}/prospects`);
      const result = await response.json();

      if (result.success && result.data) {
        setProspects(result.data.prospects || []);
        setSummary(result.data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestIntro = async () => {
    if (!selectedProspect || !introMessage) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/vendors/${vendorId}/prospects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: selectedProspect.company_id,
          message: introMessage,
          signal_id: selectedProspect.id,
          request_type: "introduction",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSelectedProspect(null);
        setIntroMessage("");
        fetchProspects();
      }
    } catch (error) {
      console.error("Error requesting introduction:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getIntentBadge = (score: number) => {
    if (score >= 90) {
      return (
        <Badge className="bg-red-500">
          <Flame className="w-3 h-3 mr-1" />
          Hot
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge className="bg-orange-500">
          <TrendingUp className="w-3 h-3 mr-1" />
          Warm
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500">
        <Clock className="w-3 h-3 mr-1" />
        Cool
      </Badge>
    );
  };

  const filteredProspects = prospects
    .filter((p) => {
      if (searchQuery) {
        return p.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter((p) => {
      if (signalFilter !== "all") {
        return p.signal_type === signalFilter;
      }
      return true;
    })
    .filter((p) => {
      if (intentFilter === "hot") return p.intent_score >= 90;
      if (intentFilter === "warm") return p.intent_score >= 60 && p.intent_score < 90;
      if (intentFilter === "cool") return p.intent_score < 60;
      return true;
    })
    .sort((a, b) => b.intent_score - a.intent_score);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading prospects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospect Discovery</h1>
          <p className="text-gray-600 mt-1">
            Companies actively evaluating software in your category
          </p>
        </div>
        <Button onClick={fetchProspects} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Signals
        </Button>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-500">Total Prospects</p>
            </div>
            <p className="text-3xl font-bold">{summary?.total || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">Hot (90+)</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{summary?.hot || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-700">Warm (60-89)</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">{summary?.warm || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700">Cool (30-59)</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{summary?.cool || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* SIGNAL TYPE BREAKDOWN */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(signalTypeLabels).map(([type, config]) => {
          const Icon = config.icon;
          const count = summary?.by_signal_type?.[type] || 0;
          return (
            <Card
              key={type}
              className={`cursor-pointer transition-all ${
                signalFilter === type ? "ring-2 ring-prism-primary" : ""
              }`}
              onClick={() => setSignalFilter(signalFilter === type ? "all" : type)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500">{config.label}</p>
                </div>
                <p className="text-xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={intentFilter} onValueChange={setIntentFilter}>
              <SelectTrigger className="w-[180px]">
                <Zap className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Intent Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intents</SelectItem>
                <SelectItem value="hot">Hot Only</SelectItem>
                <SelectItem value="warm">Warm Only</SelectItem>
                <SelectItem value="cool">Cool Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={signalFilter} onValueChange={setSignalFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Signal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signals</SelectItem>
                {Object.entries(signalTypeLabels).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PROSPECTS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Active Prospects</CardTitle>
          <CardDescription>
            High-intent companies ready for outreach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProspects.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No prospects found</h3>
              <p className="text-gray-600">
                {prospects.length === 0
                  ? "No active signals detected yet"
                  : "No prospects match your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Signal Type</TableHead>
                  <TableHead>Intent Score</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProspects.map((prospect) => {
                  const signalConfig = signalTypeLabels[prospect.signal_type];
                  const SignalIcon = signalConfig?.icon || Target;
                  return (
                    <TableRow key={prospect.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <span className="font-medium">{prospect.company_name}</span>
                            {prospect.employee_count && (
                              <p className="text-xs text-gray-500">
                                {prospect.employee_count.toLocaleString()} employees
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{prospect.industry || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <SignalIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{signalConfig?.label || prospect.signal_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                prospect.intent_score >= 90
                                  ? "bg-red-500"
                                  : prospect.intent_score >= 60
                                  ? "bg-orange-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${prospect.intent_score}%` }}
                            />
                          </div>
                          {getIntentBadge(prospect.intent_score)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(prospect.detected_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProspect(prospect)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Request Intro
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Introduction</DialogTitle>
                              <DialogDescription>
                                Send a personalized message to request an introduction to{" "}
                                {prospect.company_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <p className="text-sm font-medium mb-2">Company</p>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                  <Building2 className="w-5 h-5 text-gray-500" />
                                  <span className="font-medium">{prospect.company_name}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Signal</p>
                                <div className="flex items-center gap-2">
                                  {getIntentBadge(prospect.intent_score)}
                                  <span className="text-sm text-gray-600">
                                    {signalConfig?.description}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Your Message</p>
                                <Textarea
                                  placeholder="Write a personalized message explaining why you'd like to connect..."
                                  value={introMessage}
                                  onChange={(e) => setIntroMessage(e.target.value)}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedProspect(null);
                                  setIntroMessage("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleRequestIntro}
                                disabled={!introMessage || submitting}
                              >
                                {submitting ? "Sending..." : "Send Request"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
