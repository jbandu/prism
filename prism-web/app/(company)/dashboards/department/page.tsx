"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  DollarSign,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Wallet,
  TrendingUp,
} from "lucide-react";

// Department data structure
const DEPARTMENT_DATA = {
  Marketing: {
    teamSize: 45,
    monthlySpend: 133000,
    annualBudget: 1600000,
    ytdSpend: 798000,
    savingsOpportunities: 156000,
    tools: [
      { name: "HubSpot", users: 35, costPerUser: 450, monthlyTotal: 15750, utilization: 92, category: "Marketing Automation" },
      { name: "Adobe Creative Cloud", users: 28, costPerUser: 600, monthlyTotal: 16800, utilization: 67, category: "Design" },
      { name: "Canva Enterprise", users: 45, costPerUser: 30, monthlyTotal: 1350, utilization: 78, category: "Design" },
      { name: "Google Analytics 360", users: 12, costPerUser: 1250, monthlyTotal: 15000, utilization: 95, category: "Analytics" },
      { name: "SEMrush", users: 8, costPerUser: 225, monthlyTotal: 1800, utilization: 88, category: "SEO" },
      { name: "Mailchimp", users: 15, costPerUser: 350, monthlyTotal: 5250, utilization: 82, category: "Email Marketing" },
      { name: "Hootsuite", users: 10, costPerUser: 200, monthlyTotal: 2000, utilization: 73, category: "Social Media" },
    ],
    recommendations: [
      {
        title: "Consolidate Design Tools",
        description: "You're paying for both Adobe Creative Cloud and Canva. 18 users overlap. Consider standardizing on one platform based on use cases.",
        annualSavings: 129600,
        priority: "high",
        effort: "medium",
      },
      {
        title: "Right-Size HubSpot Licenses",
        description: "10 marketing seats have no activity in 90 days. These are likely former employees or users who switched to other tools.",
        annualSavings: 54000,
        priority: "high",
        effort: "low",
      },
      {
        title: "Negotiate Analytics Bundle",
        description: "Google Analytics 360 + SEMrush can be bundled with existing Google Workspace contract for 15% discount.",
        annualSavings: 30200,
        priority: "medium",
        effort: "low",
      },
    ],
  },
  Engineering: {
    teamSize: 120,
    monthlySpend: 316000,
    annualBudget: 3800000,
    ytdSpend: 1896000,
    savingsOpportunities: 423000,
    tools: [
      { name: "GitHub Enterprise", users: 115, costPerUser: 210, monthlyTotal: 24150, utilization: 96, category: "Version Control" },
      { name: "AWS", users: 120, costPerUser: 1250, monthlyTotal: 150000, utilization: 73, category: "Cloud Infrastructure" },
      { name: "Jira Software", users: 110, costPerUser: 85, monthlyTotal: 9350, utilization: 91, category: "Project Management" },
      { name: "Confluence", users: 105, costPerUser: 55, monthlyTotal: 5775, utilization: 78, category: "Documentation" },
      { name: "Datadog", users: 35, costPerUser: 900, monthlyTotal: 31500, utilization: 89, category: "Monitoring" },
      { name: "PagerDuty", users: 40, costPerUser: 390, monthlyTotal: 15600, utilization: 85, category: "Incident Management" },
      { name: "Figma", users: 25, costPerUser: 144, monthlyTotal: 3600, utilization: 82, category: "Design" },
    ],
    recommendations: [
      {
        title: "Optimize AWS Infrastructure",
        description: "Current EC2 instances show 34% over-provisioning. Moving to auto-scaling groups and reserved instances can reduce costs significantly.",
        annualSavings: 540000,
        priority: "high",
        effort: "high",
      },
      {
        title: "Bundle Atlassian Products",
        description: "Purchasing Jira + Confluence as a bundle instead of separate products qualifies for 20% discount with current team size.",
        annualSavings: 36300,
        priority: "medium",
        effort: "low",
      },
      {
        title: "Review Monitoring Stack",
        description: "Datadog has overlapping features with AWS CloudWatch. Consider consolidating for non-critical workloads.",
        annualSavings: 113400,
        priority: "medium",
        effort: "medium",
      },
    ],
  },
  Sales: {
    teamSize: 85,
    monthlySpend: 241000,
    annualBudget: 2900000,
    ytdSpend: 1446000,
    savingsOpportunities: 287000,
    tools: [
      { name: "Salesforce Sales Cloud", users: 80, costPerUser: 1500, monthlyTotal: 120000, utilization: 88, category: "CRM" },
      { name: "Gong.io", users: 45, costPerUser: 1200, monthlyTotal: 54000, utilization: 92, category: "Revenue Intelligence" },
      { name: "LinkedIn Sales Navigator", users: 65, costPerUser: 800, monthlyTotal: 52000, utilization: 76, category: "Prospecting" },
      { name: "ZoomInfo", users: 40, costPerUser: 950, monthlyTotal: 38000, utilization: 81, category: "Data Intelligence" },
      { name: "Outreach.io", users: 55, costPerUser: 1100, monthlyTotal: 60500, utilization: 87, category: "Sales Engagement" },
      { name: "DocuSign", users: 75, costPerUser: 250, monthlyTotal: 18750, utilization: 94, category: "E-Signature" },
    ],
    recommendations: [
      {
        title: "Optimize Salesforce Licenses",
        description: "15 Salesforce licenses show no login activity in 60+ days. Additionally, 12 users could be downgraded to lower-tier licenses based on feature usage.",
        annualSavings: 324000,
        priority: "high",
        effort: "low",
      },
      {
        title: "Consolidate Prospecting Tools",
        description: "LinkedIn Sales Navigator and ZoomInfo have 70% feature overlap. Standardize on one platform for most users.",
        annualSavings: 187200,
        priority: "medium",
        effort: "medium",
      },
      {
        title: "Renegotiate Gong Contract",
        description: "Contract up for renewal in 90 days. Current pricing is 18% above market rate for companies of your size.",
        annualSavings: 116600,
        priority: "high",
        effort: "low",
      },
    ],
  },
  "IT/Operations": {
    teamSize: 52,
    monthlySpend: 183000,
    annualBudget: 2200000,
    ytdSpend: 1098000,
    savingsOpportunities: 198000,
    tools: [
      { name: "ServiceNow", users: 48, costPerUser: 1700, monthlyTotal: 81600, utilization: 91, category: "ITSM" },
      { name: "Okta", users: 450, costPerUser: 60, monthlyTotal: 27000, utilization: 99, category: "Identity Management" },
      { name: "1Password Teams", users: 450, costPerUser: 8, monthlyTotal: 3600, utilization: 87, category: "Password Management" },
      { name: "AWS Control Tower", users: 25, costPerUser: 2400, monthlyTotal: 60000, utilization: 76, category: "Cloud Governance" },
      { name: "Splunk", users: 18, costPerUser: 2200, monthlyTotal: 39600, utilization: 84, category: "Log Management" },
    ],
    recommendations: [
      {
        title: "Optimize Cloud Governance",
        description: "AWS Control Tower costs can be reduced by 40% through better resource tagging and automated policy enforcement.",
        annualSavings: 288000,
        priority: "high",
        effort: "medium",
      },
      {
        title: "Right-Size Splunk Deployment",
        description: "Current data ingestion is 30% below contracted volume. Negotiate tier adjustment or reduce retention period.",
        annualSavings: 142800,
        priority: "medium",
        effort: "low",
      },
      {
        title: "ServiceNow License Audit",
        description: "5 ITIL licenses can be downgraded to cheaper tiers based on actual role usage patterns.",
        annualSavings: 51000,
        priority: "medium",
        effort: "low",
      },
    ],
  },
  HR: {
    teamSize: 28,
    monthlySpend: 81500,
    annualBudget: 980000,
    ytdSpend: 489000,
    savingsOpportunities: 89000,
    tools: [
      { name: "Workday HCM", users: 450, costPerUser: 95, monthlyTotal: 42750, utilization: 96, category: "HRIS" },
      { name: "Greenhouse", users: 22, costPerUser: 850, monthlyTotal: 18700, utilization: 89, category: "ATS" },
      { name: "Culture Amp", users: 450, costPerUser: 12, monthlyTotal: 5400, utilization: 68, category: "Employee Engagement" },
      { name: "BambooHR", users: 18, costPerUser: 180, monthlyTotal: 3240, utilization: 74, category: "HR Management" },
      { name: "LinkedIn Recruiter", users: 12, costPerUser: 950, monthlyTotal: 11400, utilization: 92, category: "Recruiting" },
    ],
    recommendations: [
      {
        title: "Consolidate HR Systems",
        description: "BambooHR and Workday have 80% feature overlap. Eliminate BambooHR and use Workday exclusively.",
        annualSavings: 38880,
        priority: "medium",
        effort: "medium",
      },
      {
        title: "Optimize Recruiting Tools",
        description: "Greenhouse + LinkedIn Recruiter can be bundled with 12% discount. Also review if all 12 LinkedIn seats are needed.",
        annualSavings: 51840,
        priority: "high",
        effort: "low",
      },
      {
        title: "Culture Amp License Reduction",
        description: "Engagement surveys run quarterly but paying for monthly licenses. Switch to survey-based pricing model.",
        annualSavings: 23400,
        priority: "low",
        effort: "low",
      },
    ],
  },
  Finance: {
    teamSize: 32,
    monthlySpend: 76500,
    annualBudget: 920000,
    ytdSpend: 459000,
    savingsOpportunities: 67000,
    tools: [
      { name: "NetSuite ERP", users: 28, costPerUser: 1200, monthlyTotal: 33600, utilization: 94, category: "ERP" },
      { name: "Expensify", users: 450, costPerUser: 50, monthlyTotal: 22500, utilization: 83, category: "Expense Management" },
      { name: "Bill.com", users: 12, costPerUser: 450, monthlyTotal: 5400, utilization: 91, category: "AP Automation" },
      { name: "Stripe", users: 8, costPerUser: 950, monthlyTotal: 7600, utilization: 98, category: "Payment Processing" },
      { name: "QuickBooks", users: 6, costPerUser: 350, monthlyTotal: 2100, utilization: 45, category: "Accounting" },
    ],
    recommendations: [
      {
        title: "Eliminate QuickBooks Redundancy",
        description: "NetSuite ERP handles all accounting functions that QuickBooks provides. QuickBooks is legacy and can be sunset.",
        annualSavings: 25200,
        priority: "high",
        effort: "low",
      },
      {
        title: "Negotiate Expensify Volume Pricing",
        description: "With 450 users, you qualify for enterprise tier with 25% discount. Current contract is on standard tier.",
        annualSavings: 67500,
        priority: "high",
        effort: "low",
      },
      {
        title: "Bundle Bill.com + NetSuite",
        description: "Oracle (NetSuite owner) offers native AP automation. Evaluate if Bill.com is needed or if NetSuite AP module suffices.",
        annualSavings: 32400,
        priority: "medium",
        effort: "medium",
      },
    ],
  },
};

const DEPARTMENTS = ["Marketing", "Engineering", "Sales", "IT/Operations", "HR", "Finance"];

export default function DepartmentDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("Marketing");

  const deptData = DEPARTMENT_DATA[selectedDepartment as keyof typeof DEPARTMENT_DATA];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const budgetUsagePercent = (deptData.ytdSpend / deptData.annualBudget) * 100;
  const totalSavingsFromRecommendations = deptData.recommendations.reduce(
    (sum, rec) => sum + rec.annualSavings,
    0
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-600">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-blue-600">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case "low":
        return <Badge variant="outline" className="border-green-500 text-green-700">Low Effort</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Medium Effort</Badge>;
      case "high":
        return <Badge variant="outline" className="border-red-500 text-red-700">High Effort</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Dashboard</h1>
          <p className="text-gray-600 mt-1">Software spend and optimization by department</p>
        </div>
        <div className="w-64">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DEPARTMENT HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Team Size</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{deptData.teamSize}</p>
            <p className="text-xs text-gray-500 mt-1">employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Monthly Spend</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(deptData.monthlySpend)}</p>
            <p className="text-xs text-gray-500 mt-1">
              ${Math.round(deptData.monthlySpend / deptData.teamSize).toLocaleString()} per employee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600 font-medium">Annual Budget</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(deptData.annualBudget)}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">YTD: {formatCurrency(deptData.ytdSpend)}</span>
                <span className="font-semibold text-gray-900">{budgetUsagePercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    budgetUsagePercent > 90 ? "bg-red-500" : budgetUsagePercent > 75 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Savings Available</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(deptData.savingsOpportunities)}</p>
            <p className="text-xs text-green-700 mt-1 font-semibold">
              {((deptData.savingsOpportunities / deptData.annualBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TOOLS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-prism-primary" />
            Software Tools Breakdown
          </CardTitle>
          <CardDescription>
            Current software investments for {selectedDepartment} department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Tool Name</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold text-right">Users</TableHead>
                  <TableHead className="font-semibold text-right">Cost/User</TableHead>
                  <TableHead className="font-semibold text-right">Monthly Total</TableHead>
                  <TableHead className="font-semibold text-right">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptData.tools.map((tool) => (
                  <TableRow key={tool.name}>
                    <TableCell>
                      <p className="font-semibold text-gray-900">{tool.name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{tool.users}</TableCell>
                    <TableCell className="text-right">${tool.costPerUser.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      ${tool.monthlyTotal.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            tool.utilization >= 85
                              ? "text-green-600"
                              : tool.utilization >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {tool.utilization}%
                        </span>
                        {tool.utilization < 70 && <AlertCircle className="w-4 h-4 text-red-500" />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell colSpan={4} className="text-right">
                    Total Monthly Spend:
                  </TableCell>
                  <TableCell className="text-right text-lg">
                    ${deptData.tools.reduce((sum, t) => sum + t.monthlyTotal, 0).toLocaleString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 mb-1">Total Tools</p>
              <p className="text-2xl font-bold text-blue-700">{deptData.tools.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-900 mb-1">Avg Utilization</p>
              <p className="text-2xl font-bold text-green-700">
                {Math.round(deptData.tools.reduce((sum, t) => sum + t.utilization, 0) / deptData.tools.length)}%
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-900 mb-1">Annual Cost</p>
              <p className="text-2xl font-bold text-orange-700">
                {formatCurrency(deptData.monthlySpend * 12)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OPTIMIZATION OPPORTUNITIES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Optimization Opportunities
          </CardTitle>
          <CardDescription>
            AI-identified savings recommendations for {selectedDepartment}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deptData.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg border-2 ${
                  rec.priority === "high"
                    ? "bg-red-50 border-red-200"
                    : rec.priority === "medium"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-gray-700" />
                      <h4 className="font-semibold text-gray-900 text-lg">{rec.title}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(rec.priority)}
                      {getEffortBadge(rec.effort)}
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(rec.annualSavings)}
                    </p>
                    <Button size="sm" className="mt-3 bg-prism-primary hover:bg-prism-primary/90">
                      View Plan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Savings Summary */}
          <div className="mt-6 p-6 bg-gradient-to-r from-green-600 to-green-500 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 mb-1">Total Potential Savings for {selectedDepartment}</p>
                <p className="text-4xl font-bold">
                  {formatCurrency(totalSavingsFromRecommendations)}/year
                </p>
                <p className="text-sm text-green-100 mt-2">
                  That&apos;s {((totalSavingsFromRecommendations / deptData.annualBudget) * 100).toFixed(1)}% of your
                  annual budget
                </p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-2" />
                <p className="text-sm text-green-100">{deptData.recommendations.length} recommendations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
