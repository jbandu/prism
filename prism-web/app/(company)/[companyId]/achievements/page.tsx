'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Star, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';

export default function AchievementsPage({ params }: { params: { companyId: string } }) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [earned, setEarned] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, [params.companyId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);

      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        throw new Error('Failed to get company');
      }

      const companyId = companyResult.data.id;

      const response = await fetch(`/api/achievements?companyId=${companyId}`);
      const result = await response.json();

      if (result.success) {
        setAchievements(result.data.all || []);
        setEarned(result.data.earned || []);
        setStats(result.data.stats);
      } else {
        throw new Error(result.error || 'Failed to load achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (cat: string) => {
    if (cat === 'all') return achievements;
    return achievements.filter(a => a.achievement_category === cat);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'savings': return '💰';
      case 'efficiency': return '📈';
      case 'negotiation': return '🤝';
      case 'optimization': return '⚡';
      case 'streaks': return '🔥';
      case 'milestones': return '🎯';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-gray-600 mt-2">
            Track your progress and unlock rewards
          </p>
        </div>
        <Button onClick={fetchAchievements} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Earned</p>
                  <p className="text-3xl font-bold text-prism-primary">{stats.totalEarned}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.totalAvailable}</p>
                </div>
                <Target className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.completionRate.toFixed(0)}%</p>
                </div>
                <Star className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalPoints}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recently Earned */}
      {earned.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Recently Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {earned.slice(0, 4).map((achievement, idx) => (
                <AchievementBadge
                  key={idx}
                  achievement={achievement}
                  size="medium"
                  showDetails={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Achievements by Category */}
      <Card>
        <CardHeader>
          <CardTitle>All Achievements</CardTitle>
          <CardDescription>
            Complete challenges to earn badges and points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-7 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="savings">{getCategoryIcon('savings')} Savings</TabsTrigger>
              <TabsTrigger value="efficiency">{getCategoryIcon('efficiency')} Efficiency</TabsTrigger>
              <TabsTrigger value="negotiation">{getCategoryIcon('negotiation')} Negotiation</TabsTrigger>
              <TabsTrigger value="optimization">{getCategoryIcon('optimization')} Optimization</TabsTrigger>
              <TabsTrigger value="streaks">{getCategoryIcon('streaks')} Streaks</TabsTrigger>
              <TabsTrigger value="milestones">{getCategoryIcon('milestones')} Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-4 gap-4">
                {achievements.map((achievement, idx) => (
                  <AchievementBadge
                    key={idx}
                    achievement={achievement}
                    size="medium"
                    showDetails={true}
                  />
                ))}
              </div>
            </TabsContent>

            {['savings', 'efficiency', 'negotiation', 'optimization', 'streaks', 'milestones'].map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="grid grid-cols-4 gap-4">
                  {filterByCategory(cat).map((achievement, idx) => (
                    <AchievementBadge
                      key={idx}
                      achievement={achievement}
                      size="medium"
                      showDetails={true}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
