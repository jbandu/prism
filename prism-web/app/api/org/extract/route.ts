import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";
import {
  extractOrgStructure,
  saveOrgStructure,
} from "@/lib/org/extraction-service";

export const maxDuration = 300; // 5 minutes for Claude extraction

// POST /api/org/extract - Extract org structure using Claude AI
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
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    if (user.role !== "admin" && user.companyId !== companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Check if company exists
    const company = await sql`
      SELECT * FROM companies WHERE id = ${companyId}
    `;

    if (company.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // Extract org structure using Claude
    console.log(`Starting org structure extraction for company: ${companyId}`);
    const orgData = await extractOrgStructure(companyId);

    // Save to database
    console.log(`Saving org structure to database...`);
    const result = await saveOrgStructure(companyId, orgData);

    console.log(
      `Org extraction complete: ${result.people_created} people, ${result.stakeholders_created} stakeholders`
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...result,
        org_data: orgData,
      },
      message: `Successfully extracted ${result.people_created} people and ${result.stakeholders_created} stakeholder assignments`,
    });
  } catch (error) {
    console.error("Error extracting org structure:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error during org extraction",
      },
      { status: 500 }
    );
  }
}
