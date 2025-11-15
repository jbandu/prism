// app/api/admin/features/approve/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { featureQueries } from '@/lib/db';
import { sendUserNotification } from '@/lib/notifications';
import type { ApproveFeatureBody } from '@/types/features';

export async function POST(req: Request) {
  try {
    // Require admin authentication
    const admin = await requireAdmin(req);
    
    // Parse request body
    const body: ApproveFeatureBody = await req.json();
    
    // Validate input
    if (!body.requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get feature request
    const feature = await featureQueries.findById(body.requestId);
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    if (feature.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Feature request is not in submitted status' },
        { status: 400 }
      );
    }

    // Approve the feature request
    await featureQueries.approve(body.requestId, admin.id);

    // Notify the user who requested it
    await sendUserNotification({
      userId: feature.requested_by_user_id,
      type: 'feature_approved',
      subject: '✅ Your feature request was approved!',
      message: `Great news! Your feature request "${feature.initial_request.substring(0, 50)}..." has been approved and will be built soon.`,
      featureId: body.requestId,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Feature request approved successfully',
    });

  } catch (error) {
    console.error('Error approving feature request:', error);
    
    if (error.message === 'Unauthorized' || error.message.includes('Admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to approve feature request' },
      { status: 500 }
    );
  }
}
