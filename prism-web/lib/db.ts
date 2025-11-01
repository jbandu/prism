import { neon } from "@neondatabase/serverless";

// Only require DATABASE_URL at runtime, not build time
const DATABASE_URL = process.env.DATABASE_URL || "";

const sql = DATABASE_URL ? neon(DATABASE_URL) : null as any;

export { sql };

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
