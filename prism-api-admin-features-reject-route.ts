// app/api/admin/features/reject/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { featureQueries } from '@/lib/db';
import { sendUserNotification } from '@/lib/notifications';
import type { RejectFeatureBody } from '@/types/features';

export async function POST(req: Request) {
  try {
    // Require admin authentication
    const admin = await requireAdmin(req);
    
    // Parse request body
    const body: RejectFeatureBody = await req.json();
    
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

    // Reject the feature request
    await featureQueries.reject(body.requestId, admin.id, body.reason);

    // Notify the user who requested it
    await sendUserNotification({
      userId: feature.requested_by_user_id,
      type: 'feature_rejected',
      subject: 'Feature request update',
      message: `Your feature request "${feature.initial_request.substring(0, 50)}..." was not approved at this time.${body.reason ? `\n\nReason: ${body.reason}` : ''}`,
      featureId: body.requestId,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Feature request rejected',
    });

  } catch (error) {
    console.error('Error rejecting feature request:', error);
    
    if (error.message === 'Unauthorized' || error.message.includes('Admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reject feature request' },
      { status: 500 }
    );
  }
}
