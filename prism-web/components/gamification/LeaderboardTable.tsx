'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';

interface LeaderboardEntry {
  overall_rank: number;
  previous_rank?: number;
  rank_change: number;
  company_name: string;
  industry?: string;
  logo_url?: string;
  efficiency_score: number;
  total_savings: number;
  software_count: number;
  optimized_software_count: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  userCompanyId?: string;
  highlightCompanyId?: string;
}

export function LeaderboardTable({ entries, highlightCompanyId }: LeaderboardTableProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', color: 'bg-yellow-100 text-yellow-700' };
    if (rank === 2) return { emoji: '🥈', color: 'bg-gray-100 text-gray-700' };
    if (rank === 3) return { emoji: '🥉', color: 'bg-orange-100 text-orange-700' };
    return { emoji: `#${rank}`, color: 'bg-gray-50 text-gray-600' };
  };

  const getRankChange = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Minus className="w-4 h-4" />
        <span className="text-sm">-</span>
      </div>
    );
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const rankBadge = getRankBadge(entry.overall_rank);
        const isHighlighted = highlightCompanyId && entry.company_name === highlightCompanyId;

        return (
          <Card
            key={index}
            className={`transition-all hover:shadow-md ${
              isHighlighted ? 'ring-2 ring-prism-primary bg-purple-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Rank & Company Info */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className="flex items-center gap-2">
                    <Badge className={`${rankBadge.color} text-lg px-3 py-1`}>
                      {rankBadge.emoji}
                    </Badge>
                    {getRankChange(entry.rank_change)}
                  </div>

                  {/* Company Info */}
                  <div className="flex items-center gap-3">
                    {entry.logo_url && (
                      <img
                        src={entry.logo_url}
                        alt={entry.company_name}
                        className="w-10 h-10 rounded object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{entry.company_name}</h3>
                      {entry.industry && (
                        <p className="text-sm text-gray-600">{entry.industry}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-8">
                  {/* Efficiency Score */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Efficiency</p>
                    <p className={`text-2xl font-bold ${getEfficiencyColor(entry.efficiency_score)}`}>
                      {entry.efficiency_score}%
                    </p>
                  </div>

                  {/* Total Savings */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Total Savings</p>
                    <p className="text-xl font-bold text-green-600 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {(entry.total_savings / 1000).toFixed(0)}K
                    </p>
                  </div>

                  {/* Optimization Rate */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Optimized</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {entry.optimized_software_count}/{entry.software_count}
                    </p>
                  </div>

                  {/* Trophy Icon for Top 3 */}
                  {entry.overall_rank <= 3 && (
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  )}
                </div>
              </div>

              {isHighlighted && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <Badge className="bg-purple-100 text-purple-700">
                    👤 Your Company
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
