"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Finance Dashboard Data
const FINANCE_DATA = {
  overview: {
    annualBudget: 12000000,
    ytdSpend: 7248000,
    ytdBudget: 7200000,
    projectedEOY: 11650000,
    variance: -350000,
    variancePercent: -2.9,
  },
  spendByCategory: [
    { category: "CRM & Sales", amount: 2890000, percentage: 23.9, color: "#0066FF" },
    { category: "Cloud Infrastructure", amount: 2420000, percentage: 20.0, color: "#00C896" },
    { category: "Productivity", amount: 1980000, percentage: 16.4, color: "#FF9500" },
    { category: "DevOps & Engineering", amount: 1560000, percentage: 12.9, color: "#AF52DE" },
    { category: "HR & Finance", amount: 1230000, percentage: 10.2, color: "#5AC8FA" },
    { category: "Marketing", amount: 1100000, percentage: 9.1, color: "#FF3B30" },
    { category: "Security & Compliance", amount: 820000, percentage: 6.8, color: "#FFD60A" },
  ],
  paymentSchedule: [
    { vendor: "Salesforce", amount: 525000, dueDate: "Dec 15, 2025", category: "CRM", status: "upcoming" },
    { vendor: "AWS", amount: 480000, dueDate: "Dec 30, 2025", category: "Infrastructure", status: "upcoming" },
    { vendor: "Microsoft 365", amount: 450000, dueDate: "Jan 15, 2026", category: "Productivity", status: "scheduled" },
    { vendor: "ServiceNow", amount: 245000, dueDate: "Jan 28, 2026", category: "ITSM", status: "scheduled" },
    { vendor: "GitHub Enterprise", amount: 180000, dueDate: "Feb 10, 2026", category: "DevOps", status: "scheduled" },
    { vendor: "Workday", amount: 160000, dueDate: "Feb 22, 2026", category: "HR", status: "scheduled" },
    { vendor: "Slack", amount: 180000, dueDate: "Mar 5, 2026", category: "Communication", status: "scheduled" },
    { vendor: "Adobe Creative Cloud", amount: 135000, dueDate: "Mar 18, 2026", category: "Design", status: "scheduled" },
    { vendor: "Zoom", amount: 162500, dueDate: "Apr 2, 2026", category: "Communication", status: "scheduled" },
    { vendor: "Atlassian Suite", amount: 120000, dueDate: "Apr 15, 2026", category: "DevOps", status: "scheduled" },
  ],
  costPerEmployee: [
    { month: "Jan", actual: 2456, benchmark: 2100, employees: 450 },
    { month: "Feb", actual: 2523, benchmark: 2100, employees: 452 },
    { month: "Mar", actual: 2489, benchmark: 2150, employees: 455 },
    { month: "Apr", actual: 2612, benchmark: 2150, employees: 458 },
    { month: "May", actual: 2587, benchmark: 2200, employees: 461 },
    { month: "Jun", actual: 2534, benchmark: 2200, employees: 464 },
    { month: "Jul", actual: 2498, benchmark: 2200, employees: 467 },
    { month: "Aug", actual: 2456, benchmark: 2250, employees: 470 },
    { month: "Sep", actual: 2423, benchmark: 2250, employees: 473 },
    { month: "Oct", actual: 2389, benchmark: 2250, employees: 476 },
  ],
  monthlySpendTrend: [
    { month: "Jan", spend: 1104800, budget: 1000000 },
    { month: "Feb", spend: 1140400, budget: 1000000 },
    { month: "Mar", spend: 1132500, budget: 1000000 },
    { month: "Apr", spend: 1196300, budget: 1000000 },
    { month: "May", spend: 1192700, budget: 1000000 },
    { month: "Jun", spend: 1175800, budget: 1000000 },
    { month: "Jul", spend: 1167700, budget: 1000000 },
    { month: "Aug", spend: 1154800, budget: 1000000 },
    { month: "Sep", spend: 1148000, budget: 1000000 },
    { month: "Oct", spend: 1135000, budget: 1000000 },
  ],
};

const COLORS = ["#0066FF", "#00C896", "#FF9500", "#AF52DE", "#5AC8FA", "#FF3B30", "#FFD60A"];

export default function FinanceDashboard() {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const budgetUsagePercent = (FINANCE_DATA.overview.ytdSpend / FINANCE_DATA.overview.ytdBudget) * 100;
  const projectedVariancePercent =
    ((FINANCE_DATA.overview.projectedEOY - FINANCE_DATA.overview.annualBudget) /
      FINANCE_DATA.overview.annualBudget) *
    100;

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">CFO view - Budget, spend analysis, and projections</p>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Annual Budget</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(FINANCE_DATA.overview.annualBudget)}
            </p>
            <p className="text-xs text-gray-500 mt-1">FY 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">YTD Spend</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(FINANCE_DATA.overview.ytdSpend)}
            </p>
            <div className="mt-2">
              <Progress value={budgetUsagePercent} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {budgetUsagePercent.toFixed(1)}% of YTD budget ({formatCurrency(FINANCE_DATA.overview.ytdBudget)})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600 font-medium">Projected EOY</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(FINANCE_DATA.overview.projectedEOY)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDown className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                {Math.abs(projectedVariancePercent).toFixed(1)}% under budget
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Projected Savings</p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(Math.abs(FINANCE_DATA.overview.variance))}
            </p>
            <p className="text-xs text-green-700 mt-1 font-semibold">
              {Math.abs(FINANCE_DATA.overview.variancePercent).toFixed(1)}% below budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SPEND BY CATEGORY & MONTHLY TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-prism-primary" />
              Spend by Category
            </CardTitle>
            <CardDescription>YTD software investment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={FINANCE_DATA.spendByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {FINANCE_DATA.spendByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {FINANCE_DATA.spendByCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-gray-700">{cat.category}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(cat.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spend by Category - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Category Comparison
            </CardTitle>
            <CardDescription>Year-to-date spend by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={FINANCE_DATA.spendByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis dataKey="category" type="category" width={140} fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#0066FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 mb-1">Highest Spend</p>
                <p className="text-sm font-bold text-blue-700">{FINANCE_DATA.spendByCategory[0].category}</p>
                <p className="text-xs text-blue-600">{formatCurrency(FINANCE_DATA.spendByCategory[0].amount)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-900 mb-1">Categories</p>
                <p className="text-2xl font-bold text-green-700">{FINANCE_DATA.spendByCategory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PAYMENT SCHEDULE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Payment Schedule (Next 6 Months)
          </CardTitle>
          <CardDescription>Upcoming contract payments and renewals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Due Date</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FINANCE_DATA.paymentSchedule.map((payment) => (
                  <TableRow key={payment.vendor}>
                    <TableCell>
                      <p className="font-semibold text-gray-900">{payment.vendor}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {payment.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-700">{payment.dueDate}</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {payment.status === "upcoming" ? (
                        <Badge className="bg-orange-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Upcoming
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Scheduled
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell colSpan={3} className="text-right">
                    Total Payment Obligations (6 months):
                  </TableCell>
                  <TableCell className="text-right text-lg">
                    {formatCurrency(
                      FINANCE_DATA.paymentSchedule.reduce((sum, p) => sum + p.amount, 0)
                    )}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Payment Summary */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-900 mb-1">Next 30 Days</p>
              <p className="text-2xl font-bold text-orange-700">
                {formatCurrency(
                  FINANCE_DATA.paymentSchedule
                    .filter((p) => p.status === "upcoming")
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-1">31-90 Days</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(
                  FINANCE_DATA.paymentSchedule.slice(2, 5).reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900 mb-1">91-180 Days</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(
                  FINANCE_DATA.paymentSchedule.slice(5).reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COST PER EMPLOYEE TREND */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Cost Per Employee Trend
          </CardTitle>
          <CardDescription>Software spend per employee vs industry benchmark</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={FINANCE_DATA.costPerEmployee}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0066FF"
                strokeWidth={3}
                name="Actual Cost/Employee"
                dot={{ fill: "#0066FF", r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="#FF9500"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Industry Benchmark"
                dot={{ fill: "#FF9500", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Analysis Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-1">Current (Oct)</p>
              <p className="text-2xl font-bold text-blue-700">
                ${FINANCE_DATA.costPerEmployee[9].actual.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">per employee/month</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-900 mb-1">Industry Benchmark</p>
              <p className="text-2xl font-bold text-orange-700">
                ${FINANCE_DATA.costPerEmployee[9].benchmark.toLocaleString()}
              </p>
              <p className="text-xs text-orange-600 mt-1">per employee/month</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-700" />
                <p className="text-sm text-green-900">Performance</p>
              </div>
              <p className="text-2xl font-bold text-green-700">
                ${(FINANCE_DATA.costPerEmployee[9].benchmark - FINANCE_DATA.costPerEmployee[9].actual).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">above benchmark (good)</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Positive Trend Identified</h4>
                <p className="text-sm text-gray-700">
                  Your cost per employee has decreased by{" "}
                  <strong className="text-green-700">
                    ${(FINANCE_DATA.costPerEmployee[0].actual - FINANCE_DATA.costPerEmployee[9].actual).toFixed(0)}
                  </strong>{" "}
                  (
                  {(
                    ((FINANCE_DATA.costPerEmployee[0].actual - FINANCE_DATA.costPerEmployee[9].actual) /
                      FINANCE_DATA.costPerEmployee[0].actual) *
                    100
                  ).toFixed(1)}
                  %) since January, indicating improved efficiency and optimization efforts. You're now{" "}
                  <strong className="text-green-700">6% above benchmark</strong>, which is excellent for a company of
                  your size.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
