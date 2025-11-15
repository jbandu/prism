"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Clock,
  BarChart3,
  Server,
  Shield,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// IT Operations Dashboard Data
const OPERATIONS_DATA = {
  systemHealth: [
    { platform: "Salesforce", status: "healthy", uptime: 99.98, activeUsers: 847, totalUsers: 920, issues: 0 },
    { platform: "AWS", status: "healthy", uptime: 99.95, activeUsers: 1203, totalUsers: 1450, issues: 0 },
    { platform: "Microsoft 365", status: "healthy", uptime: 99.99, activeUsers: 4521, totalUsers: 4650, issues: 0 },
    { platform: "ServiceNow", status: "warning", uptime: 98.76, activeUsers: 412, totalUsers: 480, issues: 3 },
    { platform: "Slack", status: "healthy", uptime: 99.92, activeUsers: 3892, totalUsers: 4200, issues: 0 },
    { platform: "Zoom", status: "healthy", uptime: 99.87, activeUsers: 3421, totalUsers: 3800, issues: 0 },
    { platform: "GitHub", status: "healthy", uptime: 99.91, activeUsers: 1156, totalUsers: 1200, issues: 0 },
    { platform: "Jira", status: "degraded", uptime: 97.23, activeUsers: 892, totalUsers: 1100, issues: 7 },
    { platform: "Tableau", status: "healthy", uptime: 99.45, activeUsers: 234, totalUsers: 420, issues: 0 },
    { platform: "Adobe Creative Cloud", status: "warning", uptime: 98.12, activeUsers: 156, totalUsers: 280, issues: 2 },
  ],
  licenseUtilization: [
    { month: "Jun", assigned: 4650, active: 4231, utilization: 91 },
    { month: "Jul", assigned: 4680, active: 4298, utilization: 92 },
    { month: "Aug", assigned: 4720, active: 4389, utilization: 93 },
    { month: "Sep", assigned: 4750, active: 4418, utilization: 93 },
    { month: "Oct", assigned: 4780, active: 4493, utilization: 94 },
    { month: "Nov", assigned: 4800, active: 4512, utilization: 94 },
  ],
  provisioningTasks: [
    {
      id: 1,
      task: "Provision Salesforce licenses for 12 new sales hires",
      dueDate: "Nov 18, 2025",
      priority: "high",
      completed: false,
      assignee: "IT Ops Team",
    },
    {
      id: 2,
      task: "Offboard 8 employees - revoke all access",
      dueDate: "Nov 15, 2025",
      priority: "critical",
      completed: false,
      assignee: "Security Team",
    },
    {
      id: 3,
      task: "Set up GitHub Enterprise seats for contractor team (6 users)",
      dueDate: "Nov 20, 2025",
      priority: "medium",
      completed: false,
      assignee: "Dev Ops",
    },
    {
      id: 4,
      task: "Upgrade Adobe CC licenses for design team (15 users)",
      dueDate: "Nov 22, 2025",
      priority: "low",
      completed: false,
      assignee: "IT Ops Team",
    },
    {
      id: 5,
      task: "Audit and remove inactive Slack accounts (estimated 200+)",
      dueDate: "Nov 25, 2025",
      priority: "medium",
      completed: false,
      assignee: "IT Ops Team",
    },
    {
      id: 6,
      task: "Configure SSO for new Datadog instance",
      dueDate: "Nov 17, 2025",
      priority: "high",
      completed: true,
      assignee: "Security Team",
    },
  ],
  apiUsage: [
    {
      service: "Salesforce API",
      current: 387450,
      limit: 500000,
      percentage: 77,
      status: "healthy",
      resetDate: "Dec 1",
    },
    {
      service: "GitHub API",
      current: 4821,
      limit: 5000,
      percentage: 96,
      status: "warning",
      resetDate: "Nov 20",
    },
    {
      service: "Slack API",
      current: 89234,
      limit: 100000,
      percentage: 89,
      status: "warning",
      resetDate: "Nov 30",
    },
    {
      service: "Google Workspace API",
      current: 1234567,
      limit: 2000000,
      percentage: 62,
      status: "healthy",
      resetDate: "Dec 1",
    },
    {
      service: "AWS API Gateway",
      current: 8934521,
      limit: 10000000,
      percentage: 89,
      status: "warning",
      resetDate: "Nov 30",
    },
    {
      service: "Jira API",
      current: 12456,
      limit: 15000,
      percentage: 83,
      status: "healthy",
      resetDate: "Nov 25",
    },
  ],
};

export default function OperationsDashboard() {
  const [tasks, setTasks] = useState(OPERATIONS_DATA.provisioningTasks);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Healthy
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      case "degraded":
        return (
          <Badge className="bg-orange-500">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Degraded
          </Badge>
        );
      case "down":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Down
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
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

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const healthyCount = OPERATIONS_DATA.systemHealth.filter((s) => s.status === "healthy").length;
  const warningCount = OPERATIONS_DATA.systemHealth.filter((s) => s.status === "warning").length;
  const degradedCount = OPERATIONS_DATA.systemHealth.filter((s) => s.status === "degraded").length;
  const totalIssues = OPERATIONS_DATA.systemHealth.reduce((sum, s) => sum + s.issues, 0);

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Operations Dashboard</h1>
          <p className="text-gray-600 mt-1">System health, provisioning, and API monitoring</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* SYSTEM HEALTH OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Healthy Systems</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{healthyCount}</p>
            <p className="text-xs text-gray-500 mt-1">of {OPERATIONS_DATA.systemHealth.length} platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-600 font-medium">Warnings</p>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{warningCount + degradedCount}</p>
            <p className="text-xs text-gray-500 mt-1">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Active Issues</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{totalIssues}</p>
            <p className="text-xs text-gray-500 mt-1">open tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600 font-medium">Pending Tasks</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{pendingTasks}</p>
            <p className="text-xs text-gray-500 mt-1">{completedTasks} completed today</p>
          </CardContent>
        </Card>
      </div>

      {/* PLATFORM HEALTH TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-prism-primary" />
            Platform Health Status
          </CardTitle>
          <CardDescription>Real-time monitoring of all critical platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Platform</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Uptime</TableHead>
                  <TableHead className="font-semibold text-right">Active Users</TableHead>
                  <TableHead className="font-semibold text-right">Total Users</TableHead>
                  <TableHead className="font-semibold text-right">Usage %</TableHead>
                  <TableHead className="font-semibold text-right">Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {OPERATIONS_DATA.systemHealth.map((system) => {
                  const usagePercent = (system.activeUsers / system.totalUsers) * 100;
                  return (
                    <TableRow key={system.platform}>
                      <TableCell>
                        <p className="font-semibold text-gray-900">{system.platform}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(system.status)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            system.uptime >= 99.5
                              ? "text-green-600"
                              : system.uptime >= 98
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {system.uptime.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(system.activeUsers)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {formatNumber(system.totalUsers)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={usagePercent} className="w-16 h-2" />
                          <span className="text-sm font-medium w-12">{usagePercent.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {system.issues > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {system.issues}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* LICENSE UTILIZATION TRENDS & PROVISIONING TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Utilization Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              License Utilization Trends
            </CardTitle>
            <CardDescription>Assigned vs Active licenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={OPERATIONS_DATA.licenseUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned" fill="#0066FF" name="Assigned Licenses" />
                <Bar dataKey="active" fill="#00C896" name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 mb-1">Total Assigned</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatNumber(OPERATIONS_DATA.licenseUtilization[5].assigned)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-900 mb-1">Active Users</p>
                <p className="text-xl font-bold text-green-700">
                  {formatNumber(OPERATIONS_DATA.licenseUtilization[5].active)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-900 mb-1">Utilization</p>
                <p className="text-xl font-bold text-purple-700">
                  {OPERATIONS_DATA.licenseUtilization[5].utilization}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Provisioning Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Upcoming Provisioning Tasks
            </CardTitle>
            <CardDescription>
              {pendingTasks} pending tasks - {completedTasks} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[340px] overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 ${
                    task.completed
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : task.priority === "critical"
                      ? "bg-red-50 border-red-200"
                      : task.priority === "high"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1 w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <p
                          className={`text-sm font-medium ${
                            task.completed ? "line-through text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {task.task}
                        </p>
                        {!task.completed && getPriorityBadge(task.priority)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                        <span>•</span>
                        <span>{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API USAGE MONITORING */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            API Usage Monitoring
          </CardTitle>
          <CardDescription>Real-time API consumption vs rate limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {OPERATIONS_DATA.apiUsage.map((api) => (
              <div key={api.service} className="p-4 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{api.service}</p>
                    <p className="text-xs text-gray-600">
                      {formatNumber(api.current)} / {formatNumber(api.limit)} requests
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getApiStatusColor(api.status)}`}>
                      {api.percentage}%
                    </p>
                    <p className="text-xs text-gray-500">Resets {api.resetDate}</p>
                  </div>
                </div>
                <Progress value={api.percentage} className="h-3" />
                {api.percentage >= 90 && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-700" />
                    <p className="text-xs text-yellow-800 font-medium">
                      Warning: Approaching rate limit. Consider optimizing API calls.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* API Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {OPERATIONS_DATA.apiUsage.filter((a) => a.status === "healthy").length}
                </p>
                <p className="text-xs text-gray-600">Healthy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {OPERATIONS_DATA.apiUsage.filter((a) => a.status === "warning").length}
                </p>
                <p className="text-xs text-gray-600">Warning</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {OPERATIONS_DATA.apiUsage.filter((a) => a.status === "critical").length}
                </p>
                <p className="text-xs text-gray-600">Critical</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
