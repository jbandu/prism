/**
 * Savings Events API
 * Record and track savings achievements
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ScoringService } from '@/lib/gamification/scoring-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    let query;
    if (eventType) {
      query = sql`
        SELECT *
        FROM savings_events
        WHERE company_id = ${companyId}
          AND event_type = ${eventType}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT *
        FROM savings_events
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    const events = await query;

    // Calculate totals
    const totalAnnual = events.reduce((sum, event) => sum + parseFloat(event.annual_savings || 0), 0);
    const totalMonthly = events.reduce((sum, event) => sum + parseFloat(event.monthly_savings || 0), 0);

    // Group by type
    const byType = events.reduce((acc: any, event: any) => {
      const type = event.event_type;
      if (!acc[type]) {
        acc[type] = { count: 0, savings: 0, events: [] };
      }
      acc[type].count++;
      acc[type].savings += parseFloat(event.annual_savings);
      acc[type].events.push(event);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        events: events,
        totals: {
          annualSavings: totalAnnual,
          monthlySavings: totalMonthly,
          eventCount: events.length
        },
        byType
      }
    });
  } catch (error) {
    console.error('Get savings events error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get savings events'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      eventType,
      annualSavings,
      softwareId,
      softwareName,
      description
    } = body;

    if (!companyId || !eventType || !annualSavings) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: companyId, eventType, annualSavings'
      }, { status: 400 });
    }

    // Record the savings event
    await ScoringService.recordSavingsEvent(
      companyId,
      eventType,
      annualSavings,
      softwareId,
      softwareName,
      description
    );

    return NextResponse.json({
      success: true,
      message: 'Savings event recorded successfully'
    });
  } catch (error) {
    console.error('Record savings event error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record savings event'
    }, { status: 500 });
  }
}
