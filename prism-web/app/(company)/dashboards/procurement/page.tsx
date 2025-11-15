"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Target,
  TrendingDown,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Award,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
  ArrowRight,
} from "lucide-react";

// Procurement Dashboard Data
const PROCUREMENT_DATA = {
  negotiationOpportunities: [
    {
      vendor: "Salesforce",
      currentAnnual: 2100000,
      marketRate: 1875000,
      potentialSavings: 225000,
      savingsPercent: 10.7,
      priority: "critical",
      renewalDays: 45,
      leverage: "High - Usage data shows 23% unused licenses",
      recommendation: "Negotiate volume discount and remove unused seats",
    },
    {
      vendor: "AWS",
      currentAnnual: 1500000,
      marketRate: 1230000,
      potentialSavings: 270000,
      savingsPercent: 18.0,
      priority: "high",
      renewalDays: 30,
      leverage: "Medium - Can leverage committed spend for reserved instances",
      recommendation: "Switch to 1-year reserved instances + committed use discount",
    },
    {
      vendor: "Adobe Creative Cloud",
      currentAnnual: 540000,
      marketRate: 410000,
      potentialSavings: 130000,
      savingsPercent: 24.1,
      priority: "high",
      renewalDays: 60,
      leverage: "High - 45% utilization, many inactive users",
      recommendation: "Right-size licenses from 156 to 89 active users",
    },
    {
      vendor: "Slack",
      currentAnnual: 720000,
      marketRate: 0,
      potentialSavings: 720000,
      savingsPercent: 100,
      priority: "medium",
      renewalDays: 180,
      leverage: "High - Microsoft Teams included in M365",
      recommendation: "Consolidate to Microsoft Teams to eliminate cost",
    },
    {
      vendor: "ServiceNow",
      currentAnnual: 980000,
      marketRate: 865000,
      potentialSavings: 115000,
      savingsPercent: 11.7,
      priority: "medium",
      renewalDays: 120,
      leverage: "Medium - Good performance, but pricing above market",
      recommendation: "Renegotiate based on enterprise tier pricing",
    },
  ],
  vendorScorecard: {
    salesforce: {
      overall: 78,
      performance: 92,
      costEfficiency: 65,
      support: 88,
      innovation: 81,
      reliability: 96,
      contractTerms: 58,
      details: {
        strengths: ["Excellent reliability", "Strong feature set", "Good support response time"],
        concerns: ["High cost per user", "Unused license waste", "Inflexible contract terms"],
        recommendations: ["Renegotiate volume pricing", "Implement license optimization", "Request flexible scaling"],
      },
    },
    aws: {
      overall: 82,
      performance: 95,
      costEfficiency: 68,
      support: 79,
      innovation: 93,
      reliability: 98,
      contractTerms: 72,
      details: {
        strengths: ["Best-in-class reliability", "Comprehensive service catalog", "Strong innovation"],
        concerns: ["Over-provisioning issues", "Complex pricing model", "Suboptimal contract structure"],
        recommendations: ["Move to reserved instances", "Implement auto-scaling", "Consolidate accounts"],
      },
    },
    microsoft: {
      overall: 88,
      performance: 90,
      costEfficiency: 91,
      support: 85,
      innovation: 84,
      reliability: 94,
      contractTerms: 89,
      details: {
        strengths: ["Excellent value for money", "Bundled services", "Good contract flexibility"],
        concerns: ["Some services underutilized", "Complex licensing model"],
        recommendations: ["Maximize bundle usage", "Evaluate Teams vs Slack", "Consider consolidation opportunities"],
      },
    },
  },
  contractTimeline: [
    { vendor: "AWS", renewalDate: "2025-12-15", daysUntil: 30, value: 1500000, status: "critical", phase: "negotiation" },
    { vendor: "Salesforce", renewalDate: "2025-12-30", daysUntil: 45, value: 2100000, status: "critical", phase: "preparation" },
    { vendor: "Adobe CC", renewalDate: "2026-01-14", daysUntil: 60, value: 540000, status: "warning", phase: "analysis" },
    { vendor: "Zoom", renewalDate: "2026-02-22", daysUntil: 90, value: 650000, status: "warning", phase: "monitoring" },
    { vendor: "ServiceNow", renewalDate: "2026-03-25", daysUntil: 120, value: 980000, status: "normal", phase: "monitoring" },
    { vendor: "Slack", renewalDate: "2026-06-13", daysUntil: 180, value: 720000, status: "normal", phase: "planning" },
  ],
};

export default function ProcurementDashboard() {
  const [selectedVendor, setSelectedVendor] = useState<string>("salesforce");

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-600">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-600">Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getTimelineStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "normal":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const totalSavingsOpportunity = PROCUREMENT_DATA.negotiationOpportunities.reduce(
    (sum, opp) => sum + opp.potentialSavings,
    0
  );

  const vendorData =
    PROCUREMENT_DATA.vendorScorecard[selectedVendor as keyof typeof PROCUREMENT_DATA.vendorScorecard];

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Dashboard</h1>
          <p className="text-gray-600 mt-1">Vendor management, negotiations, and contract optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Total Savings Potential</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSavingsOpportunity)}</p>
            <p className="text-xs text-green-700 mt-1 font-semibold">
              {PROCUREMENT_DATA.negotiationOpportunities.length} opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600 font-medium">Critical Renewals</p>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {PROCUREMENT_DATA.contractTimeline.filter((c) => c.status === "critical").length}
            </p>
            <p className="text-xs text-red-700 mt-1">in next 60 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Contract Value at Risk</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(
                PROCUREMENT_DATA.contractTimeline
                  .filter((c) => c.status === "critical")
                  .reduce((sum, c) => sum + c.value, 0)
              )}
            </p>
            <p className="text-xs text-blue-700 mt-1">requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600 font-medium">Avg Vendor Score</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">83/100</p>
            <p className="text-xs text-purple-700 mt-1">across all vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* VENDOR NEGOTIATION OPPORTUNITIES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Vendor Negotiation Opportunities
          </CardTitle>
          <CardDescription>
            Prioritized vendor renegotiation opportunities based on contract analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold text-right">Current Annual</TableHead>
                  <TableHead className="font-semibold text-right">Market Rate</TableHead>
                  <TableHead className="font-semibold text-right">Potential Savings</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Renewal</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROCUREMENT_DATA.negotiationOpportunities.map((opp) => (
                  <TableRow key={opp.vendor} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <p className="font-semibold text-gray-900">{opp.vendor}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(opp.currentAnnual)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {opp.marketRate > 0 ? formatCurrency(opp.marketRate) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-bold text-green-600">{formatCurrency(opp.potentialSavings)}</p>
                        <p className="text-xs text-green-700">({opp.savingsPercent.toFixed(1)}%)</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(opp.priority)}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{opp.renewalDays} days</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View Plan
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-green-50 font-semibold">
                  <TableCell colSpan={3} className="text-right">
                    Total Potential Savings:
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="text-xl text-green-700">{formatCurrency(totalSavingsOpportunity)}</p>
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Detailed Recommendations */}
          <div className="mt-6 space-y-3">
            {PROCUREMENT_DATA.negotiationOpportunities.slice(0, 3).map((opp) => (
              <div
                key={opp.vendor}
                className={`p-4 rounded-lg border-2 ${
                  opp.priority === "critical"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{opp.vendor} Negotiation Strategy</h4>
                  {getPriorityBadge(opp.priority)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">
                      <strong>Leverage:</strong> {opp.leverage}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">
                      <strong>Recommendation:</strong> {opp.recommendation}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-700 font-semibold">
                      Annual Savings: {formatCurrency(opp.potentialSavings)} ({opp.savingsPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VENDOR SCORECARD & CONTRACT TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Scorecard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Vendor Scorecard
            </CardTitle>
            <CardDescription>Detailed performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Vendor Selector */}
            <div className="mb-6">
              <div className="flex gap-2">
                <Button
                  variant={selectedVendor === "salesforce" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVendor("salesforce")}
                >
                  Salesforce
                </Button>
                <Button
                  variant={selectedVendor === "aws" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVendor("aws")}
                >
                  AWS
                </Button>
                <Button
                  variant={selectedVendor === "microsoft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVendor("microsoft")}
                >
                  Microsoft
                </Button>
              </div>
            </div>

            {/* Overall Score */}
            <div className="text-center mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Overall Vendor Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(vendorData.overall)}`}>
                {vendorData.overall}
                <span className="text-2xl text-gray-500">/100</span>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                {vendorData.overall >= 85 ? "Excellent" : vendorData.overall >= 70 ? "Good" : "Needs Improvement"}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-4 mb-6">
              {[
                { label: "Performance", value: vendorData.performance },
                { label: "Cost Efficiency", value: vendorData.costEfficiency },
                { label: "Support Quality", value: vendorData.support },
                { label: "Innovation", value: vendorData.innovation },
                { label: "Reliability", value: vendorData.reliability },
                { label: "Contract Terms", value: vendorData.contractTerms },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                    <p className={`text-sm font-bold ${getScoreColor(metric.value)}`}>{metric.value}/100</p>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>

            {/* Strengths & Concerns */}
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-900">Strengths</p>
                </div>
                <ul className="space-y-1">
                  {vendorData.details.strengths.map((strength, idx) => (
                    <li key={idx} className="text-xs text-green-800 ml-6 list-disc">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-semibold text-orange-900">Concerns</p>
                </div>
                <ul className="space-y-1">
                  {vendorData.details.concerns.map((concern, idx) => (
                    <li key={idx} className="text-xs text-orange-800 ml-6 list-disc">
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-900">Recommendations</p>
                </div>
                <ul className="space-y-1">
                  {vendorData.details.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-blue-800 ml-6 list-disc">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Renewal Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Contract Renewal Timeline
            </CardTitle>
            <CardDescription>Upcoming contract renewals and current phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {PROCUREMENT_DATA.contractTimeline.map((contract, index) => (
                <div key={contract.vendor} className="relative">
                  {/* Timeline Connector */}
                  {index < PROCUREMENT_DATA.contractTimeline.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Timeline Dot */}
                    <div className="relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full ${getTimelineStatusColor(
                          contract.status
                        )} flex items-center justify-center`}
                      >
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Timeline Content */}
                    <div className="flex-1 pb-6">
                      <div
                        className={`p-4 rounded-lg border-2 ${
                          contract.status === "critical"
                            ? "bg-red-50 border-red-200"
                            : contract.status === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{contract.vendor}</p>
                            <p className="text-sm text-gray-600">{contract.renewalDate}</p>
                          </div>
                          <Badge
                            className={`${
                              contract.status === "critical"
                                ? "bg-red-600"
                                : contract.status === "warning"
                                ? "bg-yellow-600"
                                : "bg-green-600"
                            }`}
                          >
                            {contract.daysUntil} days
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <p className="text-xs text-gray-600">Contract Value</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(contract.value)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Phase</p>
                            <Badge variant="outline" className="mt-1 capitalize">
                              {contract.phase}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {PROCUREMENT_DATA.contractTimeline.filter((c) => c.status === "critical").length}
                  </p>
                  <p className="text-xs text-gray-600">Critical</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {PROCUREMENT_DATA.contractTimeline.filter((c) => c.status === "warning").length}
                  </p>
                  <p className="text-xs text-gray-600">Warning</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {PROCUREMENT_DATA.contractTimeline.filter((c) => c.status === "normal").length}
                  </p>
                  <p className="text-xs text-gray-600">On Track</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
