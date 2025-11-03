/**
 * API Route: Extract Features from Software
 * POST /api/redundancy/extract-features
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractFeaturesFromSoftware, saveFeaturesToDatabase } from '@/lib/redundancy/feature-extractor';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { softwareName, vendor, description } = await request.json();

    if (!softwareName || !vendor) {
      return NextResponse.json(
        { error: 'Software name and vendor are required' },
        { status: 400 }
      );
    }

    console.log(`\n🔍 Extracting features for: ${softwareName}`);

    // Extract features using AI
    const extracted = await extractFeaturesFromSoftware(softwareName, vendor, description);

    // Save to database
    const softwareId = await saveFeaturesToDatabase(extracted);

    return NextResponse.json({
      success: true,
      data: {
        softwareId,
        featuresCount: extracted.totalCount,
        features: extracted.features,
        confidenceScore: extracted.confidenceScore,
      },
      message: `Successfully extracted ${extracted.totalCount} features for ${softwareName}`,
    });
  } catch (error) {
    console.error('❌ Feature extraction failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Feature extraction failed',
      },
      { status: 500 }
    );
  }
}
