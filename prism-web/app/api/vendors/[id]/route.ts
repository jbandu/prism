import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import {
  getVendorById,
  getVendorBySlug,
  updateVendor,
  deleteVendor,
  verifyVendor,
} from "@/lib/vendor-db-utils";
import { updateVendorSchema } from "@/lib/vendor-validations";
import type { ApiResponse } from "@/types";

// Helper to check if ID is a UUID or slug
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/vendors/[id] - Get single vendor by ID or slug
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

    // Try to get vendor by UUID or slug
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/vendors/[id] - Update vendor
export async function PATCH(
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

    // Get vendor first
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

    // Check if admin or vendor user
    const userRole = (session.user as any).role;
    const userVendorId = (session.user as any).vendorId;

    const canModify =
      isAdmin(session.user as any) ||
      (userRole === "vendor_admin" && userVendorId === vendor.id);

    if (!canModify) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Cannot modify this vendor" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = updateVendorSchema.safeParse(body);
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

    const updatedVendor = await updateVendor(vendor.id, validation.data);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedVendor,
      message: "Vendor updated successfully",
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete vendor (soft delete)
export async function DELETE(
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

    // Only admins can delete vendors
    if (!isAdmin(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get vendor first
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

    const success = await deleteVendor(vendor.id);

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Failed to delete vendor" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
