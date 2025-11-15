import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

export interface Stakeholder {
  id: string;
  software_asset_id: string;
  person_id: string;
  role_type: string;
  role_level: string | null;
  responsibilities: string[] | null;
  decision_weight: number | null;
  engagement_frequency: string | null;
  last_contacted: Date | null;
  created_at: Date;
}

// GET /api/stakeholders - Get all stakeholders (with filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const softwareId = searchParams.get("softwareId");
    const personId = searchParams.get("personId");
    const companyId = searchParams.get("companyId");

    if (!softwareId && !personId && !companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "At least one filter is required (softwareId, personId, or companyId)" },
        { status: 400 }
      );
    }

    let stakeholders;

    if (softwareId) {
      // Get stakeholders for a specific software
      stakeholders = await sql`
        SELECT
          ss.*,
          p.full_name,
          p.email,
          p.title,
          p.department,
          p.level as person_level,
          p.decision_authority,
          rd.display_name as role_display_name,
          rd.role_category,
          s.software_name
        FROM software_stakeholders ss
        JOIN people p ON ss.person_id = p.id
        LEFT JOIN role_definitions rd ON ss.role_type = rd.role_type
        JOIN software s ON ss.software_asset_id = s.id
        WHERE ss.software_asset_id = ${softwareId}
        ORDER BY
          CASE ss.role_type
            WHEN 'executive_sponsor' THEN 1
            WHEN 'business_owner' THEN 2
            WHEN 'it_owner' THEN 3
            WHEN 'procurement_lead' THEN 4
            WHEN 'finance_approver' THEN 5
            WHEN 'security_reviewer' THEN 6
            ELSE 7
          END,
          ss.decision_weight DESC NULLS LAST
      `;
    } else if (personId) {
      // Get all software stakeholder assignments for a person
      stakeholders = await sql`
        SELECT
          ss.*,
          s.software_name,
          s.annual_cost,
          rd.display_name as role_display_name,
          rd.role_category
        FROM software_stakeholders ss
        JOIN software s ON ss.software_asset_id = s.id
        LEFT JOIN role_definitions rd ON ss.role_type = rd.role_type
        WHERE ss.person_id = ${personId}
        ORDER BY s.annual_cost DESC NULLS LAST
      `;
    } else {
      // Get all stakeholders for a company
      stakeholders = await sql`
        SELECT
          ss.*,
          p.full_name,
          p.email,
          p.title,
          s.software_name,
          rd.display_name as role_display_name
        FROM software_stakeholders ss
        JOIN people p ON ss.person_id = p.id
        JOIN software s ON ss.software_asset_id = s.id
        LEFT JOIN role_definitions rd ON ss.role_type = rd.role_type
        WHERE s.company_id = ${companyId}
        ORDER BY s.software_name, p.full_name
      `;
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stakeholders,
    });
  } catch (error) {
    console.error("Error fetching stakeholders:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/stakeholders - Create a new stakeholder assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      software_asset_id,
      person_id,
      role_type,
      role_level,
      responsibilities,
      decision_weight,
      engagement_frequency,
    } = body;

    // Validate required fields
    if (!software_asset_id || !person_id || !role_type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Software ID, Person ID, and Role Type are required" },
        { status: 400 }
      );
    }

    // Verify the software and person exist and user has access
    const verification = await sql`
      SELECT s.company_id
      FROM software s
      JOIN people p ON p.company_id = s.company_id
      WHERE s.id = ${software_asset_id}
        AND p.id = ${person_id}
    `;

    if (verification.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid software or person ID" },
        { status: 400 }
      );
    }

    const user = session.user as any;
    if (user.role !== "admin" && user.companyId !== verification[0].company_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Check for duplicate
    const existing = await sql`
      SELECT id FROM software_stakeholders
      WHERE software_asset_id = ${software_asset_id}
        AND person_id = ${person_id}
        AND role_type = ${role_type}
    `;

    if (existing.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "This stakeholder assignment already exists" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO software_stakeholders (
        software_asset_id,
        person_id,
        role_type,
        role_level,
        responsibilities,
        decision_weight,
        engagement_frequency
      )
      VALUES (
        ${software_asset_id},
        ${person_id},
        ${role_type},
        ${role_level || null},
        ${responsibilities ? JSON.stringify(responsibilities) : null},
        ${decision_weight || null},
        ${engagement_frequency || null}
      )
      RETURNING *
    `;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: result[0],
        message: "Stakeholder added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stakeholder:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
