import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canAccessCompany, canModify } from "@/lib/auth";
import { getSoftwareByCompany, createSoftware } from "@/lib/db-utils";
import { createSoftwareSchema, softwareQuerySchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

// GET /api/software - List software for a company
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
    let companyIdParam = searchParams.get('companyId') || '';

    // Check if it's a slug or UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // If it's a slug, resolve to UUID
    if (companyIdParam && !uuidRegex.test(companyIdParam)) {
      const { getCompanyBySlug } = await import('@/lib/db-utils');
      const company = await getCompanyBySlug(companyIdParam);
      if (!company) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Company not found" },
          { status: 404 }
        );
      }
      companyIdParam = company.id;
    }

    const queryParams = {
      ...Object.fromEntries(searchParams.entries()),
      companyId: companyIdParam,
    };

    // Validate query parameters
    const validation = softwareQuerySchema.safeParse(queryParams);
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

    const { companyId, category, search } = validation.data;

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, companyId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const software = await getSoftwareByCompany(companyId, { category, search });

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

// POST /api/software - Add new software
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

    // Validate request body
    const validation = createSoftwareSchema.safeParse(body);
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

    const { company_id } = validation.data;

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Check if user can modify
    if (!canModify(session.user as any, company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Modification not allowed" },
        { status: 403 }
      );
    }

    const software = await createSoftware(validation.data);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: software,
        message: "Software added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating software:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
