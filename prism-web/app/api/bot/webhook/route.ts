/**
 * Webhook Handler for Slack/Teams Interactions
 * Handles button clicks and interactive messages from Slack/Teams
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApprovalWorkflow } from '@/lib/messaging/approval-workflow';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');

    // Slack sends payload as form data
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      return await handleSlackWebhook(request);
    }

    // Teams sends JSON
    if (contentType?.includes('application/json')) {
      return await handleTeamsWebhook(request);
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported content type'
    }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}

async function handleSlackWebhook(request: NextRequest) {
  try {
    const formData = await request.text();
    const params = new URLSearchParams(formData);
    const payloadStr = params.get('payload');

    if (!payloadStr) {
      return NextResponse.json({
        success: false,
        error: 'No payload provided'
      }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);

    // Handle different interaction types
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      const actionValue = action.value;

      // Parse action value (format: "action_requestId")
      const [actionType, ...idParts] = actionValue.split('_');
      const entityId = idParts.join('_');

      const user = payload.user;
      const responseUrl = payload.response_url;

      // Process the action based on type
      if (actionType === 'approve' || actionType === 'reject') {
        // Extract company ID from the request
        // In production, you'd store this in the message metadata
        const companyId = payload.team.id; // Using team ID as proxy

        await ApprovalWorkflow.processAction({
          requestId: entityId,
          companyId: companyId,
          action: actionType,
          actorName: user.name || user.username,
          actorEmail: user.email,
          actorPlatform: 'slack'
        });

        // Send confirmation back to Slack
        return NextResponse.json({
          text: `✅ Request ${actionType === 'approve' ? 'approved' : 'rejected'} by ${user.name}`,
          replace_original: false,
          response_type: 'in_channel'
        });
      }

      if (actionType === 'comment') {
        // Open a modal for the user to add a comment
        return NextResponse.json({
          text: 'Please add your comment using the web interface',
          replace_original: false,
          response_type: 'ephemeral'
        });
      }
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Slack webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process Slack webhook'
    }, { status: 500 });
  }
}

async function handleTeamsWebhook(request: NextRequest) {
  try {
    const body = await request.json();

    // Teams adaptive card submissions
    if (body.type === 'message' && body.value) {
      const action = body.value.action;
      const entityId = body.value.requestId || body.value.detectionId;

      const user = body.from;

      // Process the action
      if (action === 'approve' || action === 'reject') {
        // Extract company ID (you'd need to store this in the card data)
        const companyId = body.conversation.tenantId;

        await ApprovalWorkflow.processAction({
          requestId: entityId,
          companyId: companyId,
          action: action,
          actorName: user.name,
          actorEmail: user.email,
          actorPlatform: 'teams'
        });

        // Send confirmation
        return NextResponse.json({
          type: 'message',
          text: `✅ Request ${action === 'approve' ? 'approved' : 'rejected'} by ${user.name}`
        });
      }
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Teams webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process Teams webhook'
    }, { status: 500 });
  }
}
