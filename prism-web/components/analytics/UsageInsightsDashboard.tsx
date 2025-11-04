'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Clock
} from 'lucide-react';

interface UsageInsight {
  software_name: string;
  vendor_name: string;
  period_start: string;
  period_end: string;
  avg_daily_users: number;
  peak_users: number;
  total_sessions: number;
  avg_session_duration_minutes: number;
  license_utilization_rate: number;
  unused_licenses: number;
  wasted_cost: number;
  usage_trend: string;
  most_active_day: string;
  activity_distribution: Record<string, number>;
  cost_per_active_user: number;
  cost_per_session: number;
  ai_recommendations: string[];
  waste_opportunities: Array<{
    type: string;
    potential_savings: number;
    recommendation: string;
  }>;
}

interface UsageInsightsDashboardProps {
  insights: UsageInsight[];
  summary: {
    total_software: number;
    avg_utilization: number;
    total_wasted_cost: number;
    total_unused_licenses: number;
  };
}

export function UsageInsightsDashboard({ insights, summary }: UsageInsightsDashboardProps) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Usage Data</h3>
          <p className="text-gray-600">
            Start tracking usage to see insights and recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  const insight = insights[0]; // Most recent insight

  // Prepare activity distribution chart data
  const activityData = insight.activity_distribution
    ? Object.entries(insight.activity_distribution).map(([day, count]) => ({
        day,
        users: count
      }))
    : [];

  // Prepare utilization chart data
  const utilizationData = insights.slice(0, 12).reverse().map(i => ({
    period: new Date(i.period_start).toLocaleDateString('en-US', { month: 'short' }),
    utilization: parseFloat(i.license_utilization_rate.toString()),
    users: i.avg_daily_users
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <span className="w-4 h-4 text-gray-600">-</span>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(summary.avg_utilization)}`}>
                  {summary.avg_utilization.toFixed(0)}%
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
                <p className="text-sm text-gray-600">Unused Licenses</p>
                <p className="text-2xl font-bold text-red-600">{summary.total_unused_licenses}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wasted Cost</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.total_wasted_cost)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Software Tracked</p>
                <p className="text-2xl font-bold text-prism-dark">{summary.total_software}</p>
              </div>
              <Calendar className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Utilization Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">License Utilization Trend</CardTitle>
            <CardDescription>Last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity by Day of Week</CardTitle>
            <CardDescription>Average users per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="users" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Daily Users</span>
              <span className="font-semibold">{Math.round(insight.avg_daily_users)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Peak Users</span>
              <span className="font-semibold">{insight.peak_users}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Sessions</span>
              <span className="font-semibold">{insight.total_sessions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Session</span>
              <span className="font-semibold">
                {Math.round(insight.avg_session_duration_minutes)}m
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost per User</span>
              <span className="font-semibold">{formatCurrency(insight.cost_per_active_user)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost per Session</span>
              <span className="font-semibold">{formatCurrency(insight.cost_per_session)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Wasted Cost</span>
              <span className="font-semibold text-red-600">{formatCurrency(insight.wasted_cost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Unused Licenses</span>
              <span className="font-semibold text-red-600">{insight.unused_licenses}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Most Active Day</span>
              <Badge className="bg-green-100 text-green-700">{insight.most_active_day}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usage Trend</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(insight.usage_trend)}
                <span className="font-semibold capitalize">{insight.usage_trend}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilization Rate</span>
              <span className={`font-semibold ${getUtilizationColor(insight.license_utilization_rate)}`}>
                {insight.license_utilization_rate.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {insight.ai_recommendations && insight.ai_recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-prism-primary" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insight.ai_recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-prism-primary font-bold">•</span>
                  <p className="text-gray-700">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Waste Opportunities */}
      {insight.waste_opportunities && insight.waste_opportunities.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Cost Saving Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insight.waste_opportunities.map((opp, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-red-900 capitalize">
                      {opp.type.replace(/_/g, ' ')}
                    </h4>
                    <span className="text-lg font-bold text-red-700">
                      {formatCurrency(opp.potential_savings)}
                    </span>
                  </div>
                  <p className="text-sm text-red-700">{opp.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
