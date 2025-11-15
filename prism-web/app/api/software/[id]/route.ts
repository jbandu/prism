import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canAccessCompany, canModify } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  getSoftwareById,
  updateSoftware,
  deleteSoftware,
} from "@/lib/db-utils";
import { updateSoftwareSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: { id: string };
}

// GET /api/software/[id] - Get software details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const softwareId = params.id;
    const software = await getSoftwareById(softwareId);

    if (!software) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Software not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, software.company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: software,
    });
  } catch (error) {
    console.error("Error fetching software:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/software/[id] - Update software
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const softwareId = params.id;
    const existingSoftware = await getSoftwareById(softwareId);

    if (!existingSoftware) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Software not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, existingSoftware.company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Check if user can modify
    if (!canModify(session.user as any, existingSoftware.company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Modification not allowed" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = updateSoftwareSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Validation failed",
          message: validation.error.issues[0]?.message,
        },
        { status: 400 }
      );
    }

    const updatedSoftware = await updateSoftware(softwareId, validation.data);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedSoftware,
      message: "Software updated successfully",
    });
  } catch (error) {
    console.error("Error updating software:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/software/[id] - Delete/Retire software
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const softwareId = params.id;
    const existingSoftware = await getSoftwareById(softwareId);

    if (!existingSoftware) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Software not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, existingSoftware.company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Check if user can modify
    if (!canModify(session.user as any, existingSoftware.company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Modification not allowed" },
        { status: 403 }
      );
    }

    // Get retirement metadata from request body
    let prismAssisted = false;
    let savings = 0;

    try {
      const body = await request.json();
      prismAssisted = body.prismAssisted || false;
      savings = body.savings || 0;
    } catch (e) {
      // Body is optional for backward compatibility
    }

    // If PRISM assisted, log the savings
    if (prismAssisted && savings > 0) {
      try {
        await sql`
          INSERT INTO prism_savings_log (
            company_id,
            software_id,
            software_name,
            vendor_name,
            annual_savings,
            savings_type,
            identified_by,
            created_at
          ) VALUES (
            ${existingSoftware.company_id},
            ${softwareId},
            ${existingSoftware.software_name},
            ${existingSoftware.vendor_name},
            ${savings},
            'retirement',
            'prism',
            NOW()
          )
        `;
      } catch (error) {
        console.error("Error logging PRISM savings:", error);
        // Continue with deletion even if logging fails
      }
    }

    const success = await deleteSoftware(softwareId);

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Failed to delete software" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        prismAssisted,
        savings,
      },
      message: "Software retired successfully",
    });
  } catch (error) {
    console.error("Error deleting software:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
