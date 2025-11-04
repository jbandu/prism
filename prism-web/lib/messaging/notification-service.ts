/**
 * Messaging Integration - Notification Service
 *
 * Unified service for sending notifications to Slack and Microsoft Teams
 * Handles message formatting, platform-specific formatting, and error handling
 */

interface SlackMessage {
  text: string;
  blocks?: any[];
  thread_ts?: string;
  channel?: string;
}

interface TeamsMessage {
  type: string;
  attachments: any[];
}

interface NotificationOptions {
  platform: 'slack' | 'teams' | 'both';
  channel?: string;
  threadTs?: string; // For Slack threading
  buttons?: Array<{
    text: string;
    value: string;
    style?: 'primary' | 'danger' | 'default';
  }>;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  color?: 'good' | 'warning' | 'danger' | string;
  footer?: string;
}

export class NotificationService {
  /**
   * Send a notification to configured platform(s)
   */
  static async send(
    title: string,
    message: string,
    options: NotificationOptions
  ): Promise<{ success: boolean; slackTs?: string; teamsId?: string; error?: string }> {
    const results: any = { success: true };

    try {
      if (options.platform === 'slack' || options.platform === 'both') {
        const slackResult = await this.sendToSlack(title, message, options);
        results.slackTs = slackResult.ts;
        if (!slackResult.success) {
          results.success = false;
          results.error = slackResult.error;
        }
      }

      if (options.platform === 'teams' || options.platform === 'both') {
        const teamsResult = await this.sendToTeams(title, message, options);
        results.teamsId = teamsResult.id;
        if (!teamsResult.success) {
          results.success = false;
          results.error = teamsResult.error;
        }
      }

      return results;
    } catch (error) {
      console.error('Notification send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send notification to Slack
   */
  private static async sendToSlack(
    title: string,
    message: string,
    options: NotificationOptions
  ): Promise<{ success: boolean; ts?: string; error?: string }> {
    // In production, this would use the actual Slack Web API
    // For now, we'll simulate the behavior

    const slackMessage: SlackMessage = {
      text: message,
      blocks: this.buildSlackBlocks(title, message, options),
      thread_ts: options.threadTs,
      channel: options.channel
    };

    console.log('📤 Slack message prepared:', JSON.stringify(slackMessage, null, 2));

    // Simulate API call
    // In production: const response = await fetch('https://slack.com/api/chat.postMessage', {...})

    return {
      success: true,
      ts: Date.now().toString() // Simulated timestamp
    };
  }

  /**
   * Send notification to Microsoft Teams
   */
  private static async sendToTeams(
    title: string,
    message: string,
    options: NotificationOptions
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const teamsMessage: TeamsMessage = {
      type: 'message',
      attachments: this.buildTeamsCard(title, message, options)
    };

    console.log('📤 Teams message prepared:', JSON.stringify(teamsMessage, null, 2));

    // Simulate API call
    // In production: webhook post to Teams

    return {
      success: true,
      id: `teams-${Date.now()}` // Simulated ID
    };
  }

  /**
   * Build Slack blocks for rich formatting
   */
  private static buildSlackBlocks(
    title: string,
    message: string,
    options: NotificationOptions
  ): any[] {
    const blocks: any[] = [];

    // Header
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: title,
        emoji: true
      }
    });

    // Message body
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message
      }
    });

    // Fields
    if (options.fields && options.fields.length > 0) {
      const fields = options.fields.map(field => ({
        type: 'mrkdwn',
        text: `*${field.title}*\n${field.value}`
      }));

      blocks.push({
        type: 'section',
        fields: fields
      });
    }

    // Action buttons
    if (options.buttons && options.buttons.length > 0) {
      const elements = options.buttons.map(button => ({
        type: 'button',
        text: {
          type: 'plain_text',
          text: button.text,
          emoji: true
        },
        value: button.value,
        style: button.style || 'default',
        action_id: `btn_${button.value}`
      }));

      blocks.push({
        type: 'actions',
        elements: elements
      });
    }

    // Footer
    if (options.footer) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: options.footer
          }
        ]
      });
    }

    return blocks;
  }

  /**
   * Build Microsoft Teams adaptive card
   */
  private static buildTeamsCard(
    title: string,
    message: string,
    options: NotificationOptions
  ): any[] {
    const card: any = {
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.4',
        body: []
      }
    };

    // Title
    card.content.body.push({
      type: 'TextBlock',
      text: title,
      weight: 'bolder',
      size: 'large',
      wrap: true
    });

    // Message
    card.content.body.push({
      type: 'TextBlock',
      text: message,
      wrap: true,
      spacing: 'medium'
    });

    // Fields
    if (options.fields && options.fields.length > 0) {
      const factSet = {
        type: 'FactSet',
        facts: options.fields.map(field => ({
          title: field.title,
          value: field.value
        }))
      };
      card.content.body.push(factSet);
    }

    // Action buttons
    if (options.buttons && options.buttons.length > 0) {
      card.content.actions = options.buttons.map(button => ({
        type: 'Action.Submit',
        title: button.text,
        data: {
          action: button.value
        },
        style: button.style === 'primary' ? 'positive' : button.style === 'danger' ? 'destructive' : 'default'
      }));
    }

    return [card];
  }

  /**
   * Send budget alert notification
   */
  static async sendBudgetAlert(
    companyId: string,
    alertData: {
      title: string;
      description: string;
      currentAmount: number;
      thresholdAmount: number;
      overageAmount: number;
      softwareName?: string;
      severity: string;
    },
    config: { platform: 'slack' | 'teams' | 'both'; channel?: string }
  ) {
    const color = alertData.severity === 'critical' ? 'danger' : alertData.severity === 'high' ? 'warning' : 'good';
    const emoji = alertData.severity === 'critical' ? '🚨' : alertData.severity === 'high' ? '⚠️' : 'ℹ️';

    return await this.send(
      `${emoji} ${alertData.title}`,
      alertData.description,
      {
        platform: config.platform,
        channel: config.channel,
        color: color,
        fields: [
          {
            title: 'Current Amount',
            value: `$${alertData.currentAmount.toLocaleString()}`,
            short: true
          },
          {
            title: 'Threshold',
            value: `$${alertData.thresholdAmount.toLocaleString()}`,
            short: true
          },
          {
            title: 'Overage',
            value: `$${alertData.overageAmount.toLocaleString()}`,
            short: true
          },
          ...(alertData.softwareName ? [{
            title: 'Software',
            value: alertData.softwareName,
            short: true
          }] : [])
        ],
        footer: `Prism • Budget Alert • ${new Date().toLocaleDateString()}`
      }
    );
  }

  /**
   * Send software request notification with approval buttons
   */
  static async sendSoftwareRequest(
    requestData: {
      id: string;
      softwareName: string;
      requestedBy: string;
      estimatedCost: number;
      justification: string;
      urgency: string;
    },
    config: { platform: 'slack' | 'teams' | 'both'; channel?: string }
  ) {
    const urgencyEmoji = requestData.urgency === 'critical' ? '🔴' : requestData.urgency === 'high' ? '🟠' : '🟢';

    return await this.send(
      `${urgencyEmoji} New Software Request: ${requestData.softwareName}`,
      `${requestData.requestedBy} has requested approval for new software`,
      {
        platform: config.platform,
        channel: config.channel,
        color: 'warning',
        fields: [
          {
            title: 'Software',
            value: requestData.softwareName,
            short: true
          },
          {
            title: 'Requested By',
            value: requestData.requestedBy,
            short: true
          },
          {
            title: 'Estimated Cost',
            value: `$${requestData.estimatedCost.toLocaleString()}/year`,
            short: true
          },
          {
            title: 'Urgency',
            value: requestData.urgency.toUpperCase(),
            short: true
          },
          {
            title: 'Justification',
            value: requestData.justification,
            short: false
          }
        ],
        buttons: [
          {
            text: '✅ Approve',
            value: `approve_${requestData.id}`,
            style: 'primary'
          },
          {
            text: '❌ Reject',
            value: `reject_${requestData.id}`,
            style: 'danger'
          },
          {
            text: '💬 Comment',
            value: `comment_${requestData.id}`
          }
        ],
        footer: `Prism • Software Request • ${new Date().toLocaleDateString()}`
      }
    );
  }

  /**
   * Send shadow IT detection notification
   */
  static async sendShadowITAlert(
    detectionData: {
      id: string;
      softwareName: string;
      vendorName?: string;
      estimatedCost: number;
      riskLevel: string;
      detectedFrom: string;
    },
    config: { platform: 'slack' | 'teams' | 'both'; channel?: string }
  ) {
    return await this.send(
      `🕵️ Shadow IT Detected: ${detectionData.softwareName}`,
      `Unauthorized software usage has been detected in your organization`,
      {
        platform: config.platform,
        channel: config.channel,
        color: 'danger',
        fields: [
          {
            title: 'Software',
            value: detectionData.softwareName,
            short: true
          },
          {
            title: 'Vendor',
            value: detectionData.vendorName || 'Unknown',
            short: true
          },
          {
            title: 'Est. Monthly Cost',
            value: `$${detectionData.estimatedCost.toLocaleString()}`,
            short: true
          },
          {
            title: 'Risk Level',
            value: detectionData.riskLevel.toUpperCase(),
            short: true
          },
          {
            title: 'Detected From',
            value: detectionData.detectedFrom,
            short: false
          }
        ],
        buttons: [
          {
            text: '✅ Approve Retroactively',
            value: `approve_shadow_${detectionData.id}`,
            style: 'primary'
          },
          {
            text: '🔄 Find Alternative',
            value: `alternative_shadow_${detectionData.id}`
          },
          {
            text: '🗑️ Remove',
            value: `remove_shadow_${detectionData.id}`,
            style: 'danger'
          }
        ],
        footer: `Prism • Shadow IT Detection • ${new Date().toLocaleDateString()}`
      }
    );
  }

  /**
   * Send contract renewal reminder
   */
  static async sendRenewalReminder(
    contractData: {
      contractName: string;
      vendorName: string;
      renewalDate: string;
      contractValue: number;
      daysUntilRenewal: number;
    },
    config: { platform: 'slack' | 'teams' | 'both'; channel?: string }
  ) {
    const urgency = contractData.daysUntilRenewal <= 7 ? 'critical' : contractData.daysUntilRenewal <= 30 ? 'high' : 'medium';
    const emoji = urgency === 'critical' ? '🚨' : urgency === 'high' ? '⏰' : '📅';

    return await this.send(
      `${emoji} Contract Renewal: ${contractData.contractName}`,
      `Contract renewal approaching in ${contractData.daysUntilRenewal} days`,
      {
        platform: config.platform,
        channel: config.channel,
        color: urgency === 'critical' ? 'danger' : urgency === 'high' ? 'warning' : 'good',
        fields: [
          {
            title: 'Contract',
            value: contractData.contractName,
            short: true
          },
          {
            title: 'Vendor',
            value: contractData.vendorName,
            short: true
          },
          {
            title: 'Renewal Date',
            value: contractData.renewalDate,
            short: true
          },
          {
            title: 'Contract Value',
            value: `$${contractData.contractValue.toLocaleString()}/year`,
            short: true
          },
          {
            title: 'Days Until Renewal',
            value: `${contractData.daysUntilRenewal} days`,
            short: true
          }
        ],
        footer: `Prism • Contract Renewal • ${new Date().toLocaleDateString()}`
      }
    );
  }

  /**
   * Send waste detection notification
   */
  static async sendWasteAlert(
    wasteData: {
      softwareName: string;
      unusedLicenses: number;
      wastedCost: number;
      utilizationRate: number;
    },
    config: { platform: 'slack' | 'teams' | 'both'; channel?: string }
  ) {
    return await this.send(
      `💸 License Waste Detected: ${wasteData.softwareName}`,
      `You have unused licenses that are costing you money`,
      {
        platform: config.platform,
        channel: config.channel,
        color: 'warning',
        fields: [
          {
            title: 'Software',
            value: wasteData.softwareName,
            short: true
          },
          {
            title: 'Unused Licenses',
            value: wasteData.unusedLicenses.toString(),
            short: true
          },
          {
            title: 'Wasted Cost',
            value: `$${wasteData.wastedCost.toLocaleString()}/year`,
            short: true
          },
          {
            title: 'Utilization Rate',
            value: `${wasteData.utilizationRate.toFixed(0)}%`,
            short: true
          }
        ],
        footer: `Prism • Waste Detection • ${new Date().toLocaleDateString()}`
      }
    );
  }
}
