import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

// GET /api/alternatives - Get alternatives for software
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const softwareId = searchParams.get("softwareId");

    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "companyId is required" },
        { status: 400 }
      );
    }

    let query;

    if (softwareId) {
      // Get alternatives for specific software
      query = sql`
        SELECT
          alt.*,
          sw.software_name as original_software_name,
          sw.vendor_name as original_vendor_name,
          sw.total_annual_cost as original_annual_cost
        FROM alternative_solutions alt
        JOIN software sw ON alt.original_software_id = sw.id
        WHERE alt.original_software_id = ${softwareId}
        AND sw.company_id = ${companyId}
        ORDER BY alt.cost_savings_percentage DESC
      `;
    } else {
      // Get all alternatives for company's software
      query = sql`
        SELECT
          alt.*,
          sw.software_name as original_software_name,
          sw.vendor_name as original_vendor_name,
          sw.total_annual_cost as original_annual_cost
        FROM alternative_solutions alt
        JOIN software sw ON alt.original_software_id = sw.id
        WHERE sw.company_id = ${companyId}
        ORDER BY alt.three_year_total_savings DESC NULLS LAST,
                 alt.cost_savings_percentage DESC
      `;
    }

    const alternatives = await query;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: alternatives,
    });
  } catch (error) {
    console.error("Error fetching alternatives:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
