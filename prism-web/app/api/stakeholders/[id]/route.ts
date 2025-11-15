import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

// DELETE /api/stakeholders/[id] - Remove a stakeholder assignment
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

    // Get existing stakeholder to verify access
    const existing = await sql`
      SELECT ss.*, s.company_id
      FROM software_stakeholders ss
      JOIN software s ON ss.software_asset_id = s.id
      WHERE ss.id = ${params.id}
    `;

    if (existing.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Stakeholder assignment not found" },
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

    await sql`
      DELETE FROM software_stakeholders WHERE id = ${params.id}
    `;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Stakeholder removed successfully",
    });
  } catch (error) {
    console.error("Error deleting stakeholder:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/stakeholders/[id] - Update a stakeholder assignment
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
      role_type,
      role_level,
      responsibilities,
      decision_weight,
      engagement_frequency,
      last_contacted,
    } = body;

    // Get existing stakeholder to verify access
    const existing = await sql`
      SELECT ss.*, s.company_id
      FROM software_stakeholders ss
      JOIN software s ON ss.software_asset_id = s.id
      WHERE ss.id = ${params.id}
    `;

    if (existing.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Stakeholder assignment not found" },
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
      UPDATE software_stakeholders
      SET
        role_type = COALESCE(${role_type}, role_type),
        role_level = COALESCE(${role_level}, role_level),
        responsibilities = ${responsibilities !== undefined ? JSON.stringify(responsibilities) : sql`responsibilities`},
        decision_weight = ${decision_weight !== undefined ? decision_weight : sql`decision_weight`},
        engagement_frequency = COALESCE(${engagement_frequency}, engagement_frequency),
        last_contacted = ${last_contacted !== undefined ? last_contacted : sql`last_contacted`}
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result[0],
      message: "Stakeholder updated successfully",
    });
  } catch (error) {
    console.error("Error updating stakeholder:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
