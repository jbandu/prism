'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, TrendingUp, DollarSign, Target, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userCompany, setUserCompany] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('current');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/leaderboard?period=${period}&limit=50`);
      const result = await response.json();

      if (result.success) {
        setLeaderboard(result.data.leaderboard || []);
        setUserCompany(result.data.userCompany);
        setSummary(result.data.summary);
      } else {
        throw new Error(result.error || 'Failed to load leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-prism-dark flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-500" />
              Savings Leaderboard
            </h1>
            <p className="text-gray-600 mt-2">
              See how your company ranks among top cost optimizers
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">This Month</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchLeaderboard} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Companies</p>
                    <p className="text-3xl font-bold text-prism-dark">{summary.totalCompanies}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Savings</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${(summary.totalSavings / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Efficiency</p>
                    <p className="text-3xl font-bold text-blue-600">{summary.avgEfficiency}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {userCompany && (
              <Card className="ring-2 ring-prism-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Your Rank</p>
                      <p className="text-3xl font-bold text-prism-primary">
                        #{userCompany.overall_rank}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-prism-primary" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* User Company Highlight */}
        {userCompany && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-prism-primary" />
                Your Company Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rank</p>
                  <p className="text-2xl font-bold text-prism-primary">#{userCompany.overall_rank}</p>
                  {userCompany.rank_change > 0 && (
                    <p className="text-sm text-green-600">↑ +{userCompany.rank_change} from last period</p>
                  )}
                  {userCompany.rank_change < 0 && (
                    <p className="text-sm text-red-600">↓ {userCompany.rank_change} from last period</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Efficiency Score</p>
                  <p className="text-2xl font-bold text-blue-600">{userCompany.efficiency_score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(userCompany.total_savings / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Software Optimized</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userCompany.optimized_software_count}/{userCompany.software_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Optimization Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {userCompany.optimization_rate.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Companies ranked by efficiency score and total savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No leaderboard data available yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start tracking savings to appear on the leaderboard
                </p>
              </div>
            ) : (
              <LeaderboardTable
                entries={leaderboard}
                highlightCompanyId={userCompany?.company_name}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
