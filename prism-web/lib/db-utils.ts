import { sql } from "./db";
import type {
  Company,
  Software,
  User,
  VendorIntelligence,
  AgentAnalysis,
  ClientReport,
  CompanyDashboardMetrics,
} from "@/types";

// Company queries
export async function getCompanies(): Promise<Company[]> {
  const result = await sql`
    SELECT * FROM companies
    ORDER BY created_at DESC
  `;
  return result as Company[];
}

export async function getCompanyById(companyId: string): Promise<Company | null> {
  const result = await sql`
    SELECT * FROM companies
    WHERE id = ${companyId}
  `;
  return result[0] as Company || null;
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    // Try to find by slug column if it exists
    const result = await sql`
      SELECT * FROM companies
      WHERE slug = ${slug}
    `;
    if (result[0]) {
      return result[0] as Company;
    }
  } catch (error) {
    // If slug column doesn't exist, fall through to name matching
    console.log('Slug column may not exist, trying name matching');
  }

  // Fallback: try to match by generating slug from company_name
  const companies = await sql`
    SELECT * FROM companies
  `;

  for (const company of companies) {
    const generatedSlug = (company.company_name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (generatedSlug === slug) {
      return company as Company;
    }
  }

  return null;
}

export async function createCompany(data: {
  company_name: string;
  industry: string;
  employee_count: number;
}): Promise<Company> {
  // Generate slug from company name
  const slug = data.company_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const result = await sql`
    INSERT INTO companies (company_name, slug, industry, employee_count)
    VALUES (${data.company_name}, ${slug}, ${data.industry}, ${data.employee_count})
    RETURNING *
  `;
  return result[0] as Company;
}

export async function updateCompany(
  companyId: string,
  data: Partial<{ company_name: string; industry: string; employee_count: number }>
): Promise<Company | null> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.company_name !== undefined) {
    updates.push(`company_name = $${updates.length + 1}`);
    values.push(data.company_name);
  }
  if (data.industry !== undefined) {
    updates.push(`industry = $${updates.length + 1}`);
    values.push(data.industry);
  }
  if (data.employee_count !== undefined) {
    updates.push(`employee_count = $${updates.length + 1}`);
    values.push(data.employee_count);
  }

  if (updates.length === 0) {
    return getCompanyById(companyId);
  }

  values.push(companyId);

  const result = await sql`
    UPDATE companies
    SET ${sql(updates.join(', '))}
    WHERE id = ${companyId}
    RETURNING *
  `;

  return result[0] as Company || null;
}

export async function deleteCompany(companyId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM companies
      WHERE id = ${companyId}
    `;
    return true;
  } catch (error) {
    return false;
  }
}

// Software queries
export async function getSoftwareByCompany(
  companyId: string,
  filters?: { category?: string; search?: string }
): Promise<Software[]> {
  if (!filters?.category && !filters?.search) {
    const result = await sql`
      SELECT * FROM software
      WHERE company_id = ${companyId}
        AND deleted_at IS NULL
      ORDER BY total_annual_cost DESC
    `;
    return result as Software[];
  }

  if (filters.category && !filters.search) {
    const result = await sql`
      SELECT * FROM software
      WHERE company_id = ${companyId}
        AND category = ${filters.category}
        AND deleted_at IS NULL
      ORDER BY total_annual_cost DESC
    `;
    return result as Software[];
  }

  if (!filters.category && filters.search) {
    const searchPattern = `%${filters.search}%`;
    const result = await sql`
      SELECT * FROM software
      WHERE company_id = ${companyId}
        AND (software_name ILIKE ${searchPattern} OR vendor_name ILIKE ${searchPattern})
        AND deleted_at IS NULL
      ORDER BY total_annual_cost DESC
    `;
    return result as Software[];
  }

  // Both category and search
  const searchPattern = `%${filters.search}%`;
  const result = await sql`
    SELECT * FROM software
    WHERE company_id = ${companyId}
      AND category = ${filters.category}
      AND (software_name ILIKE ${searchPattern} OR vendor_name ILIKE ${searchPattern})
      AND deleted_at IS NULL
    ORDER BY total_annual_cost DESC
  `;
  return result as Software[];
}

export async function getSoftwareById(softwareId: string): Promise<Software | null> {
  const result = await sql`
    SELECT * FROM software
    WHERE id = ${softwareId}
      AND deleted_at IS NULL
  `;
  return result[0] as Software || null;
}

export async function createSoftware(data: {
  company_id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  product_description?: string;
  total_annual_cost: number;
  total_licenses: number;
  active_users: number;
  license_type: string;
  renewal_date: string;
}): Promise<Software> {
  const result = await sql`
    INSERT INTO software (
      company_id, software_name, vendor_name, category,
      product_description, total_annual_cost, total_licenses, active_users,
      license_type, renewal_date, contract_status
    )
    VALUES (
      ${data.company_id}, ${data.software_name}, ${data.vendor_name},
      ${data.category}, ${data.product_description || null}, ${data.total_annual_cost}, ${data.total_licenses},
      ${data.active_users}, ${data.license_type}, ${data.renewal_date}, 'active'
    )
    RETURNING *
  `;
  return result[0] as Software;
}

export async function updateSoftware(
  softwareId: string,
  data: any
): Promise<Software | null> {
  // Build dynamic update query
  const updateFields = Object.keys(data)
    .filter(key => data[key] !== undefined)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  if (!updateFields) {
    return getSoftwareById(softwareId);
  }

  const values = Object.values(data).filter(val => val !== undefined);
  values.push(softwareId);

  const result = await sql`
    UPDATE software
    SET ${sql(updateFields)}, updated_at = now()
    WHERE id = ${softwareId}
    AND deleted_at IS NULL
    RETURNING *
  `;

  return result[0] as Software || null;
}

export async function deleteSoftware(softwareId: string): Promise<boolean> {
  try {
    // Soft delete
    await sql`
      UPDATE software
      SET deleted_at = now()
      WHERE id = ${softwareId}
    `;
    return true;
  } catch (error) {
    return false;
  }
}

// Dashboard metrics
export async function getCompanyDashboardMetrics(
  companyId: string
): Promise<CompanyDashboardMetrics | null> {
  const company = await getCompanyById(companyId);
  if (!company) return null;

  // Get basic metrics
  const metricsResult = await sql`
    SELECT
      COUNT(*) as total_software_count,
      COALESCE(SUM(total_annual_cost), 0) as total_annual_spend,
      COALESCE(SUM(waste_amount), 0) as total_waste,
      COALESCE(SUM(potential_savings), 0) as total_potential_savings,
      COALESCE(AVG(utilization_rate), 0) as average_utilization,
      COUNT(CASE WHEN utilization_rate < 50 THEN 1 END) as underutilized_count,
      COUNT(CASE WHEN days_to_renewal <= 30 AND days_to_renewal > 0 THEN 1 END) as renewals_next_30_days,
      COUNT(CASE WHEN contract_status = 'expiring_soon' THEN 1 END) as high_risk_contracts
    FROM software
    WHERE company_id = ${companyId}
      AND deleted_at IS NULL
  `;

  const metrics = metricsResult[0];

  // Get top cost drivers
  const topCostDrivers = await sql`
    SELECT software_name, total_annual_cost as annual_cost
    FROM software
    WHERE company_id = ${companyId}
      AND deleted_at IS NULL
    ORDER BY total_annual_cost DESC
    LIMIT 5
  `;

  // Get recent analyses
  const recentAnalyses = await sql`
    SELECT * FROM ai_agent_analyses
    WHERE company_id = ${companyId}
    ORDER BY created_at DESC
    LIMIT 5
  ` as AgentAnalysis[];

  // Get upcoming renewals
  const upcomingRenewals = await sql`
    SELECT * FROM software_assets
    WHERE company_id = ${companyId}
      AND days_to_renewal > 0
      AND days_to_renewal <= 90
    ORDER BY days_to_renewal ASC
    LIMIT 10
  ` as Software[];

  return {
    company_id: companyId,
    company_name: company.company_name,
    total_software_count: Number(metrics.total_software_count),
    total_annual_spend: Number(metrics.total_annual_spend),
    total_waste: Number(metrics.total_waste),
    total_potential_savings: Number(metrics.total_potential_savings),
    average_utilization: Number(metrics.average_utilization),
    underutilized_count: Number(metrics.underutilized_count),
    renewals_next_30_days: Number(metrics.renewals_next_30_days),
    high_risk_contracts: Number(metrics.high_risk_contracts),
    top_cost_drivers: topCostDrivers as any,
    recent_analyses: recentAnalyses,
    upcoming_renewals: upcomingRenewals,
  };
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users
    WHERE email = ${email}
  `;
  return result[0] as User || null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users
    WHERE id = ${userId}
  `;
  return result[0] as User || null;
}

export async function createUser(data: {
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  company_id?: string;
}): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, full_name, role, company_id, is_active)
    VALUES (
      ${data.email}, ${data.password_hash}, ${data.full_name},
      ${data.role}, ${data.company_id || null}, true
    )
    RETURNING *
  `;
  return result[0] as User;
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  await sql`
    UPDATE users
    SET last_login = NOW()
    WHERE id = ${userId}
  `;
}

// Reports
export async function getReportsByCompany(companyId: string): Promise<ClientReport[]> {
  const result = await sql`
    SELECT * FROM client_reports
    WHERE company_id = ${companyId}
    ORDER BY generated_at DESC
  `;
  return result as ClientReport[];
}

export async function createReport(data: {
  company_id: string;
  report_type: string;
  report_data: any;
  generated_by: string;
  period_start: Date;
  period_end: Date;
  total_savings_identified: number;
  action_items_count: number;
}): Promise<ClientReport> {
  const result = await sql`
    INSERT INTO client_reports (
      company_id, report_type, report_data, generated_by,
      period_start, period_end, total_savings_identified, action_items_count
    )
    VALUES (
      ${data.company_id}, ${data.report_type}, ${JSON.stringify(data.report_data)},
      ${data.generated_by}, ${data.period_start}, ${data.period_end},
      ${data.total_savings_identified}, ${data.action_items_count}
    )
    RETURNING *
  `;
  return result[0] as ClientReport;
}

// Agent analyses
export async function createAnalysis(data: {
  company_id: string;
  software_id?: string;
  analysis_type: string;
  analysis_data: any;
  agent_version: string;
  confidence_score: number;
}): Promise<AgentAnalysis> {
  const result = await sql`
    INSERT INTO ai_agent_analyses (
      company_id, software_id, analysis_type, analysis_data,
      agent_version, confidence_score, status
    )
    VALUES (
      ${data.company_id}, ${data.software_id || null}, ${data.analysis_type},
      ${JSON.stringify(data.analysis_data)}, ${data.agent_version},
      ${data.confidence_score}, 'completed'
    )
    RETURNING *
  `;
  return result[0] as AgentAnalysis;
}

export async function updateAnalysisStatus(
  analysisId: string,
  status: "pending" | "completed" | "failed"
): Promise<void> {
  await sql`
    UPDATE ai_agent_analyses
    SET status = ${status}
    WHERE analysis_id = ${analysisId}
  `;
}
