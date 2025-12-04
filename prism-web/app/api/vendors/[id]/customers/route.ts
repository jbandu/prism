import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { getVendorById, getVendorBySlug, getVendorCustomers } from "@/lib/vendor-db-utils";
import type { ApiResponse } from "@/types";

// Helper to check if ID is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/vendors/[id]/customers - Get vendor's customers in PRISM
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

    // Check access - admin or vendor user with view_customers permission
    const userRole = (session.user as any).role;
    const userVendorId = (session.user as any).vendorId;

    const hasAccess =
      isAdmin(session.user as any) ||
      ((userRole === "vendor_admin" || userRole === "vendor_member") &&
        userVendorId === vendor.id);

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Cannot access this vendor's customers" },
        { status: 403 }
      );
    }

    // Check subscription tier for customer access
    if (vendor.subscription_tier === "free") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Upgrade required",
          message: "Customer visibility requires Growth subscription or higher",
        },
        { status: 403 }
      );
    }

    const customers = await getVendorCustomers(vendor.id);

    // Calculate summary metrics
    const summary = {
      total_customers: customers.length,
      avg_health_score: customers.length > 0
        ? Math.round(customers.reduce((sum, c) => sum + c.health_score, 0) / customers.length)
        : 0,
      at_risk_count: customers.filter((c) => c.risk_level === "high").length,
      renewals_next_30: customers.filter((c) => c.days_to_renewal && c.days_to_renewal <= 30).length,
      total_revenue: customers.reduce((sum, c) => sum + c.annual_value, 0),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        customers,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor customers:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
