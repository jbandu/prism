/**
 * Achievements API
 * GET - Retrieve achievements (all or for a specific company)
 * POST - Award or calculate achievements
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ScoringService } from '@/lib/gamification/scoring-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const category = searchParams.get('category');

    if (companyId) {
      // Get company's earned achievements
      let query;
      if (category) {
        query = sql`
          SELECT
            ca.*,
            a.achievement_name,
            a.achievement_description,
            a.achievement_category,
            a.icon_emoji,
            a.badge_color,
            a.tier,
            a.points_awarded,
            a.rarity
          FROM company_achievements ca
          JOIN achievements a ON a.id = ca.achievement_id
          WHERE ca.company_id = ${companyId}
            AND a.achievement_category = ${category}
          ORDER BY ca.earned_at DESC
        `;
      } else {
        query = sql`
          SELECT
            ca.*,
            a.achievement_name,
            a.achievement_description,
            a.achievement_category,
            a.icon_emoji,
            a.badge_color,
            a.tier,
            a.points_awarded,
            a.rarity
          FROM company_achievements ca
          JOIN achievements a ON a.id = ca.achievement_id
          WHERE ca.company_id = ${companyId}
          ORDER BY ca.earned_at DESC
        `;
      }

      const earned = await query;

      // Get all available achievements with progress
      const allAchievements = await sql`
        SELECT
          a.*,
          ca.id as earned_id,
          ca.earned_at,
          ca.earned_value,
          CASE WHEN ca.id IS NOT NULL THEN true ELSE false END as is_earned
        FROM achievements a
        LEFT JOIN company_achievements ca ON ca.achievement_id = a.id AND ca.company_id = ${companyId}
        WHERE a.is_active = true
        ORDER BY
          CASE WHEN ca.id IS NULL THEN 0 ELSE 1 END DESC,
          a.requirement_value ASC
      `;

      // Calculate total points
      const totalPoints = earned.reduce((sum, row) => sum + (row.points_awarded || 0), 0);

      return NextResponse.json({
        success: true,
        data: {
          earned: earned,
          all: allAchievements,
          stats: {
            totalEarned: earned.length,
            totalAvailable: allAchievements.length,
            totalPoints,
            completionRate: allAchievements.length > 0
              ? (earned.length / allAchievements.length) * 100
              : 0
          }
        }
      });
    } else {
      // Get all available achievements
      let query;
      if (category) {
        query = sql`
          SELECT *
          FROM achievements
          WHERE is_active = true
            AND achievement_category = ${category}
          ORDER BY requirement_value ASC
        `;
      } else {
        query = sql`
          SELECT *
          FROM achievements
          WHERE is_active = true
          ORDER BY achievement_category, requirement_value ASC
        `;
      }

      const achievements = await query;

      // Group by category
      const byCategory = achievements.reduce((acc: any, achievement: any) => {
        const cat = achievement.achievement_category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(achievement);
        return acc;
      }, {});

      return NextResponse.json({
        success: true,
        data: {
          achievements: achievements,
          byCategory
        }
      });
    }
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get achievements'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, companyId } = body;

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    if (action === 'recalculate') {
      // Recalculate and award achievements
      await ScoringService.awardAchievements(companyId);

      return NextResponse.json({
        success: true,
        message: 'Achievements recalculated successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    console.error('POST achievements error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}
