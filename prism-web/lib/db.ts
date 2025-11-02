import { neon } from "@neondatabase/serverless";

// Validate DATABASE_URL is present
if (!process.env.DATABASE_URL) {
  // During build time, this might not be available, so we'll handle it gracefully
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview") {
    console.warn("DATABASE_URL is not set. Database operations will fail.");
  }
}

// Initialize the Neon connection
// The connection will be created lazily when first used
export const sql = neon(process.env.DATABASE_URL || "");

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await sql(text, params);
    return result as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export interface Company {
  company_id: string;
  company_name: string;
  industry: string;
  employee_count: number;
  created_at: Date;
}

export interface Software {
  software_id: string;
  company_id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  total_annual_cost: number;
  total_licenses: number;
  active_users: number;
  utilization_rate: number;
  license_type: string;
  renewal_date: Date;
  contract_status: string;
}

export interface UsageAnalytics {
  usage_id: string;
  software_id: string;
  licenses_purchased: number;
  licenses_active: number;
  utilization_percentage: number;
  daily_active_users: number;
  monthly_active_users: number;
  features_used: number;
  features_available: number;
  waste_amount: number;
  usage_trend: string;
  analysis_date: Date;
}

export interface Alternative {
  alternative_id: string;
  software_id: string;
  alternative_name: string;
  vendor_name: string;
  category: string;
  estimated_annual_cost: number;
  feature_match_score: number;
  feature_comparison: any;
  migration_complexity: string;
  migration_cost: number;
  potential_savings: number;
  recommendation_score: number;
  pros: string[];
  cons: string[];
  analysis_date: Date;
}
