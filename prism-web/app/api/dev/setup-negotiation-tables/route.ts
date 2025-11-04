/**
 * DEV API: Setup Negotiation Tables
 * POST /api/dev/setup-negotiation-tables
 *
 * Creates database tables for AI-powered negotiation assistant
 */

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('\n💼 Setting up negotiation assistant tables...\n');

    const results = [];

    // Create negotiation_playbooks table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS negotiation_playbooks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

          -- Market Intelligence
          market_average_price DECIMAL(15,2),
          market_discount_range_min INTEGER,
          market_discount_range_max INTEGER,
          competitor_alternatives JSONB,
          pricing_trends TEXT,

          -- Your Leverage Points
          utilization_rate DECIMAL(5,2),
          unused_licenses INTEGER,
          contract_length_years INTEGER,
          total_spent_to_date DECIMAL(15,2),
          payment_history_score INTEGER,

          -- Negotiation Strategy
          recommended_target_discount INTEGER,
          confidence_level VARCHAR(20),
          leverage_points JSONB,
          risks JSONB,
          talking_points JSONB,

          -- Email Templates
          email_initial_outreach TEXT,
          email_counter_offer TEXT,
          email_final_push TEXT,
          email_alternative_threat TEXT,

          -- Metadata
          generated_at TIMESTAMPTZ DEFAULT NOW(),
          generated_by UUID REFERENCES users(id),
          ai_model_version VARCHAR(50),
          status VARCHAR(50) DEFAULT 'draft',

          -- Tracking
          negotiation_started_at TIMESTAMPTZ,
          negotiation_completed_at TIMESTAMPTZ,

          UNIQUE(software_id, generated_at)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_negotiation_playbooks_company
        ON negotiation_playbooks(company_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_negotiation_playbooks_software
        ON negotiation_playbooks(software_id)
      `;

      results.push('✅ Created negotiation_playbooks table');
    } catch (error) {
      results.push('⚠️  Negotiation playbooks table may already exist');
      console.error('Error creating playbooks table:', error);
    }

    // Create negotiation_outcomes table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS negotiation_outcomes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          playbook_id UUID REFERENCES negotiation_playbooks(id) ON DELETE SET NULL,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

          -- Original vs Achieved
          original_annual_cost DECIMAL(15,2) NOT NULL,
          negotiated_annual_cost DECIMAL(15,2) NOT NULL,
          annual_savings DECIMAL(15,2) NOT NULL,
          discount_achieved INTEGER NOT NULL,

          -- Details
          negotiation_tactics_used JSONB,
          vendor_response TEXT,
          final_terms JSONB,

          -- Success Metrics
          negotiation_duration_days INTEGER,
          success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
          notes TEXT,

          -- Metadata
          achieved_at TIMESTAMPTZ DEFAULT NOW(),
          recorded_by UUID REFERENCES users(id),

          -- New Contract Terms
          new_renewal_date DATE,
          new_contract_length_years INTEGER,
          new_payment_terms VARCHAR(100)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_negotiation_outcomes_company
        ON negotiation_outcomes(company_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_negotiation_outcomes_software
        ON negotiation_outcomes(software_id)
      `;

      results.push('✅ Created negotiation_outcomes table');
    } catch (error) {
      results.push('⚠️  Negotiation outcomes table may already exist');
      console.error('Error creating outcomes table:', error);
    }

    // Create negotiation_market_data table (for caching market intelligence)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS negotiation_market_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          software_name VARCHAR(255) NOT NULL,
          vendor_name VARCHAR(255) NOT NULL,

          -- Pricing Intelligence
          average_price_per_user DECIMAL(15,2),
          price_range_min DECIMAL(15,2),
          price_range_max DECIMAL(15,2),
          typical_discount_range VARCHAR(50),

          -- Market Data
          market_share_percentage DECIMAL(5,2),
          competitor_list JSONB,
          recent_price_changes JSONB,
          seasonal_discount_periods JSONB,

          -- Source & Freshness
          data_source VARCHAR(100),
          data_quality_score INTEGER,
          last_updated TIMESTAMPTZ DEFAULT NOW(),
          next_update_due TIMESTAMPTZ,

          UNIQUE(software_name, vendor_name)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_market_data_software
        ON negotiation_market_data(software_name, vendor_name)
      `;

      results.push('✅ Created negotiation_market_data table');
    } catch (error) {
      results.push('⚠️  Market data table may already exist');
      console.error('Error creating market data table:', error);
    }

    console.log('\n✅ Negotiation assistant tables ready!\n');

    return NextResponse.json({
      success: true,
      message: 'Negotiation assistant tables created successfully',
      results: results,
    });
  } catch (error) {
    console.error('❌ Failed to setup negotiation tables:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to setup tables',
      },
      { status: 500 }
    );
  }
}
