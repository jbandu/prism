import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canAccessCompany, isAdmin } from "@/lib/auth";
import {
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "@/lib/db-utils";
import { updateCompanySchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: { id: string };
}

// GET /api/companies/[id] - Get company details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const companyId = params.id;

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, companyId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const company = await getCompanyById(companyId);

    if (!company) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Update company
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const companyId = params.id;

    // Only admins can update companies
    if (!isAdmin(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = updateCompanySchema.safeParse(body);
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

    const company = await updateCompany(companyId, validation.data);

    if (!company) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: company,
      message: "Company updated successfully",
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Delete company
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const companyId = params.id;

    // Only admins can delete companies
    if (!isAdmin(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const success = await deleteCompany(companyId);

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
