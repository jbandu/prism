import { NextRequest, NextResponse } from 'next/server';
import { runScheduledEnhancements } from '@/lib/enhancement/agent';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

/**
 * Cron endpoint for scheduled data enhancement
 * Called by Vercel Cron or external scheduler
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/enhance",
 *     "schedule": "0 2 * * 1"  // Every Monday at 2 AM
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request - invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 Starting weekly data enhancement job...');

    const result = await runScheduledEnhancements();

    console.log('✅ Weekly enhancement job complete');
    console.log(`   - Companies processed: ${result.total_companies}`);
    console.log(`   - Successful: ${result.successful}`);
    console.log(`   - Failed: ${result.failed}`);

    // Send summary to monitoring/logging service (optional)
    if (result.failed > 0) {
      console.warn(`⚠️  ${result.failed} companies failed to enhance`);
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Enhanced ${result.successful}/${result.total_companies} companies`,
    });
  } catch (error) {
    console.error('❌ Cron enhancement job failed:', error);

    // Still return 200 to prevent Vercel from retrying
    // Log the error for monitoring instead
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}

/**
 * POST - Manual trigger (same as GET for flexibility)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
