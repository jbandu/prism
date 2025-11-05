/**
 * AI Feature Enrichment API
 * POST - Enrich software portfolio with detailed features using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enrichPortfolioFeatures } from '@/lib/redundancy/ai-feature-enrichment';
import { getCompanyById, getCompanyBySlug } from '@/lib/db-utils';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for AI processing

/**
 * Resolve company slug or UUID to UUID
 */
async function resolveCompanyId(companyIdOrSlug: string): Promise<string> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(companyIdOrSlug)) {
    const company = await getCompanyById(companyIdOrSlug);
    if (!company) {
      throw new Error(`Company not found with ID: ${companyIdOrSlug}`);
    }
    return companyIdOrSlug;
  }

  const company = await getCompanyBySlug(companyIdOrSlug);
  if (!company) {
    throw new Error(`Company not found with slug: ${companyIdOrSlug}`);
  }

  return company.id;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, selectedSoftwareIds, overwriteExisting = false } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    console.log(`\n🚀 Starting AI feature enrichment...`);
    console.log(`   Company: ${companyId}`);
    if (selectedSoftwareIds && selectedSoftwareIds.length > 0) {
      console.log(`   Selected software: ${selectedSoftwareIds.length}`);
    }

    // Run AI enrichment
    const result = await enrichPortfolioFeatures(resolvedCompanyId, {
      overwriteExisting,
      selectedSoftwareIds,
    });

    return NextResponse.json({
      success: true,
      message: `Enriched ${result.processed} software products with ${result.featuresAdded} features`,
      data: result,
    });
  } catch (error) {
    console.error('❌ Feature enrichment failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enrich features',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
