import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canAccessCompany, canModify } from "@/lib/auth";
import { createAnalysis, getSoftwareById } from "@/lib/db-utils";
import { analyzeRequestSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// POST /api/agents/analyze - Trigger AI agent analysis
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
    const validation = analyzeRequestSchema.safeParse(body);
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

    const { company_id, analysis_type, software_id } = validation.data;

    // Check if user has access to this company
    if (!canAccessCompany(session.user as any, company_id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Check if user can modify (run analyses)
    if (!canModify(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Modification not allowed" },
        { status: 403 }
      );
    }

    // If software_id is provided, verify it exists and belongs to the company
    if (software_id) {
      const software = await getSoftwareById(software_id);
      if (!software || software.company_id !== company_id) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Software not found or does not belong to this company" },
          { status: 404 }
        );
      }
    }

    // Execute Python agent based on analysis type
    let analysisResult: any;
    try {
      analysisResult = await runPythonAgent(analysis_type, software_id);
    } catch (error: any) {
      console.error("Error running Python agent:", error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Analysis failed",
          message: error.message || "Failed to run analysis agent",
        },
        { status: 500 }
      );
    }

    // Store analysis result in database
    const analysis = await createAnalysis({
      company_id,
      software_id,
      analysis_type,
      analysis_data: analysisResult,
      agent_version: "1.0.0",
      confidence_score: analysisResult.confidence_score || 0.8,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: analysis,
        message: "Analysis completed successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in agent analysis:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to run Python agents
async function runPythonAgent(analysisType: string, softwareId?: string): Promise<any> {
  // In production, this would call the Python backend API or run Python scripts
  // For now, return mock data

  // Example: const { stdout } = await execAsync(`python3 ../agents/${analysisType}.py --software-id ${softwareId}`);

  // Mock data for demonstration
  switch (analysisType) {
    case "cost_optimization":
      return {
        license_optimization: {
          current_licenses: 100,
          recommended_licenses: 75,
          licenses_to_remove: 25,
          immediate_savings: 15000,
        },
        tier_optimization: {
          current_tier: "Enterprise",
          recommended_tier: "Professional",
          annual_savings: 8000,
        },
        negotiation_leverage: {
          leverage_points: ["usage decline", "competitive alternatives"],
          target_discount_percentage: 20,
          estimated_savings: 24000,
        },
        total_savings: {
          immediate: 15000,
          annual_recurring: 8000,
          negotiation_potential: 24000,
          total: 47000,
        },
        recommendations: [
          "Reduce licenses from 100 to 75",
          "Downgrade to Professional tier",
          "Negotiate 20% discount at renewal",
        ],
        implementation_steps: [
          "Audit current license usage",
          "Remove inactive users",
          "Contact vendor for tier change",
          "Prepare negotiation materials",
        ],
        confidence_score: 0.85,
      };

    case "alternative_discovery":
      return {
        alternatives: [
          {
            name: "Alternative Solution A",
            vendor: "Vendor A",
            estimated_cost: 60000,
            feature_match_score: 0.92,
            migration_complexity: "medium",
            potential_savings: 25000,
          },
          {
            name: "Alternative Solution B",
            vendor: "Vendor B",
            estimated_cost: 55000,
            feature_match_score: 0.88,
            migration_complexity: "high",
            potential_savings: 30000,
          },
        ],
        confidence_score: 0.78,
      };

    case "vendor_intelligence":
      return {
        vendor_health: {
          financial_score: 0.75,
          market_position: "strong",
          risk_level: "low",
        },
        market_trends: ["pricing increase expected", "new competitors emerging"],
        recommendations: ["Negotiate multi-year contract", "Monitor competitive landscape"],
        confidence_score: 0.80,
      };

    case "full_portfolio":
      return {
        summary: "Full portfolio analysis completed",
        total_optimization_opportunities: 150000,
        high_priority_actions: 12,
        confidence_score: 0.82,
      };

    default:
      throw new Error(`Unknown analysis type: ${analysisType}`);
  }
}
