import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

// GET /api/people/[id] - Get a single person
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const person = await sql`
      SELECT
        p.*,
        m.full_name as manager_name,
        c.company_name
      FROM people p
      LEFT JOIN people m ON p.reports_to_id = m.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.id = ${params.id}
    `;

    if (person.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Person not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this company
    const user = session.user as any;
    if (user.role !== "admin" && user.companyId !== person[0].company_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: person[0],
    });
  } catch (error) {
    console.error("Error fetching person:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/people/[id] - Update a person
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      is_active,
      notes,
    } = body;

    // Get existing person to verify access
    const existing = await sql`
      SELECT company_id FROM people WHERE id = ${params.id}
    `;

    if (existing.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Person not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this company
    const user = session.user as any;
    if (user.role !== "admin" && user.companyId !== existing[0].company_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const result = await sql`
      UPDATE people
      SET
        full_name = COALESCE(${full_name}, full_name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        title = COALESCE(${title}, title),
        department = COALESCE(${department}, department),
        reports_to_id = ${reports_to_id !== undefined ? reports_to_id : sql`reports_to_id`},
        level = COALESCE(${level}, level),
        decision_authority = COALESCE(${decision_authority}, decision_authority),
        budget_authority = ${budget_authority !== undefined ? budget_authority : sql`budget_authority`},
        preferred_contact_method = COALESCE(${preferred_contact_method}, preferred_contact_method),
        timezone = COALESCE(${timezone}, timezone),
        linkedin_url = COALESCE(${linkedin_url}, linkedin_url),
        is_active = COALESCE(${is_active}, is_active),
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result[0],
      message: "Person updated successfully",
    });
  } catch (error) {
    console.error("Error updating person:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/people/[id] - Delete a person
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing person to verify access
    const existing = await sql`
      SELECT company_id FROM people WHERE id = ${params.id}
    `;

    if (existing.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Person not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this company
    const user = session.user as any;
    if (user.role !== "admin" && user.companyId !== existing[0].company_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Check if person has stakeholder assignments
    const stakeholders = await sql`
      SELECT COUNT(*) as count
      FROM software_stakeholders
      WHERE person_id = ${params.id}
    `;

    if (stakeholders[0].count > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Cannot delete person with ${stakeholders[0].count} stakeholder assignments. Please remove assignments first.`,
        },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM people WHERE id = ${params.id}
    `;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Person deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
