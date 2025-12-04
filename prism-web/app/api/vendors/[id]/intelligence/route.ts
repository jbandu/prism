import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import {
  getVendorById,
  getVendorBySlug,
  getVendorMarketIntelligence,
  getVendorBadges,
} from "@/lib/vendor-db-utils";
import type { ApiResponse } from "@/types";

// Helper to check if ID is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/vendors/[id]/intelligence - Get market intelligence for vendor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    // Get vendor
    let vendor;
    if (isUUID(id)) {
      vendor = await getVendorById(id);
    } else {
      vendor = await getVendorBySlug(id);
    }

    if (!vendor) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check access
    const userRole = (session.user as any).role;
    const userVendorId = (session.user as any).vendorId;

    const hasAccess =
      isAdmin(session.user as any) ||
      ((userRole === "vendor_admin" || userRole === "vendor_member") &&
        userVendorId === vendor.id);

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Cannot access this vendor's intelligence" },
        { status: 403 }
      );
    }

    // Check subscription tier for market intelligence access
    if (vendor.subscription_tier === "free" || vendor.subscription_tier === "growth") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Upgrade required",
          message: "Market Intelligence requires Pro subscription or higher",
        },
        { status: 403 }
      );
    }

    // Get market intelligence and badges
    const [intelligence, badges] = await Promise.all([
      getVendorMarketIntelligence(vendor.id, category),
      getVendorBadges(vendor.id),
    ]);

    // If no intelligence data exists, return a placeholder structure
    const marketData = intelligence || {
      vendor_id: vendor.id,
      category: vendor.category || "Unknown",
      market_share_prism: null,
      market_rank: null,
      top_competitors: [],
      win_loss_data: { wins: { total: 0, from_competitors: {} }, losses: { total: 0, to_competitors: {} } },
      avg_price_per_user: null,
      price_percentile: null,
      typical_discount_rate: null,
      avg_customer_satisfaction: null,
      avg_utilization_rate: null,
      churn_rate_prism: null,
      net_promoter_score: null,
      adoption_trend: "stable",
      adoption_growth_rate: null,
      evaluation_frequency: null,
      most_valued_features: [],
      feature_gaps: [],
      calculated_at: new Date(),
      data_points_count: 0,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        vendor,
        intelligence: marketData,
        badges,
        insights: generateInsights(marketData, vendor),
      },
    });
  } catch (error) {
    console.error("Error fetching vendor intelligence:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate actionable insights from market data
function generateInsights(intelligence: any, vendor: any): string[] {
  const insights: string[] = [];

  // Market position insights
  if (intelligence.market_rank) {
    if (intelligence.market_rank <= 3) {
      insights.push(`You're a market leader, ranked #${intelligence.market_rank} in your category among PRISM clients.`);
    } else if (intelligence.market_rank <= 10) {
      insights.push(`You're in the top 10 vendors in your category. Focus on differentiation to move up.`);
    }
  }

  // Pricing insights
  if (intelligence.price_percentile) {
    if (intelligence.price_percentile >= 80) {
      insights.push("Your pricing is in the premium tier. Emphasize value and ROI in your messaging.");
    } else if (intelligence.price_percentile <= 20) {
      insights.push("Your competitive pricing is an advantage. Highlight cost savings in campaigns.");
    }
  }

  // Churn insights
  if (intelligence.churn_rate_prism && intelligence.churn_rate_prism > 15) {
    insights.push("Your churn rate is elevated. Consider proactive retention campaigns for at-risk accounts.");
  }

  // Adoption insights
  if (intelligence.adoption_trend === "growing") {
    insights.push("Your adoption is trending upward. Now is a good time to expand marketing efforts.");
  } else if (intelligence.adoption_trend === "declining") {
    insights.push("Adoption is declining. Review competitive displacement and strengthen value proposition.");
  }

  // Feature gap insights
  if (intelligence.feature_gaps && intelligence.feature_gaps.length > 0) {
    insights.push(`Feature gaps identified: ${intelligence.feature_gaps.slice(0, 3).join(", ")}. Consider addressing these in your roadmap.`);
  }

  // Add default insight if none generated
  if (insights.length === 0) {
    insights.push("Continue monitoring market signals to identify opportunities for growth.");
  }

  return insights;
}
