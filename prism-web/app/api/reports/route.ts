import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canAccessCompany } from "@/lib/auth";
import { getReportsByCompany, createReport } from "@/lib/db-utils";
import { createReportSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

// GET /api/reports - List reports for a company
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
        { success: false, error: "companyId query parameter is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, companyId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const reports = await getReportsByCompany(companyId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/reports - Generate new report
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
    const validation = createReportSchema.safeParse(body);
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

    const { company_id, report_type, period_start, period_end } = validation.data;

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Generate report data (in production, this would call the Python report generation agent)
    const reportData = await generateReportData(company_id, report_type);

    // Create report in database
    const report = await createReport({
      company_id,
      report_type,
      report_data: reportData,
      generated_by: (session.user as any).id,
      period_start: new Date(period_start),
      period_end: new Date(period_end),
      total_savings_identified: reportData.total_savings || 0,
      action_items_count: reportData.action_items?.length || 0,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: report,
        message: "Report generated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate report data
async function generateReportData(companyId: string, reportType: string): Promise<any> {
  // In production, this would call the Python report generation agent
  // For now, return mock data based on report type

  const baseData = {
    executive_summary: "Portfolio analysis shows significant optimization opportunities.",
    total_software: 45,
    total_annual_spend: 320000,
    total_savings: 64000,
    savings_percentage: 20,
  };

  switch (reportType) {
    case "executive_summary":
      return {
        ...baseData,
        key_findings: [
          "12 underutilized software subscriptions identified",
          "$64K in immediate savings opportunities",
          "3 high-risk vendor dependencies",
        ],
        action_items: [
          "Review and optimize Salesforce licenses",
          "Evaluate alternatives for Zoom",
          "Renegotiate Adobe contract",
        ],
      };

    case "detailed_analysis":
      return {
        ...baseData,
        software_breakdown: [
          {
            name: "Salesforce",
            cost: 120000,
            utilization: 75,
            savings_opportunity: 15000,
          },
          {
            name: "Adobe Creative Cloud",
            cost: 45000,
            utilization: 60,
            savings_opportunity: 8000,
          },
        ],
        optimization_details: {
          license_optimization: 35000,
          tier_downgrades: 12000,
          contract_renegotiation: 17000,
        },
        action_items: [
          "Implement license usage monitoring",
          "Schedule vendor negotiations",
          "Evaluate alternative solutions",
        ],
      };

    case "quarterly_review":
      return {
        ...baseData,
        quarter_highlights: [
          "Added 3 new software subscriptions",
          "Saved $12K through optimization",
          "Completed 2 vendor migrations",
        ],
        trends: {
          spend_trend: "increasing",
          utilization_trend: "stable",
          risk_trend: "decreasing",
        },
        action_items: [
          "Plan Q2 optimization initiatives",
          "Review upcoming renewals",
          "Update vendor risk assessments",
        ],
      };

    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}
