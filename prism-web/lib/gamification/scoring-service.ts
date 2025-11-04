/**
 * Gamification Scoring Service
 *
 * Calculates company scores, rankings, and awards achievements
 */

import { sql } from '@/lib/db';

export interface CompanyMetrics {
  companyId: string;
  totalSavings: number;
  totalSpend: number;
  softwareCount: number;
  optimizedSoftwareCount: number;
  contractsReviewed: number;
  alternativesEvaluated: number;
  approvalsProcessed: number;
}

export interface ScoreBreakdown {
  negotiationScore: number;
  redundancyScore: number;
  utilizationScore: number;
  contractScore: number;
  shadowItScore: number;
  overallScore: number;
}

export class ScoringService {
  /**
   * Calculate comprehensive scores for a company
   */
  static async calculateCompanyScores(companyId: string, periodStart: string, periodEnd: string): Promise<ScoreBreakdown> {
    // Get all relevant data for the period
    const [savings, software, contracts, utilization, shadowIt] = await Promise.all([
      this.getSavingsData(companyId, periodStart, periodEnd),
      this.getSoftwareData(companyId),
      this.getContractData(companyId, periodStart, periodEnd),
      this.getUtilizationData(companyId),
      this.getShadowItData(companyId, periodStart, periodEnd)
    ]);

    // Calculate individual scores (0-100)
    const negotiationScore = this.calculateNegotiationScore(savings, contracts);
    const redundancyScore = this.calculateRedundancyScore(software);
    const utilizationScore = this.calculateUtilizationScore(utilization);
    const contractScore = this.calculateContractScore(contracts);
    const shadowItScore = this.calculateShadowItScore(shadowIt);

    // Overall score (weighted average)
    const overallScore = Math.round(
      (negotiationScore * 0.25) +
      (redundancyScore * 0.20) +
      (utilizationScore * 0.25) +
      (contractScore * 0.15) +
      (shadowItScore * 0.15)
    );

    return {
      negotiationScore,
      redundancyScore,
      utilizationScore,
      contractScore,
      shadowItScore,
      overallScore
    };
  }

  /**
   * Update company score record
   */
  static async updateCompanyScore(
    companyId: string,
    periodStart: string,
    periodEnd: string,
    scores: ScoreBreakdown,
    metrics: CompanyMetrics
  ) {
    const optimizationRate = metrics.softwareCount > 0
      ? (metrics.optimizedSoftwareCount / metrics.softwareCount) * 100
      : 0;

    // Upsert score record
    await sql`
      INSERT INTO company_scores (
        company_id,
        total_savings,
        total_spend,
        efficiency_score,
        optimization_rate,
        negotiation_score,
        redundancy_score,
        utilization_score,
        contract_score,
        shadow_it_score,
        software_count,
        optimized_software_count,
        contracts_reviewed,
        alternatives_evaluated,
        approvals_processed,
        period_start,
        period_end,
        is_current_period
      ) VALUES (
        ${companyId},
        ${metrics.totalSavings},
        ${metrics.totalSpend},
        ${scores.overallScore},
        ${optimizationRate},
        ${scores.negotiationScore},
        ${scores.redundancyScore},
        ${scores.utilizationScore},
        ${scores.contractScore},
        ${scores.shadowItScore},
        ${metrics.softwareCount},
        ${metrics.optimizedSoftwareCount},
        ${metrics.contractsReviewed},
        ${metrics.alternativesEvaluated},
        ${metrics.approvalsProcessed},
        ${periodStart}::DATE,
        ${periodEnd}::DATE,
        true
      )
      ON CONFLICT (company_id, period_start, period_end)
      DO UPDATE SET
        total_savings = ${metrics.totalSavings},
        total_spend = ${metrics.totalSpend},
        efficiency_score = ${scores.overallScore},
        optimization_rate = ${optimizationRate},
        negotiation_score = ${scores.negotiationScore},
        redundancy_score = ${scores.redundancyScore},
        utilization_score = ${scores.utilizationScore},
        contract_score = ${scores.contractScore},
        shadow_it_score = ${scores.shadowItScore},
        software_count = ${metrics.softwareCount},
        optimized_software_count = ${metrics.optimizedSoftwareCount},
        contracts_reviewed = ${metrics.contractsReviewed},
        alternatives_evaluated = ${metrics.alternativesEvaluated},
        approvals_processed = ${metrics.approvalsProcessed},
        is_current_period = true,
        updated_at = NOW()
    `;
  }

  /**
   * Calculate rankings for all companies
   */
  static async calculateRankings(periodStart: string, periodEnd: string) {
    // Get all scores for the period
    const scores = await sql`
      SELECT
        id,
        company_id,
        efficiency_score,
        total_savings,
        negotiation_score,
        redundancy_score,
        utilization_score
      FROM company_scores
      WHERE period_start = ${periodStart}::DATE
        AND period_end = ${periodEnd}::DATE
      ORDER BY efficiency_score DESC, total_savings DESC
    `;

    // Update overall rankings
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      const rank = i + 1;

      // Get previous rank
      const previousScore = await sql`
        SELECT overall_rank
        FROM company_scores
        WHERE company_id = ${score.company_id}
          AND period_end < ${periodStart}::DATE
        ORDER BY period_end DESC
        LIMIT 1
      `;

      const previousRank = previousScore.length > 0 ? previousScore[0].overall_rank : null;
      const rankChange = previousRank ? previousRank - rank : 0;

      // Update this score record
      await sql`
        UPDATE company_scores
        SET
          overall_rank = ${rank},
          previous_rank = ${previousRank || null},
          rank_change = ${rankChange},
          updated_at = NOW()
        WHERE id = ${score.id}
      `;
    }

    // Calculate category rankings
    await this.calculateCategoryRankings(periodStart, periodEnd, 'negotiation', 'negotiation_score', 'category_rank_negotiation');
    await this.calculateCategoryRankings(periodStart, periodEnd, 'redundancy', 'redundancy_score', 'category_rank_redundancy');
    await this.calculateCategoryRankings(periodStart, periodEnd, 'utilization', 'utilization_score', 'category_rank_utilization');
  }

  /**
   * Award achievements based on current metrics
   */
  static async awardAchievements(companyId: string) {
    // Get company metrics
    const score = await sql`
      SELECT *
      FROM company_scores
      WHERE company_id = ${companyId}
        AND is_current_period = true
      ORDER BY period_end DESC
      LIMIT 1
    `;

    if (score.length === 0) return;

    const metrics = score[0];

    // Get all achievements
    const achievements = await sql`
      SELECT *
      FROM achievements
      WHERE is_active = true
    `;

    // Check each achievement
    for (const achievement of achievements) {
      const hasAchievement = await sql`
        SELECT id
        FROM company_achievements
        WHERE company_id = ${companyId}
          AND achievement_id = ${achievement.id}
      `;

      if (hasAchievement.length > 0) continue; // Already earned

      // Check if requirements are met
      const earned = this.checkAchievementRequirement(achievement, metrics);

      if (earned.qualified) {
        await sql`
          INSERT INTO company_achievements (
            company_id,
            achievement_id,
            earned_value,
            progress_percentage
          ) VALUES (
            ${companyId},
            ${achievement.id},
            ${earned.value},
            100
          )
        `;
      }
    }
  }

  /**
   * Record a savings event
   */
  static async recordSavingsEvent(
    companyId: string,
    eventType: string,
    annualSavings: number,
    softwareId?: string,
    softwareName?: string,
    description?: string
  ) {
    const monthlySavings = annualSavings / 12;

    await sql`
      INSERT INTO savings_events (
        company_id,
        event_type,
        annual_savings,
        monthly_savings,
        software_id,
        software_name,
        description,
        verified
      ) VALUES (
        ${companyId},
        ${eventType},
        ${annualSavings},
        ${monthlySavings},
        ${softwareId || null},
        ${softwareName || null},
        ${description || null},
        true
      )
    `;

    // Recalculate scores
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const metrics = await this.getCompanyMetrics(companyId, periodStart, periodEnd);
    const scores = await this.calculateCompanyScores(companyId, periodStart, periodEnd);
    await this.updateCompanyScore(companyId, periodStart, periodEnd, scores, metrics);

    // Check for new achievements
    await this.awardAchievements(companyId);
  }

  // Helper methods for score calculation

  private static calculateNegotiationScore(savings: any, contracts: any): number {
    // Based on total savings and successful negotiations
    let score = 0;

    // Savings component (0-60 points)
    if (savings.total >= 100000) score += 60;
    else if (savings.total >= 50000) score += 50;
    else if (savings.total >= 25000) score += 40;
    else if (savings.total >= 10000) score += 30;
    else if (savings.total >= 5000) score += 20;
    else if (savings.total >= 1000) score += 10;

    // Negotiation activity (0-40 points)
    const negRate = contracts.total > 0 ? (contracts.negotiated / contracts.total) * 40 : 0;
    score += Math.min(40, Math.round(negRate));

    return Math.min(100, score);
  }

  private static calculateRedundancyScore(software: any): number {
    // Based on identified and resolved redundancies
    if (software.total === 0) return 50; // Neutral score for no software

    const redundancyRate = software.redundant / software.total;
    const resolvedRate = software.redundanciesResolved / Math.max(1, software.redundant);

    // Lower redundancy rate = higher score
    const redundancyScore = (1 - Math.min(1, redundancyRate)) * 50;
    const resolutionScore = resolvedRate * 50;

    return Math.min(100, Math.round(redundancyScore + resolutionScore));
  }

  private static calculateUtilizationScore(utilization: any): number {
    // Based on average license utilization
    if (utilization.totalLicenses === 0) return 50; // Neutral score

    const avgUtilization = utilization.totalActive / utilization.totalLicenses;
    return Math.min(100, Math.round(avgUtilization * 100));
  }

  private static calculateContractScore(contracts: any): number {
    // Based on contract review rate and risk management
    let score = 0;

    const reviewRate = contracts.total > 0 ? (contracts.reviewed / contracts.total) * 50 : 0;
    score += Math.round(reviewRate);

    const riskScore = contracts.total > 0
      ? (1 - (contracts.criticalRisks / contracts.total)) * 50
      : 50;
    score += Math.round(riskScore);

    return Math.min(100, score);
  }

  private static calculateShadowItScore(shadowIt: any): number {
    // Lower shadow IT = higher score
    if (shadowIt.detected === 0) return 100; // Perfect score

    const resolvedRate = shadowIt.resolved / shadowIt.detected;
    const activeRate = 1 - (shadowIt.active / shadowIt.detected);

    return Math.min(100, Math.round((resolvedRate * 50) + (activeRate * 50)));
  }

  private static checkAchievementRequirement(achievement: any, metrics: any): { qualified: boolean; value: number } {
    const reqType = achievement.requirement_type;
    const reqValue = parseFloat(achievement.requirement_value);

    switch (reqType) {
      case 'total_savings':
        return {
          qualified: metrics.total_savings >= reqValue,
          value: metrics.total_savings
        };
      case 'efficiency_score':
        return {
          qualified: metrics.efficiency_score >= reqValue,
          value: metrics.efficiency_score
        };
      case 'software_optimized':
        return {
          qualified: metrics.optimized_software_count >= reqValue,
          value: metrics.optimized_software_count
        };
      case 'contracts_reviewed':
        return {
          qualified: metrics.contracts_reviewed >= reqValue,
          value: metrics.contracts_reviewed
        };
      default:
        return { qualified: false, value: 0 };
    }
  }

  private static async calculateCategoryRankings(
    periodStart: string,
    periodEnd: string,
    category: string,
    scoreColumn: string,
    rankColumn: string
  ) {
    const scores = await sql.query(
      `SELECT id FROM company_scores
       WHERE period_start = $1::DATE AND period_end = $2::DATE
       ORDER BY ${scoreColumn} DESC`,
      [periodStart, periodEnd]
    );

    for (let i = 0; i < scores.length; i++) {
      await sql.query(
        `UPDATE company_scores SET ${rankColumn} = $1 WHERE id = $2`,
        [i + 1, scores[i].id]
      );
    }
  }

  // Data gathering helpers

  private static async getSavingsData(companyId: string, periodStart: string, periodEnd: string) {
    const result = await sql`
      SELECT
        COALESCE(SUM(annual_savings), 0) as total
      FROM savings_events
      WHERE company_id = ${companyId}
        AND created_at >= ${periodStart}::DATE
        AND created_at <= ${periodEnd}::DATE
        AND verified = true
    `;

    return { total: parseFloat(result[0]?.total || '0') };
  }

  private static async getSoftwareData(companyId: string) {
    const result = await sql`
      SELECT
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN utilization_rate >= 80 THEN 1 ELSE 0 END), 0) as redundant,
        0 as redundanciesResolved
      FROM software
      WHERE company_id = ${companyId}
    `;

    return {
      total: parseInt(result[0]?.total || '0'),
      redundant: parseInt(result[0]?.redundant || '0'),
      redundanciesResolved: 0
    };
  }

  private static async getContractData(companyId: string, periodStart: string, periodEnd: string) {
    const result = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) as reviewed,
        COUNT(*) FILTER (WHERE analysis_status = 'completed') as negotiated,
        COUNT(*) FILTER (WHERE id IN (
          SELECT contract_id FROM contract_risk_alerts WHERE severity = 'critical'
        )) as criticalRisks
      FROM contracts
      WHERE company_id = ${companyId}
    `;

    return {
      total: parseInt(result[0]?.total || '0'),
      reviewed: parseInt(result[0]?.reviewed || '0'),
      negotiated: parseInt(result[0]?.negotiated || '0'),
      criticalRisks: parseInt(result[0]?.criticalrisks || '0')
    };
  }

  private static async getUtilizationData(companyId: string) {
    const result = await sql`
      SELECT
        COALESCE(SUM(license_count), 0) as totalLicenses,
        COALESCE(SUM(ROUND(license_count * utilization_rate / 100)), 0) as totalActive
      FROM software
      WHERE company_id = ${companyId}
    `;

    return {
      totalLicenses: parseInt(result[0]?.totallicenses || '0'),
      totalActive: parseInt(result[0]?.totalactive || '0')
    };
  }

  private static async getShadowItData(companyId: string, periodStart: string, periodEnd: string) {
    const result = await sql`
      SELECT
        COUNT(*) as detected,
        COUNT(*) FILTER (WHERE status = 'detected' OR status = 'investigating') as active,
        COUNT(*) FILTER (WHERE status IN ('approved_retroactive', 'removed', 'false_positive')) as resolved
      FROM shadow_it_detections
      WHERE company_id = ${companyId}
    `;

    return {
      detected: parseInt(result[0]?.detected || '0'),
      active: parseInt(result[0]?.active || '0'),
      resolved: parseInt(result[0]?.resolved || '0')
    };
  }

  private static async getCompanyMetrics(
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<CompanyMetrics> {
    const [software, savings, contracts, alternatives, approvals] = await Promise.all([
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE utilization_rate >= 80) as optimized FROM software WHERE company_id = ${companyId}`,
      sql`SELECT COALESCE(SUM(annual_savings), 0) as total FROM savings_events WHERE company_id = ${companyId} AND verified = true`,
      sql`SELECT COUNT(*) as total FROM contracts WHERE company_id = ${companyId}`,
      sql`SELECT COUNT(*) as total FROM alternative_evaluations WHERE company_id = ${companyId}`,
      sql`SELECT COUNT(*) as total FROM software_requests WHERE company_id = ${companyId} AND status IN ('approved', 'rejected')`
    ]);

    const totalSpend = await sql`SELECT COALESCE(SUM(annual_cost), 0) as total FROM software WHERE company_id = ${companyId}`;

    return {
      companyId,
      totalSavings: parseFloat(savings[0]?.total || '0'),
      totalSpend: parseFloat(totalSpend[0]?.total || '0'),
      softwareCount: parseInt(software[0]?.total || '0'),
      optimizedSoftwareCount: parseInt(software[0]?.optimized || '0'),
      contractsReviewed: parseInt(contracts[0]?.total || '0'),
      alternativesEvaluated: parseInt(alternatives[0]?.total || '0'),
      approvalsProcessed: parseInt(approvals[0]?.total || '0')
    };
  }
}
