'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HeatmapData {
  date: string;
  day_of_week: number;
  activity_score: number;
  active_users: number;
  total_sessions: number;
  duration: number;
  cost?: number;
}

interface UsageHeatmapProps {
  data: HeatmapData[];
  title?: string;
  description?: string;
}

export function UsageHeatmap({ data, title = 'Activity Heatmap', description }: UsageHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<HeatmapData | null>(null);

  // Group data by week
  const weeks = groupByWeeks(data);

  // Get activity score color
  const getHeatColor = (score: number) => {
    if (score === 0) return 'bg-gray-100';
    if (score < 25) return 'bg-green-200';
    if (score < 50) return 'bg-green-400';
    if (score < 75) return 'bg-green-600';
    return 'bg-green-800';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = getMonthLabels(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-prism-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Less active</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
              <div className="w-3 h-3 rounded bg-green-200" />
              <div className="w-3 h-3 rounded bg-green-400" />
              <div className="w-3 h-3 rounded bg-green-600" />
              <div className="w-3 h-3 rounded bg-green-800" />
            </div>
            <span>More active</span>
          </div>

          {/* Month labels */}
          <div className="flex gap-1 ml-8">
            {monthLabels.map((month, idx) => (
              <div
                key={idx}
                style={{ width: `${month.weeks * 14}px` }}
                className="text-xs text-gray-600"
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-600 pr-2">
              {dayLabels.map((day, idx) => (
                <div key={idx} className="h-3 flex items-center">
                  {idx % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => (
                    <TooltipProvider key={dayIdx}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={`w-3 h-3 rounded border border-gray-200 cursor-pointer hover:ring-2 hover:ring-prism-primary transition-all ${
                              day ? getHeatColor(day.activity_score) : 'bg-transparent border-transparent'
                            }`}
                            onClick={() => day && setSelectedDate(day)}
                          />
                        </TooltipTrigger>
                        {day && (
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-semibold">{formatDate(day.date)}</p>
                              <p className="text-gray-600">Activity: {day.activity_score}%</p>
                              <p className="text-gray-600">{day.active_users} active users</p>
                              <p className="text-gray-600">{day.total_sessions} sessions</p>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Selected date details */}
          {selectedDate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                {formatDate(selectedDate.date)}
              </h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Activity Score</p>
                  <p className="text-lg font-bold text-blue-700">{selectedDate.activity_score}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Active Users</p>
                  <p className="text-lg font-bold text-blue-700">{selectedDate.active_users}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sessions</p>
                  <p className="text-lg font-bold text-blue-700">{selectedDate.total_sessions}</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Duration</p>
                  <p className="text-lg font-bold text-blue-700">
                    {selectedDate.total_sessions > 0
                      ? Math.round(selectedDate.duration / selectedDate.total_sessions)
                      : 0}m
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(data.reduce((sum, d) => sum + d.activity_score, 0) / data.length)}%
              </p>
              <p className="text-sm text-gray-600">Avg Activity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(...data.map(d => d.activity_score))}%
              </p>
              <p className="text-sm text-gray-600">Peak Activity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {data.filter(d => d.activity_score > 0).length}
              </p>
              <p className="text-sm text-gray-600">Active Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Group data by weeks for calendar layout
 */
function groupByWeeks(data: HeatmapData[]): (HeatmapData | null)[][] {
  if (data.length === 0) return [];

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Create a map of date to data
  const dataMap = new Map(sortedData.map(d => [d.date, d]));

  // Get date range
  const startDate = new Date(sortedData[0].date);
  const endDate = new Date(sortedData[sortedData.length - 1].date);

  // Start from the Sunday before the first date
  const firstSunday = new Date(startDate);
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

  // Build weeks array
  const weeks: (HeatmapData | null)[][] = [];
  let currentWeek: (HeatmapData | null)[] = [];
  let currentDate = new Date(firstSunday);

  while (currentDate <= endDate || currentWeek.length > 0) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayData = dataMap.get(dateStr);

    // Add data if within range, otherwise null
    if (currentDate >= startDate && currentDate <= endDate) {
      currentWeek.push(dayData || null);
    } else {
      currentWeek.push(null);
    }

    // Start new week on Sunday
    if (currentDate.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Get month labels for the heatmap
 */
function getMonthLabels(data: HeatmapData[]) {
  if (data.length === 0) return [];

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startDate = new Date(sortedData[0].date);
  const endDate = new Date(sortedData[sortedData.length - 1].date);

  const months: { label: string; weeks: number }[] = [];
  let currentMonth = startDate.getMonth();
  let weekCount = 0;

  const current = new Date(startDate);
  current.setDate(current.getDate() - current.getDay()); // Start from Sunday

  while (current <= endDate) {
    if (current.getMonth() !== currentMonth) {
      if (weekCount > 0) {
        months.push({
          label: new Date(current.getFullYear(), currentMonth, 1).toLocaleDateString('en-US', { month: 'short' }),
          weeks: weekCount
        });
      }
      currentMonth = current.getMonth();
      weekCount = 0;
    }

    weekCount++;
    current.setDate(current.getDate() + 7);
  }

  // Add last month
  if (weekCount > 0) {
    months.push({
      label: new Date(current.getFullYear(), currentMonth, 1).toLocaleDateString('en-US', { month: 'short' }),
      weeks: weekCount
    });
  }

  return months;
}
