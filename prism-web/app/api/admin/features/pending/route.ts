// app/api/admin/features/pending/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { featureQueries } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Require admin authentication
    await requireAdmin(req);
    
    // Get all pending feature requests
    const requests = await featureQueries.listPending();

    // Transform for frontend
    const formattedRequests = requests.map(request => ({
      id: request.id,
      requestedBy: {
        name: request.requested_by_name,
        email: request.requested_by_email,
        company: request.company_name,
      },
      initialRequest: request.initial_request,
      finalRequirements: request.final_requirements,
      chatHistory: request.chat_history || [],
      status: request.status,
      createdAt: request.created_at,
      estimatedComplexity: request.estimated_complexity,
      tags: request.tags || [],
      upvotes: request.upvotes || 0,
      priority: request.priority,
    }));

    return NextResponse.json({ 
      requests: formattedRequests,
      count: formattedRequests.length,
    });

  } catch (error) {
    console.error('Error fetching pending requests:', error);
    
    if (error.message === 'Unauthorized' || error.message.includes('Admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch pending requests' },
      { status: 500 }
    );
  }
}
