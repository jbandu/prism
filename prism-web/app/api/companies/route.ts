import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { getCompanies, createCompany } from "@/lib/db-utils";
import { createCompanySchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

// GET /api/companies - List all companies (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can list all companies
    if (!isAdmin(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const companies = await getCompanies();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create new company (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can create companies
    if (!isAdmin(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createCompanySchema.safeParse(body);
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

    const company = await createCompany(validation.data);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: company,
        message: "Company created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
