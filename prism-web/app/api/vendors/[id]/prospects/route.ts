import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import {
  getVendorById,
  getVendorBySlug,
  getVendorProspects,
  createIntroductionRequest,
} from "@/lib/vendor-db-utils";
import { createIntroductionRequestSchema } from "@/lib/vendor-validations";
import type { ApiResponse } from "@/types";

// Helper to check if ID is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/vendors/[id]/prospects - Get vendor's prospects
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
        { success: false, error: "Forbidden - Cannot access this vendor's prospects" },
        { status: 403 }
      );
    }

    // Check subscription tier for prospect access
    if (vendor.subscription_tier === "free" || vendor.subscription_tier === "growth") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Upgrade required",
          message: "Prospect Discovery requires Pro subscription or higher",
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const minIntentScore = searchParams.get("min_intent_score")
      ? parseInt(searchParams.get("min_intent_score")!, 10)
      : undefined;
    const signalType = searchParams.get("signal_type") || undefined;

    const prospects = await getVendorProspects(vendor.id, {
      minIntentScore,
      signalType,
    });

    // Group by intent level
    const summary = {
      total: prospects.length,
      hot: prospects.filter((p) => p.intent_score >= 90).length,
      warm: prospects.filter((p) => p.intent_score >= 60 && p.intent_score < 90).length,
      cool: prospects.filter((p) => p.intent_score < 60).length,
      by_signal_type: {
        active_evaluator: prospects.filter((p) => p.signal_type === "active_evaluator").length,
        competitor_churn_risk: prospects.filter((p) => p.signal_type === "competitor_churn_risk").length,
        renewal_window: prospects.filter((p) => p.signal_type === "renewal_window").length,
        category_interest: prospects.filter((p) => p.signal_type === "category_interest").length,
        icp_match: prospects.filter((p) => p.signal_type === "icp_match").length,
      },
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        prospects,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor prospects:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/vendors/[id]/prospects - Request introduction to a prospect
export async function POST(
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
    const userId = (session.user as any).id;

    const hasAccess =
      (userRole === "vendor_admin" || userRole === "vendor_member") &&
      userVendorId === vendor.id;

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Only vendor users can request introductions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Add vendor_id to body
    const requestData = {
      ...body,
      vendor_id: vendor.id,
    };

    // Validate request body
    const validation = createIntroductionRequestSchema.safeParse(requestData);
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

    // Create introduction request
    const introRequest = await createIntroductionRequest({
      ...validation.data,
      requested_by: userId,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: introRequest,
        message: "Introduction request submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating introduction request:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
