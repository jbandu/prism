/**
 * DEV API: Setup Database Schema
 * POST /api/dev/setup-database
 *
 * Runs all necessary database migrations to set up the schema
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

    console.log('\n🗄️  Setting up database schema...\n');

    const results = [];

    // Step 1: Create basic tables
    console.log('📋 Step 1: Creating core tables...');

    try {
      await sql`
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
      `;

      await sql`
        -- Companies table
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug VARCHAR(100) UNIQUE NOT NULL,
          company_name VARCHAR(200) NOT NULL,
          industry VARCHAR(100),
          employee_count INTEGER,
          primary_contact_name VARCHAR(200),
          primary_contact_email VARCHAR(200),
          contract_status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug)
      `;

      results.push('✅ Companies table created');
    } catch (error) {
      results.push('⚠️  Companies table may already exist');
    }

    try {
      await sql`
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name VARCHAR(200),
          role VARCHAR(50) DEFAULT 'viewer',
          company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `;

      results.push('✅ Users table created');
    } catch (error) {
      results.push('⚠️  Users table may already exist');
    }

    try {
      await sql`
        -- Software table
        CREATE TABLE IF NOT EXISTS software (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          software_name VARCHAR(200) NOT NULL,
          vendor_name VARCHAR(200),
          category VARCHAR(100),
          annual_cost DECIMAL(15,2),
          contract_start_date DATE,
          contract_end_date DATE,
          license_count INTEGER,
          status VARCHAR(50) DEFAULT 'Active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(company_id, software_name)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_software_company ON software(company_id)
      `;

      results.push('✅ Software table created');
    } catch (error) {
      results.push('⚠️  Software table may already exist');
    }

    // Step 2: Create redundancy analysis tables
    console.log('📊 Step 2: Creating redundancy analysis tables...');

    try {
      await sql`
        -- Feature categories
        CREATE TABLE IF NOT EXISTS feature_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category_name VARCHAR(100) NOT NULL UNIQUE,
          parent_category_id UUID REFERENCES feature_categories(id),
          description TEXT,
          icon VARCHAR(50),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      results.push('✅ Feature categories table created');
    } catch (error) {
      results.push('⚠️  Feature categories table may already exist');
    }

    try {
      await sql`
        -- Software catalog
        CREATE TABLE IF NOT EXISTS software_catalog (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          software_name VARCHAR(255) NOT NULL UNIQUE,
          vendor_name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          description TEXT,
          total_features_count INTEGER DEFAULT 0,
          last_updated TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      results.push('✅ Software catalog table created');
    } catch (error) {
      results.push('⚠️  Software catalog table may already exist');
    }

    try {
      await sql`
        -- Software features
        CREATE TABLE IF NOT EXISTS software_features (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          software_catalog_id UUID REFERENCES software_catalog(id) ON DELETE CASCADE,
          feature_category_id UUID REFERENCES feature_categories(id),
          feature_name VARCHAR(255) NOT NULL,
          feature_description TEXT,
          is_core_feature BOOLEAN DEFAULT true,
          requires_premium BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(software_catalog_id, feature_name)
        )
      `;

      results.push('✅ Software features table created');
    } catch (error) {
      results.push('⚠️  Software features table may already exist');
    }

    try {
      await sql`
        -- Software features mapping (for company software)
        CREATE TABLE IF NOT EXISTS software_features_mapping (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          software_id UUID REFERENCES software(id) ON DELETE CASCADE,
          feature_category_id UUID REFERENCES feature_categories(id),
          feature_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(software_id, feature_name)
        )
      `;

      results.push('✅ Software features mapping table created');
    } catch (error) {
      results.push('⚠️  Software features mapping table may already exist');
    }

    try {
      await sql`
        -- Feature overlaps
        CREATE TABLE IF NOT EXISTS feature_overlaps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
          feature_category_id UUID REFERENCES feature_categories(id),
          overlap_count INTEGER NOT NULL,
          software_ids UUID[] NOT NULL,
          redundancy_cost DECIMAL(15,2) DEFAULT 0,
          analysis_date TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      results.push('✅ Feature overlaps table created');
    } catch (error) {
      results.push('⚠️  Feature overlaps table may already exist');
    }

    try {
      await sql`
        -- Consolidation recommendations
        CREATE TABLE IF NOT EXISTS consolidation_recommendations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
          recommendation_type VARCHAR(100) NOT NULL,
          software_to_consolidate UUID[] NOT NULL,
          recommended_solution VARCHAR(255),
          annual_savings DECIMAL(15,2) DEFAULT 0,
          risk_level VARCHAR(50),
          rationale TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      results.push('✅ Consolidation recommendations table created');
    } catch (error) {
      results.push('⚠️  Consolidation recommendations table may already exist');
    }

    // Step 3: Seed default feature categories
    console.log('🌱 Step 3: Seeding feature categories...');

    const categories = [
      'Task Management',
      'Project Planning',
      'Calendar & Scheduling',
      'Workflow Automation',
      'Customization',
      'Document Management',
      'Collaboration',
      'Communication',
      'Integration Hub',
      'Mobile Access',
      'Reporting & Analytics',
      'Templates',
      'Search & Filter',
      'Notifications',
      'Time Tracking',
      'Budget & Finance',
      'Resource Management',
      'CRM Features',
      'Video Conferencing',
      'Other',
    ];

    for (const category of categories) {
      try {
        await sql`
          INSERT INTO feature_categories (category_name)
          VALUES (${category})
          ON CONFLICT (category_name) DO NOTHING
        `;
      } catch (error) {
        // Ignore duplicates
      }
    }

    results.push(`✅ Seeded ${categories.length} feature categories`);

    console.log('\n✅ Database setup complete!\n');

    return NextResponse.json({
      success: true,
      message: 'Database schema setup complete',
      results: results,
    });
  } catch (error) {
    console.error('❌ Database setup failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database setup failed',
      },
      { status: 500 }
    );
  }
}
