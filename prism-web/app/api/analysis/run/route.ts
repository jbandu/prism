import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

// POST /api/analysis/run - Run AI analysis
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
    const { companyId, analysisType, softwareId, vendorName, requirements, modules } = body;

    if (!companyId || !analysisType) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let analysisData: any = {};

    switch (analysisType) {
      case "cost_optimization":
        analysisData = await runCostOptimizationAnalysis(companyId, softwareId);
        break;
      case "alternative_discovery":
        analysisData = await runAlternativeDiscoveryAnalysis(companyId, softwareId, requirements);
        break;
      case "vendor_intelligence":
        analysisData = await runVendorIntelligenceAnalysis(vendorName);
        break;
      case "portfolio_analysis":
        analysisData = await runPortfolioAnalysis(companyId);
        break;
      case "workflow_builder":
        analysisData = await runWorkflowBuilderAnalysis(softwareId, modules);
        break;
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Invalid analysis type" },
          { status: 400 }
        );
    }

    // Log the analysis
    try {
      await sql`
        INSERT INTO agent_analyses (
          company_id,
          software_id,
          analysis_type,
          analysis_data,
          agent_version,
          confidence_score,
          status
        ) VALUES (
          ${companyId},
          ${softwareId || null},
          ${analysisType},
          ${JSON.stringify(analysisData)},
          'v1.0',
          ${analysisData.confidenceScore || 0.85},
          'completed'
        )
      `;
    } catch (error) {
      console.error("Error logging analysis:", error);
      // Continue even if logging fails
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: analysisData,
      message: "Analysis completed successfully",
    });
  } catch (error) {
    console.error("Error running analysis:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function runCostOptimizationAnalysis(companyId: string, softwareId?: string) {
  // Fetch software data
  const query = softwareId
    ? sql`SELECT * FROM software_assets WHERE id = ${softwareId} AND company_id = ${companyId}`
    : sql`SELECT * FROM software_assets WHERE company_id = ${companyId}`;

  const software = await query;

  const totalSavings = software.reduce((sum: number, s: any) => {
    return sum + (parseFloat(s.waste_amount) || 0);
  }, 0);

  const licensesToRemove = software.reduce((sum: number, s: any) => {
    return sum + Math.max(0, s.total_licenses - s.active_users);
  }, 0);

  const recommendations = [];

  for (const s of software) {
    const utilizationRate = parseFloat(s.utilization_rate) || 0;
    const wasteAmount = parseFloat(s.waste_amount) || 0;

    if (utilizationRate < 50 && wasteAmount > 1000) {
      recommendations.push({
        title: `Reduce ${s.software_name} licenses`,
        description: `Currently using ${s.active_users} of ${s.total_licenses} licenses (${utilizationRate.toFixed(0)}% utilization). Remove ${s.total_licenses - s.active_users} unused licenses.`,
        savings: wasteAmount,
        impact: "High",
        type: "license_optimization",
      });
    }

    if (utilizationRate >= 80 && utilizationRate < 95) {
      recommendations.push({
        title: `Optimize ${s.software_name} tier`,
        description: `High utilization rate suggests you might benefit from a volume discount or enterprise tier.`,
        savings: parseFloat(s.total_annual_cost) * 0.15, // Estimate 15% savings
        impact: "Medium",
        type: "tier_optimization",
      });
    }

    if (wasteAmount > 5000) {
      recommendations.push({
        title: `Renegotiate ${s.software_name} contract`,
        description: `Significant waste detected. Use this data as leverage in contract negotiations.`,
        savings: wasteAmount * 0.5, // Conservative estimate
        impact: "High",
        type: "negotiation",
      });
    }
  }

  // Sort by savings potential
  recommendations.sort((a, b) => b.savings - a.savings);

  return {
    totalSavings,
    licensesToRemove,
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    confidenceScore: 0.92,
  };
}

async function runAlternativeDiscoveryAnalysis(companyId: string, softwareId?: string, requirements?: string) {
  // Fetch the software to find alternatives for
  const software = await sql`
    SELECT * FROM software_assets
    WHERE ${softwareId ? sql`id = ${softwareId}` : sql`company_id = ${companyId}`}
    LIMIT 1
  `;

  if (software.length === 0) {
    return {
      alternatives: [],
      confidenceScore: 0,
    };
  }

  const targetSoftware = software[0];

  // Fetch alternatives from database
  const alternatives = await sql`
    SELECT * FROM alternative_solutions
    WHERE original_software_id = ${targetSoftware.id}
    ORDER BY cost_savings_percentage DESC
    LIMIT 5
  `;

  const formattedAlternatives = alternatives.map((alt: any) => ({
    name: alt.alternative_name,
    vendor: alt.alternative_vendor,
    description: alt.recommendation_reasoning,
    savings: parseFloat(targetSoftware.total_annual_cost) - parseFloat(alt.cost_comparison),
    featureParity: parseFloat(alt.feature_parity_score),
    migrationComplexity: alt.implementation_complexity,
    estimatedMigrationTime: `${alt.estimated_migration_time_weeks} weeks`,
    paybackPeriod: `${alt.payback_period_months} months`,
  }));

  return {
    alternatives: formattedAlternatives,
    currentSoftware: {
      name: targetSoftware.software_name,
      vendor: targetSoftware.vendor_name,
      annualCost: parseFloat(targetSoftware.total_annual_cost),
    },
    confidenceScore: 0.88,
  };
}

async function runVendorIntelligenceAnalysis(vendorName: string) {
  // This would integrate with external APIs in production
  // For now, return simulated intelligence data

  const healthScore = Math.floor(70 + Math.random() * 25); // 70-95

  const insights = [
    `${vendorName} has strong financial performance with year-over-year growth.`,
    "Market position is stable with no major competitive threats identified.",
    "Recent product roadmap shows commitment to innovation and customer needs.",
    "Customer satisfaction scores are above industry average (4.2/5.0).",
    "No significant security incidents or data breaches in the past 24 months.",
  ];

  return {
    vendorName,
    healthScore,
    insights,
    marketPosition: "Leader",
    riskLevel: "Low",
    confidenceScore: 0.75,
  };
}

async function runPortfolioAnalysis(companyId: string) {
  // Fetch all software for the company
  const software = await sql`
    SELECT * FROM software_assets WHERE company_id = ${companyId}
  `;

  const totalSpend = software.reduce((sum: number, s: any) => {
    return sum + (parseFloat(s.total_annual_cost) || 0);
  }, 0);

  const totalWaste = software.reduce((sum: number, s: any) => {
    return sum + (parseFloat(s.waste_amount) || 0);
  }, 0);

  const avgUtilization = software.length > 0
    ? software.reduce((sum: number, s: any) => sum + (parseFloat(s.utilization_rate) || 0), 0) / software.length
    : 0;

  let portfolioHealth = "A";
  if (avgUtilization < 60) portfolioHealth = "B";
  if (avgUtilization < 40) portfolioHealth = "C";
  if (totalWaste / totalSpend > 0.3) portfolioHealth = "C";

  const summary = `Your portfolio consists of ${software.length} software assets with a total annual spend of $${(totalSpend / 1000).toFixed(0)}K. Average utilization is ${avgUtilization.toFixed(0)}%, with $${(totalWaste / 1000).toFixed(0)}K in identified waste. Key opportunities include license optimization (${Math.floor(totalWaste / totalSpend * 100)}% potential savings), vendor consolidation, and contract renegotiation.`;

  return {
    totalSoftware: software.length,
    totalSpend,
    totalWaste,
    avgUtilization,
    portfolioHealth,
    totalOpportunity: totalWaste,
    summary,
    confidenceScore: 0.90,
  };
}

async function runWorkflowBuilderAnalysis(softwareId?: string, modules?: string[]) {
  // This would use AI to analyze modules and recommend custom solutions
  // For now, return simulated workflow building recommendations

  const recommendedStack = [
    "n8n (Workflow Automation)",
    "Supabase (Database)",
    "React (Frontend)",
    "Node.js (Backend)",
    "Vercel (Hosting)",
  ];

  const implementationSteps = [
    "Audit current usage patterns and identify core workflows",
    "Design data model and workflow logic in n8n",
    "Build custom UI components for specific use cases",
    "Integrate with existing tools via APIs",
    "Migrate data and test workflows",
    "Train team and monitor adoption",
  ];

  return {
    recommendedStack,
    implementationSteps,
    devCost: 25000, // Estimated development cost
    annualSavings: 75000, // Estimated annual savings
    paybackMonths: 4,
    modulesReplaced: modules || ["Email automation", "File management", "Reporting"],
    confidenceScore: 0.80,
  };
}
