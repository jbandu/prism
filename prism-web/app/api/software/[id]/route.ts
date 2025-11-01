import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canAccessCompany, canModify } from "@/lib/auth";
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
    if (!canModify(session.user as any)) {
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

// DELETE /api/software/[id] - Delete software
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
    if (!canModify(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Modification not allowed" },
        { status: 403 }
      );
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
      message: "Software deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting software:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
