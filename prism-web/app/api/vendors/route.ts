import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { getVendors, createVendor } from "@/lib/vendor-db-utils";
import { createVendorSchema } from "@/lib/vendor-validations";
import type { ApiResponse } from "@/types";

// GET /api/vendors - List all vendors (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can list all vendors
    if (!isAdmin(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const vendors = await getVendors();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create new vendor (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can create vendors
    if (!isAdmin(session.user as any)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createVendorSchema.safeParse(body);
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

    const vendor = await createVendor(validation.data);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: vendor,
        message: "Vendor created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
