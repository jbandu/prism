/**
 * DEV API: Add Logo URL Columns
 * POST /api/dev/add-logo-columns
 *
 * Adds logo_url columns to companies and software tables for caching
 */

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@/lib/db';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('\n📸 Adding logo URL columns to database...\n');

    const results = [];

    // Add logo_url to companies table
    try {
      await sql`
        ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS logo_url TEXT,
        ADD COLUMN IF NOT EXISTS logo_source VARCHAR(50),
        ADD COLUMN IF NOT EXISTS logo_cached_at TIMESTAMPTZ
      `;
      results.push('✅ Added logo columns to companies table');
    } catch (error) {
      results.push('⚠️  Logo columns may already exist in companies table');
      console.error('Error adding logo columns to companies:', error);
    }

    // Add logo_url to software table
    try {
      await sql`
        ALTER TABLE software
        ADD COLUMN IF NOT EXISTS logo_url TEXT,
        ADD COLUMN IF NOT EXISTS logo_source VARCHAR(50),
        ADD COLUMN IF NOT EXISTS logo_cached_at TIMESTAMPTZ
      `;
      results.push('✅ Added logo columns to software table');
    } catch (error) {
      results.push('⚠️  Logo columns may already exist in software table');
      console.error('Error adding logo columns to software:', error);
    }

    // Add logo_url to software_catalog table (for master catalog)
    try {
      await sql`
        ALTER TABLE software_catalog
        ADD COLUMN IF NOT EXISTS logo_url TEXT,
        ADD COLUMN IF NOT EXISTS logo_source VARCHAR(50),
        ADD COLUMN IF NOT EXISTS logo_cached_at TIMESTAMPTZ
      `;
      results.push('✅ Added logo columns to software_catalog table');
    } catch (error) {
      results.push('⚠️  Logo columns may already exist in software_catalog table');
      console.error('Error adding logo columns to software_catalog:', error);
    }

    console.log('\n✅ Logo columns added!\n');

    return NextResponse.json({
      success: true,
      message: 'Logo columns added successfully',
      results: results,
    });
  } catch (error) {
    console.error('❌ Failed to add logo columns:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add logo columns',
      },
      { status: 500 }
    );
  }
}
