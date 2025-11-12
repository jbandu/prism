import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET - Fetch AI provider configuration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await sql`
      SELECT *
      FROM ai_provider_config
      ORDER BY task_type
    `;

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Failed to fetch AI config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update AI provider configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { task_type, provider, model, temperature, max_tokens, enabled } = body;

    if (!task_type || !provider) {
      return NextResponse.json(
        { error: 'task_type and provider are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO ai_provider_config (
        task_type,
        provider,
        model,
        temperature,
        max_tokens,
        enabled,
        updated_at
      ) VALUES (
        ${task_type},
        ${provider},
        ${model || null},
        ${temperature ?? 0},
        ${max_tokens || 4096},
        ${enabled ?? true},
        NOW()
      )
      ON CONFLICT (task_type)
      DO UPDATE SET
        provider = EXCLUDED.provider,
        model = EXCLUDED.model,
        temperature = EXCLUDED.temperature,
        max_tokens = EXCLUDED.max_tokens,
        enabled = EXCLUDED.enabled,
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Failed to update AI config:', error);
    return NextResponse.json(
      { error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Reset AI provider configuration for a task type
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get('task_type');

    if (!taskType) {
      return NextResponse.json({ error: 'task_type required' }, { status: 400 });
    }

    await sql`
      DELETE FROM ai_provider_config
      WHERE task_type = ${taskType}
    `;

    return NextResponse.json({
      success: true,
      message: 'Configuration reset to defaults',
    });
  } catch (error) {
    console.error('Failed to delete AI config:', error);
    return NextResponse.json(
      { error: 'Failed to reset configuration' },
      { status: 500 }
    );
  }
}
