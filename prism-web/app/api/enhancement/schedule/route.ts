import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateEnhancementSchedule, getEnhancementSchedule } from '@/lib/enhancement/agent';

export const runtime = 'nodejs';

/**
 * GET - Get enhancement schedule for a company
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    const schedule = await getEnhancementSchedule(companyId);

    if (!schedule) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          message: 'No schedule configured. Enhancement is disabled.',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

/**
 * POST - Configure enhancement schedule for a company
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, enabled, fields_to_enhance, ai_provider, run_day_of_week, run_hour } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    await updateEnhancementSchedule(companyId, {
      enabled,
      fields_to_enhance,
      ai_provider,
      run_day_of_week,
      run_hour,
    });

    const schedule = await getEnhancementSchedule(companyId);

    return NextResponse.json({
      success: true,
      data: schedule,
      message: enabled
        ? `Weekly enhancement scheduled for ${getDayName(run_day_of_week || 1)} at ${run_hour || 2}:00`
        : 'Weekly enhancement disabled',
    });
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Disable enhancement schedule for a company
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    await updateEnhancementSchedule(companyId, {
      enabled: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Weekly enhancement disabled',
    });
  } catch (error) {
    console.error('Failed to disable schedule:', error);
    return NextResponse.json(
      { error: 'Failed to disable schedule' },
      { status: 500 }
    );
  }
}

function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || 'Unknown';
}
