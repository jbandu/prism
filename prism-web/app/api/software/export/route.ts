/**
 * API Route: Export Software Data to CSV
 * GET /api/software/export?companyId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, canAccessCompany } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let companyIdParam = searchParams.get('companyId');

    if (!companyIdParam) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Check if it's a slug or UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let companyId = companyIdParam;
    let companyName = '';

    // If it's a slug, resolve to UUID
    if (!uuidRegex.test(companyIdParam)) {
      const companyResult = await sql`
        SELECT id, company_name FROM companies WHERE slug = ${companyIdParam}
      `;

      if (companyResult.length === 0) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      companyId = companyResult[0].id;
      companyName = companyResult[0].company_name;
    } else {
      const companyResult = await sql`
        SELECT company_name FROM companies WHERE id = ${companyId}
      `;
      companyName = companyResult[0]?.company_name || 'Company';
    }

    // Verify user has access
    if (!canAccessCompany(session.user as any, companyId)) {
      return NextResponse.json({ error: 'Forbidden - Access denied' }, { status: 403 });
    }

    // Fetch all software data with flattened structure
    const software = await sql`
      SELECT
        s.software_name as "Software Name",
        s.vendor_name as "Vendor",
        s.category as "Category",
        s.subcategory as "Subcategory",
        s.license_type as "License Type",
        COALESCE(s.total_annual_cost, 0) as "Annual Cost",
        COALESCE(s.cost_per_user, 0) as "Cost Per User",
        COALESCE(s.total_licenses, 0) as "Total Licenses",
        COALESCE(s.active_users, 0) as "Active Users",
        COALESCE(s.utilization_rate, 0) as "Utilization Rate (%)",
        COALESCE(s.total_licenses - s.active_users, 0) as "Unused Licenses",
        COALESCE(s.waste_amount, 0) as "Waste Amount",
        COALESCE(s.potential_savings, 0) as "Potential Savings",

        s.contract_start_date as "Contract Start",
        s.contract_end_date as "Contract End",
        s.renewal_date as "Renewal Date",
        s.days_to_renewal as "Days to Renewal",
        CASE WHEN s.auto_renewal THEN 'Yes' ELSE 'No' END as "Auto-Renewal",
        s.notice_period_days as "Notice Period (Days)",
        s.contract_status as "Contract Status",
        s.payment_frequency as "Payment Frequency",

        s.business_owner as "Business Owner",
        s.technical_owner as "Technical Owner",
        s.vendor_contact_name as "Vendor Contact Name",
        s.vendor_contact_email as "Vendor Contact Email",

        s.deployment_type as "Deployment Type",
        s.primary_use_case as "Primary Use Case",
        s.integration_complexity as "Integration Complexity",
        CASE WHEN s.api_available THEN 'Yes' ELSE 'No' END as "API Available",

        s.business_criticality as "Business Criticality",
        s.replacement_priority as "Replacement Priority",
        s.replacement_feasibility_score as "Replacement Feasibility",
        CASE WHEN s.regulatory_requirement THEN 'Yes' ELSE 'No' END as "Regulatory Requirement",

        s.last_used_date as "Last Used Date",
        s.usage_trend as "Usage Trend",
        CASE WHEN s.ai_replacement_candidate THEN 'Yes' ELSE 'No' END as "AI Replacement Candidate",
        CASE WHEN s.ai_augmentation_candidate THEN 'Yes' ELSE 'No' END as "AI Augmentation Candidate",
        s.workflow_automation_potential as "Workflow Automation Potential",

        s.asset_code as "Asset Code",
        s.notes as "Notes",
        s.created_at as "Created Date",
        s.updated_at as "Updated Date"
      FROM software s
      WHERE s.company_id = ${companyId}
        AND s.deleted_at IS NULL
      ORDER BY s.total_annual_cost DESC NULLS LAST, s.software_name
    `;

    if (software.length === 0) {
      return NextResponse.json({ error: 'No software data found' }, { status: 404 });
    }

    // Convert to CSV
    const headers = Object.keys(software[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of software) {
      const values = headers.map(header => {
        const value = row[header];

        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }

        // Format dates
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }

        // Format numbers
        if (typeof value === 'number') {
          return value.toString();
        }

        // Escape strings with commas or quotes
        const stringValue = value.toString();
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      });

      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${companyName.replace(/[^a-z0-9]/gi, '_')}_Software_Portfolio_${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error exporting software data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
