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
  waste_amount?: number;
  potential_savings?: number;
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
  usage_trend: "increasing" | "stable" | "declining";
  analysis_date: Date;
  optimization_savings?: number;
  optimization_recommendations?: string[];
}

export interface Alternative {
  alternative_id: string;
  software_id: string;
  alternative_name: string;
  vendor_name: string;
  category: string;
  estimated_annual_cost: number;
  feature_match_score: number;
  feature_comparison: Record<string, any>;
  migration_complexity: "low" | "medium" | "high";
  migration_cost: number;
  potential_savings: number;
  recommendation_score: number;
  pros: string[];
  cons: string[];
  analysis_date: Date;
}

export interface CostOptimization {
  license_optimization: {
    current_licenses: number;
    recommended_licenses: number;
    licenses_to_remove: number;
    immediate_savings: number;
  };
  tier_optimization: {
    current_tier: string;
    recommended_tier: string;
    annual_savings: number;
  };
  negotiation_leverage: {
    leverage_points: string[];
    target_discount_percentage: number;
    estimated_savings: number;
  };
  total_savings: {
    immediate: number;
    annual_recurring: number;
    negotiation_potential: number;
    total: number;
  };
  recommendations: string[];
  implementation_steps: string[];
}

export interface DashboardMetrics {
  total_software_count: number;
  total_annual_spend: number;
  total_waste: number;
  total_potential_savings: number;
  average_utilization: number;
  underutilized_count: number;
  renewals_next_30_days: number;
  high_risk_contracts: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export type ContractStatus = "active" | "expiring_soon" | "expired" | "renewed";
export type LicenseType = "per_user" | "per_device" | "site_license" | "consumption_based";
export type UserRole = "admin" | "company_manager" | "viewer";
