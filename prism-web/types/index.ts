export interface Company {
  id: string;
  company_name: string;
  slug: string;
  industry: string;
  employee_count: number;
  headquarters_location?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  contract_status?: string;
  total_software_count?: number;
  total_annual_software_spend?: number;
  total_savings_identified?: number;
  created_at: Date;
  updated_at?: Date;
}

export interface Software {
  id: string;
  software_id?: string; // Legacy field, use id
  company_id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  total_annual_cost: number | string; // Neon returns NUMERIC as string
  total_licenses: number;
  active_users: number;
  utilization_rate: number | string; // Neon returns NUMERIC as string
  license_type: string;
  renewal_date: Date;
  contract_status?: string; // Optional, may not be set for all records
  waste_amount?: number | string; // Optional, Neon returns NUMERIC as string
  potential_savings?: number | string; // Optional, Neon returns NUMERIC as string
  cost_per_user?: number | string; // Neon returns NUMERIC as string
  contract_start_date?: Date;
  contract_end_date?: Date;
  days_to_renewal?: number;
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
export type AnalysisType = "cost_optimization" | "alternative_discovery" | "vendor_intelligence" | "full_portfolio";

// User model
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  company_id?: string;
  created_at: Date;
  last_login?: Date;
  is_active: boolean;
}

// Vendor Intelligence model
export interface VendorIntelligence {
  vendor_id: string;
  vendor_name: string;
  financial_health_score: number;
  market_position: string;
  recent_news: string[];
  risk_factors: string[];
  competitive_landscape: Record<string, any>;
  pricing_trends: string;
  customer_satisfaction_score: number;
  analysis_date: Date;
  recommendation: string;
}

// AI Agent Analysis model
export interface AgentAnalysis {
  analysis_id: string;
  company_id: string;
  software_id?: string;
  analysis_type: AnalysisType;
  analysis_data: Record<string, any>;
  agent_version: string;
  created_at: Date;
  confidence_score: number;
  status: "pending" | "completed" | "failed";
}

// Client Report model
export interface ClientReport {
  report_id: string;
  company_id: string;
  report_type: "executive_summary" | "detailed_analysis" | "quarterly_review";
  report_data: Record<string, any>;
  generated_at: Date;
  generated_by: string;
  period_start: Date;
  period_end: Date;
  total_savings_identified: number;
  action_items_count: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request body types
export interface CreateCompanyRequest {
  company_name: string;
  industry: string;
  employee_count: number;
}

export interface UpdateCompanyRequest {
  company_name?: string;
  industry?: string;
  employee_count?: number;
}

export interface CreateSoftwareRequest {
  company_id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  total_annual_cost: number;
  total_licenses: number;
  active_users: number;
  license_type: LicenseType;
  renewal_date: string;
}

export interface UpdateSoftwareRequest {
  software_name?: string;
  vendor_name?: string;
  category?: string;
  total_annual_cost?: number;
  total_licenses?: number;
  active_users?: number;
  license_type?: LicenseType;
  renewal_date?: string;
  contract_status?: ContractStatus;
}

export interface AnalyzeRequest {
  company_id: string;
  analysis_type: AnalysisType;
  software_id?: string;
}

export interface CreateReportRequest {
  company_id: string;
  report_type: "executive_summary" | "detailed_analysis" | "quarterly_review";
  period_start: string;
  period_end: string;
}

// Extended Dashboard Metrics
export interface CompanyDashboardMetrics extends DashboardMetrics {
  company_id: string;
  company_name: string;
  top_cost_drivers: Array<{
    software_name: string;
    annual_cost: number;
  }>;
  recent_analyses: AgentAnalysis[];
  upcoming_renewals: Software[];
}
