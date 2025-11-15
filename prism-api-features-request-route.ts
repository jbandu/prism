// app/api/features/request/route.ts

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { featureQueries } from '@/lib/db';
import type { CreateFeatureRequestBody, CreateFeatureRequestResponse } from '@/types/features';

export async function POST(req: Request) {
  try {
    // Authenticate user
    const user = await requireAuth(req);
    
    // Parse request body
    const body: CreateFeatureRequestBody = await req.json();
    
    // Validate input
    if (!body.initialRequest || body.initialRequest.trim().length < 10) {
      return NextResponse.json(
        { error: 'Feature request must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (body.initialRequest.length > 5000) {
      return NextResponse.json(
        { error: 'Feature request too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Create feature request
    const feature = await featureQueries.create({
      requestedByUserId: user.id,
      companyId: user.company_id,
      initialRequest: body.initialRequest.trim(),
    });

    const response: CreateFeatureRequestResponse = {
      featureId: feature.id,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating feature request:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create feature request' },
      { status: 500 }
    );
  }
}
