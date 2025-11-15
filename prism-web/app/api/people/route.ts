import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

export interface Person {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  department: string | null;
  reports_to_id: string | null;
  level: string | null;
  decision_authority: string | null;
  budget_authority: number | null;
  preferred_contact_method: string | null;
  timezone: string | null;
  linkedin_url: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// GET /api/people - Get all people for a company
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
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    const user = session.user as any;
    if (user.role !== "admin" && user.companyId !== companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const people = await sql`
      SELECT
        p.*,
        m.full_name as manager_name
      FROM people p
      LEFT JOIN people m ON p.reports_to_id = m.id
      WHERE p.company_id = ${companyId}
      ORDER BY
        CASE p.level
          WHEN 'Executive' THEN 1
          WHEN 'Director' THEN 2
          WHEN 'Manager' THEN 3
          ELSE 4
        END,
        p.full_name
    `;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: people,
    });
  } catch (error) {
    console.error("Error fetching people:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/people - Create a new person
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as any;
    const body = await request.json();

    const {
      companyId,
      full_name,
      email,
      phone,
      title,
      department,
      reports_to_id,
      level,
      decision_authority,
      budget_authority,
      preferred_contact_method,
      timezone,
      linkedin_url,
      notes,
    } = body;

    // Verify user has access to this company
    if (user.role !== "admin" && user.companyId !== companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!companyId || !full_name) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company ID and full name are required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO people (
        company_id,
        full_name,
        email,
        phone,
        title,
        department,
        reports_to_id,
        level,
        decision_authority,
        budget_authority,
        preferred_contact_method,
        timezone,
        linkedin_url,
        notes
      )
      VALUES (
        ${companyId},
        ${full_name},
        ${email || null},
        ${phone || null},
        ${title || null},
        ${department || null},
        ${reports_to_id || null},
        ${level || null},
        ${decision_authority || null},
        ${budget_authority || null},
        ${preferred_contact_method || null},
        ${timezone || null},
        ${linkedin_url || null},
        ${notes || null}
      )
      RETURNING *
    `;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: result[0],
        message: "Person created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating person:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
