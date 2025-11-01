import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canAccessCompany } from "@/lib/auth";
import { getCompanyDashboardMetrics } from "@/lib/db-utils";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: { id: string };
}

// GET /api/companies/[id]/dashboard - Get company dashboard metrics
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

    const metrics = await getCompanyDashboardMetrics(companyId);

    if (!metrics) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
