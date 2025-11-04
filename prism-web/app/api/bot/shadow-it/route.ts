/**
 * Shadow IT Detection API
 * Detect and manage unauthorized software usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ApprovalWorkflow } from '@/lib/messaging/approval-workflow';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const detectionId = searchParams.get('detectionId');
    const status = searchParams.get('status');

    if (!companyId && !detectionId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID or Detection ID is required'
      }, { status: 400 });
    }

    // Get single detection
    if (detectionId) {
      const result = await sql`
        SELECT * FROM shadow_it_detections
        WHERE id = ${detectionId}
      `;

      if (result.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Detection not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: result[0]
      });
    }

    // Get all detections for company
    let query;
    if (status) {
      query = sql`
        SELECT * FROM shadow_it_detections
        WHERE company_id = ${companyId}
          AND status = ${status}
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
        SELECT * FROM shadow_it_detections
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;
    }

    const result = await query;

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get shadow IT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get shadow IT detections'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      softwareName,
      vendorName,
      estimatedMonthlyCost,
      detectedFrom,
      detectionMethod,
      estimatedUserCount
    } = body;

    // Validation
    if (!companyId || !softwareName || !estimatedMonthlyCost || !detectedFrom || !detectionMethod) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const result = await ApprovalWorkflow.detectShadowIT(companyId, {
      softwareName,
      vendorName,
      estimatedMonthlyCost,
      detectedFrom,
      detectionMethod,
      estimatedUserCount
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: result.error === 'Software already in portfolio' ? 409 : 500 });
    }

    // Get the created detection
    const created = await sql`
      SELECT * FROM shadow_it_detections
      WHERE id = ${result.detectionId}
    `;

    return NextResponse.json({
      success: true,
      data: created[0],
      message: 'Shadow IT detection created successfully'
    });
  } catch (error) {
    console.error('Create shadow IT detection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create shadow IT detection'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      detectionId,
      status,
      actionTaken,
      assignedToUserId,
      duplicateOfSoftwareId
    } = body;

    if (!detectionId) {
      return NextResponse.json({
        success: false,
        error: 'Detection ID is required'
      }, { status: 400 });
    }

    const updates: any = {};
    if (status) {
      updates.status = status;
      if (status === 'removed' || status === 'approved_retroactive' || status === 'false_positive') {
        updates.resolved_at = new Date().toISOString();
      }
    }
    if (actionTaken) updates.action_taken = actionTaken;
    if (assignedToUserId) updates.assigned_to_user_id = assignedToUserId;
    if (duplicateOfSoftwareId) updates.duplicate_of_software_id = duplicateOfSoftwareId;

    const result = await sql`
      UPDATE shadow_it_detections
      SET
        status = COALESCE(${updates.status || null}, status),
        action_taken = COALESCE(${updates.action_taken || null}, action_taken),
        assigned_to_user_id = COALESCE(${updates.assigned_to_user_id || null}, assigned_to_user_id),
        duplicate_of_software_id = COALESCE(${updates.duplicate_of_software_id || null}, duplicate_of_software_id),
        resolved_at = COALESCE(${updates.resolved_at || null}, resolved_at),
        updated_at = NOW()
      WHERE id = ${detectionId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Detection not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Shadow IT detection updated successfully'
    });
  } catch (error) {
    console.error('Update shadow IT detection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update shadow IT detection'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detectionId = searchParams.get('detectionId');

    if (!detectionId) {
      return NextResponse.json({
        success: false,
        error: 'Detection ID is required'
      }, { status: 400 });
    }

    await sql`
      DELETE FROM shadow_it_detections
      WHERE id = ${detectionId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Shadow IT detection deleted successfully'
    });
  } catch (error) {
    console.error('Delete shadow IT detection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete shadow IT detection'
    }, { status: 500 });
  }
}
