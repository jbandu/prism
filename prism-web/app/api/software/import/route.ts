import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ApiResponse } from "@/types";

// POST /api/software/import - Import software from CSV
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
    const { companyId, software } = body;

    if (!companyId || !software || !Array.isArray(software)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Validate required fields for each software item
    const requiredFields = [
      "software_name",
      "vendor_name",
      "category",
      "total_annual_cost",
      "total_licenses",
      "active_users",
      "license_type",
      "renewal_date",
    ];

    const validSoftware = software.filter((item: any) => {
      return requiredFields.every((field) => {
        const value = item[field];
        return value !== undefined && value !== null && value !== "";
      });
    });

    if (validSoftware.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No valid software items to import" },
        { status: 400 }
      );
    }

    let imported = 0;
    const errors: string[] = [];

    for (const item of validSoftware) {
      try {
        // Calculate derived fields
        const totalAnnualCost = parseFloat(item.total_annual_cost) || 0;
        const totalLicenses = parseInt(item.total_licenses) || 0;
        const activeUsers = parseInt(item.active_users) || 0;

        const utilizationRate =
          totalLicenses > 0 ? (activeUsers / totalLicenses) * 100 : 0;
        const costPerUser = totalLicenses > 0 ? totalAnnualCost / totalLicenses : 0;
        const unusedLicenses = Math.max(0, totalLicenses - activeUsers);
        const wasteAmount = unusedLicenses * costPerUser;
        const potentialSavings = wasteAmount;

        // Insert or update software
        await sql`
          INSERT INTO software (
            company_id,
            software_name,
            vendor_name,
            category,
            total_annual_cost,
            total_licenses,
            active_users,
            utilization_rate,
            license_type,
            renewal_date,
            contract_start_date,
            contract_end_date,
            cost_per_user,
            waste_amount,
            potential_savings,
            contract_status
          ) VALUES (
            ${companyId},
            ${item.software_name},
            ${item.vendor_name},
            ${item.category},
            ${totalAnnualCost},
            ${totalLicenses},
            ${activeUsers},
            ${utilizationRate},
            ${item.license_type},
            ${item.renewal_date},
            ${item.contract_start_date || null},
            ${item.contract_end_date || null},
            ${costPerUser},
            ${wasteAmount},
            ${potentialSavings},
            'active'
          )
          ON CONFLICT (company_id, software_name, vendor_name)
          DO UPDATE SET
            category = EXCLUDED.category,
            total_annual_cost = EXCLUDED.total_annual_cost,
            total_licenses = EXCLUDED.total_licenses,
            active_users = EXCLUDED.active_users,
            utilization_rate = EXCLUDED.utilization_rate,
            license_type = EXCLUDED.license_type,
            renewal_date = EXCLUDED.renewal_date,
            contract_start_date = EXCLUDED.contract_start_date,
            contract_end_date = EXCLUDED.contract_end_date,
            cost_per_user = EXCLUDED.cost_per_user,
            waste_amount = EXCLUDED.waste_amount,
            potential_savings = EXCLUDED.potential_savings,
            updated_at = NOW()
        `;

        imported++;
      } catch (error: any) {
        console.error(`Error importing ${item.software_name}:`, error);
        errors.push(`${item.software_name}: ${error.message}`);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        imported,
        total: validSoftware.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `Successfully imported ${imported} software items`,
    });
  } catch (error) {
    console.error("Error importing software:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
