import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import {
  getVendorById,
  getVendorBySlug,
  getVendorCampaigns,
  createVendorCampaign,
} from "@/lib/vendor-db-utils";
import { createCampaignSchema } from "@/lib/vendor-validations";
import type { ApiResponse } from "@/types";

// Helper to check if ID is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/vendors/[id]/campaigns - Get vendor's campaigns
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
        { success: false, error: "Forbidden - Cannot access this vendor's campaigns" },
        { status: 403 }
      );
    }

    const campaigns = await getVendorCampaigns(vendor.id);

    // Calculate summary
    const summary = {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "active").length,
      draft: campaigns.filter((c) => c.status === "draft").length,
      completed: campaigns.filter((c) => c.status === "completed").length,
      total_spent: campaigns.reduce((sum, c) => sum + Number(c.budget_spent || 0), 0),
      total_leads: campaigns.reduce((sum, c) => sum + (c.leads_generated || 0), 0),
      total_conversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        campaigns,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor campaigns:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/vendors/[id]/campaigns - Create new campaign
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

    // Check access - only vendor admins can create campaigns
    const userRole = (session.user as any).role;
    const userVendorId = (session.user as any).vendorId;
    const userId = (session.user as any).id;

    const hasAccess = userRole === "vendor_admin" && userVendorId === vendor.id;

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Only vendor admins can create campaigns" },
        { status: 403 }
      );
    }

    // Check subscription tier for campaign creation
    if (vendor.subscription_tier === "free") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Upgrade required",
          message: "Campaign management requires Growth subscription or higher",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Add vendor_id to body
    const campaignData = {
      ...body,
      vendor_id: vendor.id,
    };

    // Validate request body
    const validation = createCampaignSchema.safeParse(campaignData);
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

    // Create campaign
    const campaign = await createVendorCampaign({
      ...validation.data,
      created_by: userId,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: campaign,
        message: "Campaign created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
