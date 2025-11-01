import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    );
  }

  // TODO: Implement database query
  const software = [
    {
      software_id: "sf-001",
      company_id: companyId,
      software_name: "Salesforce",
      vendor_name: "Salesforce Inc",
      category: "CRM",
      total_annual_cost: 120000,
      total_licenses: 100,
      active_users: 75,
      utilization_rate: 75,
      license_type: "per_user",
      renewal_date: new Date("2025-06-30"),
      contract_status: "active",
    },
  ];

  return NextResponse.json(software);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Validate and insert into database

    return NextResponse.json(
      { message: "Software added successfully", software_id: "new-software-id" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add software" },
      { status: 500 }
    );
  }
}
