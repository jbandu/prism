/**
 * Software Requests API
 * Manage software purchase requests and approvals
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ApprovalWorkflow } from '@/lib/messaging/approval-workflow';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const requestId = searchParams.get('requestId');
    const status = searchParams.get('status');

    if (!companyId && !requestId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID or Request ID is required'
      }, { status: 400 });
    }

    // Get single request with details
    if (requestId) {
      const details = await ApprovalWorkflow.getRequestDetails(requestId);

      if (!details) {
        return NextResponse.json({
          success: false,
          error: 'Request not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: details
      });
    }

    // Get all requests for a company
    let query = sql`
      SELECT
        r.*,
        (SELECT COUNT(*) FROM request_comments WHERE software_request_id = r.id) as comment_count,
        (SELECT COUNT(*) FROM approval_actions WHERE software_request_id = r.id) as action_count
      FROM software_requests r
      WHERE r.company_id = ${companyId}
    `;

    if (status) {
      query = sql`
        SELECT
          r.*,
          (SELECT COUNT(*) FROM request_comments WHERE software_request_id = r.id) as comment_count,
          (SELECT COUNT(*) FROM approval_actions WHERE software_request_id = r.id) as action_count
        FROM software_requests r
        WHERE r.company_id = ${companyId}
          AND r.status = ${status}
        ORDER BY r.created_at DESC
      `;
    } else {
      query = sql`
        SELECT
          r.*,
          (SELECT COUNT(*) FROM request_comments WHERE software_request_id = r.id) as comment_count,
          (SELECT COUNT(*) FROM approval_actions WHERE software_request_id = r.id) as action_count
        FROM software_requests r
        WHERE r.company_id = ${companyId}
        ORDER BY r.created_at DESC
      `;
    }

    const result = await query;

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get requests'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      requestedByUserId,
      requestedByName,
      requestedByEmail,
      softwareName,
      vendorName,
      category,
      estimatedAnnualCost,
      licenseCountNeeded,
      businessJustification,
      urgency,
      department,
      useCase
    } = body;

    // Validation
    if (!companyId || !softwareName || !requestedByName || !businessJustification || !urgency) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const result = await ApprovalWorkflow.createRequest({
      companyId,
      requestedByUserId,
      requestedByName,
      requestedByEmail,
      softwareName,
      vendorName,
      category,
      estimatedAnnualCost,
      licenseCountNeeded,
      businessJustification,
      urgency,
      department,
      useCase
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    // Get the created request
    const created = await sql`
      SELECT * FROM software_requests
      WHERE id = ${result.requestId}
    `;

    return NextResponse.json({
      success: true,
      data: created[0],
      message: 'Software request created successfully'
    });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create request'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, status, rejectionReason } = body;

    if (!requestId) {
      return NextResponse.json({
        success: false,
        error: 'Request ID is required'
      }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (rejectionReason) updates.rejection_reason = rejectionReason;

    const result = await sql`
      UPDATE software_requests
      SET
        status = COALESCE(${updates.status || null}, status),
        rejection_reason = COALESCE(${updates.rejection_reason || null}, rejection_reason),
        updated_at = NOW()
      WHERE id = ${requestId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Request not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update request'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({
        success: false,
        error: 'Request ID is required'
      }, { status: 400 });
    }

    await sql`
      DELETE FROM software_requests
      WHERE id = ${requestId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete request'
    }, { status: 500 });
  }
}
