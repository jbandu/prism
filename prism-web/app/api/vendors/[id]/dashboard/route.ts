import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { getVendorById, getVendorBySlug, getVendorDashboardMetrics } from "@/lib/vendor-db-utils";
import type { ApiResponse } from "@/types";

// Helper to check if ID is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/vendors/[id]/dashboard - Get vendor dashboard metrics
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

    // Check access - admin or vendor user
    const userRole = (session.user as any).role;
    const userVendorId = (session.user as any).vendorId;

    const hasAccess =
      isAdmin(session.user as any) ||
      ((userRole === "vendor_admin" || userRole === "vendor_member") &&
        userVendorId === vendor.id);

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Cannot access this vendor" },
        { status: 403 }
      );
    }

    const metrics = await getVendorDashboardMetrics(vendor.id);

    if (!metrics) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Failed to fetch dashboard metrics" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        vendor,
        metrics,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor dashboard:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
