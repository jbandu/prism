import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Implement database query
  const companies = [
    {
      company_id: "acme-corp",
      company_name: "Acme Corporation",
      industry: "Technology",
      employee_count: 500,
      created_at: new Date("2024-01-01"),
    },
    {
      company_id: "globex",
      company_name: "Globex Industries",
      industry: "Manufacturing",
      employee_count: 1200,
      created_at: new Date("2024-02-15"),
    },
  ];

  return NextResponse.json(companies);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Validate and insert into database

    return NextResponse.json(
      { message: "Company created successfully", company_id: "new-company-id" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
