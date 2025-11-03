import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

export interface OfficeLocation {
  id: string;
  company_id: string;
  office_name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  employee_count: number;
  is_headquarters: boolean;
  timezone: string | null;
  created_at: Date;
  updated_at: Date;
}

// GET /api/offices - Get all office locations for a company
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
        { success: false, error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    const user = session.user as any;
    if (user.role !== "admin" && user.companyId !== companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const offices = await sql`
      SELECT
        id,
        company_id,
        office_name,
        address,
        city,
        country,
        latitude,
        longitude,
        employee_count,
        is_headquarters,
        timezone,
        created_at,
        updated_at
      FROM office_locations
      WHERE company_id = ${companyId}
      ORDER BY is_headquarters DESC, employee_count DESC
    `;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: offices,
    });
  } catch (error) {
    console.error("Error fetching office locations:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/offices - Create a new office location
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as any;
    const body = await request.json();

    const {
      companyId,
      office_name,
      address,
      city,
      country,
      latitude,
      longitude,
      employee_count,
      is_headquarters,
      timezone,
    } = body;

    // Verify user has access to this company
    if (user.role !== "admin" && user.companyId !== companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!companyId || !office_name || latitude === undefined || longitude === undefined) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO office_locations (
        company_id,
        office_name,
        address,
        city,
        country,
        latitude,
        longitude,
        employee_count,
        is_headquarters,
        timezone
      )
      VALUES (
        ${companyId},
        ${office_name},
        ${address || null},
        ${city || null},
        ${country || null},
        ${latitude},
        ${longitude},
        ${employee_count || 0},
        ${is_headquarters || false},
        ${timezone || null}
      )
      RETURNING *
    `;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: result[0],
        message: "Office location created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating office location:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
