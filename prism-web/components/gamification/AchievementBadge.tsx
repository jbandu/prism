'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles } from 'lucide-react';

interface Achievement {
  achievement_name: string;
  achievement_description: string;
  achievement_category: string;
  icon_emoji: string;
  badge_color: string;
  tier: string;
  rarity: string;
  points_awarded: number;
  requirement_value: number;
  is_earned?: boolean;
  earned_at?: string;
  earned_value?: number;
  is_new?: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export function AchievementBadge({ achievement, size = 'medium', showDetails = true }: AchievementBadgeProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-purple-600 to-pink-600';
      case 'epic': return 'from-purple-500 to-blue-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      case 'uncommon': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      diamond: 'bg-purple-100 text-purple-700',
      platinum: 'bg-blue-100 text-blue-700',
      gold: 'bg-yellow-100 text-yellow-700',
      silver: 'bg-gray-100 text-gray-700',
      bronze: 'bg-orange-100 text-orange-700'
    };
    return colors[tier] || colors.bronze;
  };

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const iconSizes = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-7xl'
  };

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        achievement.is_earned
          ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white`
          : 'bg-gray-50 opacity-60'
      }`}
    >
      <CardContent className={sizeClasses[size]}>
        <div className="flex flex-col items-center text-center gap-3">
          {/* Icon */}
          <div className={`${iconSizes[size]} ${achievement.is_earned ? '' : 'grayscale opacity-50'}`}>
            {achievement.is_earned ? achievement.icon_emoji : <Lock className="w-12 h-12 text-gray-400" />}
          </div>

          {/* Name & Description */}
          {showDetails && (
            <>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className={`font-bold ${size === 'large' ? 'text-xl' : 'text-base'} ${achievement.is_earned ? 'text-white' : 'text-gray-700'}`}>
                    {achievement.achievement_name}
                  </h3>
                  {achievement.is_new && achievement.is_earned && (
                    <Badge className="bg-yellow-400 text-yellow-900">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New!
                    </Badge>
                  )}
                </div>
                <p className={`text-sm ${achievement.is_earned ? 'text-white/90' : 'text-gray-600'}`}>
                  {achievement.achievement_description}
                </p>
              </div>

              {/* Tier & Points */}
              <div className="flex items-center gap-2">
                <Badge className={achievement.is_earned ? 'bg-white/20 text-white' : getTierBadge(achievement.tier)}>
                  {achievement.tier.toUpperCase()}
                </Badge>
                <Badge className={achievement.is_earned ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}>
                  +{achievement.points_awarded} pts
                </Badge>
              </div>

              {/* Earned Info */}
              {achievement.is_earned && achievement.earned_at && (
                <p className="text-xs text-white/80">
                  Earned {new Date(achievement.earned_at).toLocaleDateString()}
                  {achievement.earned_value && (
                    <> • ${achievement.earned_value.toLocaleString()}</>
                  )}
                </p>
              )}

              {/* Locked Info */}
              {!achievement.is_earned && (
                <p className="text-xs text-gray-500">
                  Requirement: ${achievement.requirement_value.toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
