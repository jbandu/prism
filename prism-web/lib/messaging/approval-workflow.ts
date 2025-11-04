/**
 * Approval Workflow Service
 *
 * Manages software request approval workflows including:
 * - Request creation and validation
 * - Duplicate detection and redundancy analysis
 * - Approval/rejection handling
 * - Alternative suggestions
 */

import { sql } from '@neondatabase/serverless';
import { NotificationService } from './notification-service';

export interface SoftwareRequestInput {
  companyId: string;
  requestedByUserId?: string;
  requestedByName: string;
  requestedByEmail?: string;
  softwareName: string;
  vendorName?: string;
  category?: string;
  estimatedAnnualCost?: number;
  licenseCountNeeded?: number;
  businessJustification: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  useCase?: string;
}

export interface ApprovalActionInput {
  requestId: string;
  companyId: string;
  action: 'approve' | 'reject' | 'request_info' | 'suggest_alternative';
  actorUserId?: string;
  actorName: string;
  actorEmail?: string;
  actorPlatform?: 'slack' | 'teams' | 'web';
  comment?: string;
  suggestedAlternative?: string;
}

export class ApprovalWorkflow {
  /**
   * Create a new software request
   */
  static async createRequest(
    input: SoftwareRequestInput
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      // Check for existing software
      const existingSoftware = await sql`
        SELECT id, software_name, vendor_name, annual_cost, license_count
        FROM software
        WHERE company_id = ${input.companyId}
          AND LOWER(software_name) = LOWER(${input.softwareName})
      `;

      let redundancyDetected = false;
      let redundantWithSoftwareIds: string[] = [];
      let suggestedAlternatives: any[] = [];

      if (existingSoftware.rows.length > 0) {
        redundancyDetected = true;
        redundantWithSoftwareIds = existingSoftware.rows.map(s => s.id);
        suggestedAlternatives.push({
          type: 'existing',
          name: existingSoftware.rows[0].software_name,
          vendor: existingSoftware.rows[0].vendor_name,
          cost: existingSoftware.rows[0].annual_cost,
          reason: 'Your company already has this software'
        });
      }

      // Check for similar software in the same category
      if (input.category) {
        const similarSoftware = await sql`
          SELECT id, software_name, vendor_name, category, annual_cost
          FROM software
          WHERE company_id = ${input.companyId}
            AND category = ${input.category}
            AND LOWER(software_name) != LOWER(${input.softwareName})
          LIMIT 3
        `;

        if (similarSoftware.rows.length > 0) {
          redundancyDetected = true;
          redundantWithSoftwareIds.push(...similarSoftware.rows.map(s => s.id));
          suggestedAlternatives.push(
            ...similarSoftware.rows.map(s => ({
              type: 'similar',
              name: s.software_name,
              vendor: s.vendor_name,
              cost: s.annual_cost,
              reason: `Similar ${input.category} software already in use`
            }))
          );
        }
      }

      // Create the request
      const result = await sql`
        INSERT INTO software_requests (
          company_id,
          requested_by_user_id,
          requested_by_name,
          requested_by_email,
          software_name,
          vendor_name,
          category,
          estimated_annual_cost,
          license_count_needed,
          business_justification,
          urgency,
          department,
          use_case,
          redundancy_detected,
          redundant_with_software_ids,
          suggested_alternatives
        ) VALUES (
          ${input.companyId},
          ${input.requestedByUserId || null},
          ${input.requestedByName},
          ${input.requestedByEmail || null},
          ${input.softwareName},
          ${input.vendorName || null},
          ${input.category || null},
          ${input.estimatedAnnualCost || null},
          ${input.licenseCountNeeded || null},
          ${input.businessJustification},
          ${input.urgency},
          ${input.department || null},
          ${input.useCase || null},
          ${redundancyDetected},
          ${redundantWithSoftwareIds},
          ${JSON.stringify(suggestedAlternatives)}
        )
        RETURNING id
      `;

      const requestId = result.rows[0].id;

      // Get bot configuration
      const botConfig = await sql`
        SELECT platform, enabled, slack_channel_approvals, teams_channel_approvals
        FROM bot_configurations
        WHERE company_id = ${input.companyId}
      `;

      // Send notification if bot is configured
      if (botConfig.rows.length > 0 && botConfig.rows[0].enabled) {
        const config = botConfig.rows[0];
        const notificationResult = await NotificationService.sendSoftwareRequest(
          {
            id: requestId,
            softwareName: input.softwareName,
            requestedBy: input.requestedByName,
            estimatedCost: input.estimatedAnnualCost || 0,
            justification: input.businessJustification,
            urgency: input.urgency
          },
          {
            platform: config.platform,
            channel: config.slack_channel_approvals || config.teams_channel_approvals
          }
        );

        // Update request with notification IDs
        await sql`
          UPDATE software_requests
          SET
            notification_sent = true,
            slack_message_ts = ${notificationResult.slackTs || null},
            teams_message_id = ${notificationResult.teamsId || null}
          WHERE id = ${requestId}
        `;

        // Log notification history
        await sql`
          INSERT INTO notification_history (
            company_id,
            platform,
            notification_type,
            title,
            message,
            channel,
            status,
            slack_message_ts,
            teams_message_id,
            related_entity_type,
            related_entity_id,
            sent_at
          ) VALUES (
            ${input.companyId},
            ${config.platform},
            'software_request',
            ${'New Software Request: ' + input.softwareName},
            ${input.requestedByName + ' has requested approval'},
            ${config.slack_channel_approvals || config.teams_channel_approvals || null},
            'sent',
            ${notificationResult.slackTs || null},
            ${notificationResult.teamsId || null},
            'software_request',
            ${requestId},
            NOW()
          )
        `;
      }

      return {
        success: true,
        requestId: requestId
      };
    } catch (error) {
      console.error('Create request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process an approval action (approve/reject/comment)
   */
  static async processAction(
    input: ApprovalActionInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Record the action
      await sql`
        INSERT INTO approval_actions (
          company_id,
          software_request_id,
          action,
          actor_user_id,
          actor_name,
          actor_email,
          actor_platform,
          comment,
          suggested_alternative
        ) VALUES (
          ${input.companyId},
          ${input.requestId},
          ${input.action},
          ${input.actorUserId || null},
          ${input.actorName},
          ${input.actorEmail || null},
          ${input.actorPlatform || null},
          ${input.comment || null},
          ${input.suggestedAlternative || null}
        )
      `;

      // Update request status if approved or rejected
      if (input.action === 'approve') {
        await sql`
          UPDATE software_requests
          SET
            status = 'approved',
            approved_by_user_id = ${input.actorUserId || null},
            approved_by_name = ${input.actorName},
            approval_date = NOW()
          WHERE id = ${input.requestId}
        `;

        // TODO: Optionally auto-create the software entry in the portfolio
      } else if (input.action === 'reject') {
        await sql`
          UPDATE software_requests
          SET
            status = 'rejected',
            rejection_reason = ${input.comment || 'Rejected by approver'}
          WHERE id = ${input.requestId}
        `;
      }

      // Add comment if provided
      if (input.comment) {
        await sql`
          INSERT INTO request_comments (
            software_request_id,
            comment_text,
            author_user_id,
            author_name,
            author_email,
            platform
          ) VALUES (
            ${input.requestId},
            ${input.comment},
            ${input.actorUserId || null},
            ${input.actorName},
            ${input.actorEmail || null},
            ${input.actorPlatform || 'web'}
          )
        `;
      }

      return { success: true };
    } catch (error) {
      console.error('Process action error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get pending requests for a company
   */
  static async getPendingRequests(companyId: string) {
    const result = await sql`
      SELECT
        r.*,
        COUNT(c.id) as comment_count,
        COUNT(a.id) as action_count
      FROM software_requests r
      LEFT JOIN request_comments c ON c.software_request_id = r.id
      LEFT JOIN approval_actions a ON a.software_request_id = r.id
      WHERE r.company_id = ${companyId}
        AND r.status = 'pending'
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;

    return result.rows;
  }

  /**
   * Get request details with comments and actions
   */
  static async getRequestDetails(requestId: string) {
    const request = await sql`
      SELECT * FROM software_requests
      WHERE id = ${requestId}
    `;

    if (request.rows.length === 0) {
      return null;
    }

    const comments = await sql`
      SELECT * FROM request_comments
      WHERE software_request_id = ${requestId}
      ORDER BY created_at ASC
    `;

    const actions = await sql`
      SELECT * FROM approval_actions
      WHERE software_request_id = ${requestId}
      ORDER BY created_at DESC
    `;

    return {
      request: request.rows[0],
      comments: comments.rows,
      actions: actions.rows
    };
  }

  /**
   * Detect shadow IT from expense data
   */
  static async detectShadowIT(
    companyId: string,
    detectionData: {
      softwareName: string;
      vendorName?: string;
      estimatedMonthlyCost: number;
      detectedFrom: string;
      detectionMethod: 'expense_scan' | 'user_report' | 'api_integration';
      estimatedUserCount?: number;
    }
  ): Promise<{ success: boolean; detectionId?: string; error?: string }> {
    try {
      // Check if already in portfolio
      const existing = await sql`
        SELECT id FROM software
        WHERE company_id = ${companyId}
          AND LOWER(software_name) = LOWER(${detectionData.softwareName})
      `;

      if (existing.rows.length > 0) {
        // Not shadow IT, already tracked
        return {
          success: false,
          error: 'Software already in portfolio'
        };
      }

      // Calculate risk level based on cost and unknown vendor
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      const riskFactors: string[] = [];

      if (detectionData.estimatedMonthlyCost > 1000) {
        riskLevel = 'high';
        riskFactors.push('High cost');
      }
      if (detectionData.estimatedMonthlyCost > 5000) {
        riskLevel = 'critical';
      }
      if (!detectionData.vendorName) {
        riskFactors.push('Unknown vendor');
        riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
      }

      riskFactors.push('No contract', 'Potential security concern', 'Unapproved purchase');

      // Create shadow IT detection
      const result = await sql`
        INSERT INTO shadow_it_detections (
          company_id,
          software_name,
          vendor_name,
          detection_method,
          detected_from,
          detection_confidence,
          estimated_monthly_cost,
          estimated_user_count,
          risk_level,
          risk_factors
        ) VALUES (
          ${companyId},
          ${detectionData.softwareName},
          ${detectionData.vendorName || null},
          ${detectionData.detectionMethod},
          ${detectionData.detectedFrom},
          'high',
          ${detectionData.estimatedMonthlyCost},
          ${detectionData.estimatedUserCount || null},
          ${riskLevel},
          ${JSON.stringify(riskFactors)}
        )
        RETURNING id
      `;

      const detectionId = result.rows[0].id;

      // Get bot configuration and send alert
      const botConfig = await sql`
        SELECT platform, enabled, slack_channel_alerts, teams_channel_alerts
        FROM bot_configurations
        WHERE company_id = ${companyId}
      `;

      if (botConfig.rows.length > 0 && botConfig.rows[0].enabled) {
        const config = botConfig.rows[0];
        const notificationResult = await NotificationService.sendShadowITAlert(
          {
            id: detectionId,
            softwareName: detectionData.softwareName,
            vendorName: detectionData.vendorName,
            estimatedCost: detectionData.estimatedMonthlyCost,
            riskLevel: riskLevel,
            detectedFrom: detectionData.detectedFrom
          },
          {
            platform: config.platform,
            channel: config.slack_channel_alerts || config.teams_channel_alerts
          }
        );

        // Update detection with notification IDs
        await sql`
          UPDATE shadow_it_detections
          SET
            notification_sent = true,
            slack_message_ts = ${notificationResult.slackTs || null},
            teams_message_id = ${notificationResult.teamsId || null}
          WHERE id = ${detectionId}
        `;
      }

      return {
        success: true,
        detectionId: detectionId
      };
    } catch (error) {
      console.error('Shadow IT detection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
