/**
 * Approval Actions API
 * Handle approve/reject/comment actions on software requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApprovalWorkflow } from '@/lib/messaging/approval-workflow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requestId,
      companyId,
      action,
      actorUserId,
      actorName,
      actorEmail,
      actorPlatform,
      comment,
      suggestedAlternative
    } = body;

    // Validation
    if (!requestId || !companyId || !action || !actorName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: requestId, companyId, action, actorName'
      }, { status: 400 });
    }

    if (!['approve', 'reject', 'request_info', 'suggest_alternative'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be: approve, reject, request_info, or suggest_alternative'
      }, { status: 400 });
    }

    const result = await ApprovalWorkflow.processAction({
      requestId,
      companyId,
      action,
      actorUserId,
      actorName,
      actorEmail,
      actorPlatform,
      comment,
      suggestedAlternative
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Action '${action}' processed successfully`
    });
  } catch (error) {
    console.error('Process action error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process action'
    }, { status: 500 });
  }
}
