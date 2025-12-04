import { sql } from "./db";
import type {
  Vendor,
  VendorUser,
  VendorProduct,
  ProspectSignal,
  ProspectWithCompany,
  VendorCampaign,
  IntroductionRequest,
  ClientDataPreferences,
  VendorBadge,
  VendorMarketIntelligence,
  VendorDashboardMetrics,
  CustomerHealthData,
} from "@/types/vendor";

// ================================================================
// VENDOR QUERIES
// ================================================================

export async function getVendors(): Promise<Vendor[]> {
  const result = await sql`
    SELECT * FROM vendors
    WHERE deleted_at IS NULL
    ORDER BY vendor_name ASC
  `;
  return result as Vendor[];
}

export async function getVendorById(vendorId: string): Promise<Vendor | null> {
  const result = await sql`
    SELECT * FROM vendors
    WHERE id = ${vendorId}
      AND deleted_at IS NULL
  `;
  return (result[0] as Vendor) || null;
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const result = await sql`
    SELECT * FROM vendors
    WHERE slug = ${slug}
      AND deleted_at IS NULL
  `;
  return (result[0] as Vendor) || null;
}

export async function getVendorByDomain(domain: string): Promise<Vendor | null> {
  const result = await sql`
    SELECT * FROM vendors
    WHERE domain = ${domain}
      AND deleted_at IS NULL
  `;
  return (result[0] as Vendor) || null;
}

export async function createVendor(data: {
  vendor_name: string;
  domain?: string;
  category?: string;
  description?: string;
  company_size?: string;
  founding_year?: number;
  headquarters?: string;
  website_url?: string;
  support_email?: string;
}): Promise<Vendor> {
  const result = await sql`
    INSERT INTO vendors (
      vendor_name, domain, category, description,
      company_size, founding_year, headquarters,
      website_url, support_email
    )
    VALUES (
      ${data.vendor_name},
      ${data.domain || null},
      ${data.category || null},
      ${data.description || null},
      ${data.company_size || null},
      ${data.founding_year || null},
      ${data.headquarters || null},
      ${data.website_url || null},
      ${data.support_email || null}
    )
    RETURNING *
  `;
  return result[0] as Vendor;
}

export async function updateVendor(
  vendorId: string,
  data: Partial<Vendor>
): Promise<Vendor | null> {
  // Remove fields that shouldn't be updated directly
  const { id, created_at, deleted_at, ...updateData } = data;

  if (Object.keys(updateData).length === 0) {
    return getVendorById(vendorId);
  }

  // Build SET clause dynamically
  const setClauses: string[] = [];
  const values: any[] = [];

  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined) {
      setClauses.push(`${key} = $${values.length + 1}`);
      values.push(value);
    }
  });

  if (setClauses.length === 0) {
    return getVendorById(vendorId);
  }

  const result = await sql`
    UPDATE vendors
    SET ${sql(setClauses.join(", "))}, updated_at = NOW()
    WHERE id = ${vendorId}
      AND deleted_at IS NULL
    RETURNING *
  `;

  return (result[0] as Vendor) || null;
}

export async function deleteVendor(vendorId: string): Promise<boolean> {
  try {
    await sql`
      UPDATE vendors
      SET deleted_at = NOW()
      WHERE id = ${vendorId}
    `;
    return true;
  } catch (error) {
    return false;
  }
}

export async function verifyVendor(
  vendorId: string,
  verifiedBy: string
): Promise<Vendor | null> {
  const result = await sql`
    UPDATE vendors
    SET verification_status = 'verified',
        verification_date = NOW(),
        verified_by = ${verifiedBy},
        updated_at = NOW()
    WHERE id = ${vendorId}
      AND deleted_at IS NULL
    RETURNING *
  `;
  return (result[0] as Vendor) || null;
}

// ================================================================
// VENDOR USER QUERIES
// ================================================================

export async function getVendorUsers(vendorId: string): Promise<VendorUser[]> {
  const result = await sql`
    SELECT * FROM vendor_users
    WHERE vendor_id = ${vendorId}
      AND status != 'removed'
    ORDER BY role ASC, full_name ASC
  `;
  return result as VendorUser[];
}

export async function getVendorUserByEmail(
  vendorId: string,
  email: string
): Promise<VendorUser | null> {
  const result = await sql`
    SELECT * FROM vendor_users
    WHERE vendor_id = ${vendorId}
      AND email = ${email}
  `;
  return (result[0] as VendorUser) || null;
}

export async function createVendorUser(data: {
  vendor_id: string;
  email: string;
  full_name?: string;
  job_title?: string;
  role?: string;
  invited_by?: string;
}): Promise<VendorUser> {
  const result = await sql`
    INSERT INTO vendor_users (
      vendor_id, email, full_name, job_title, role, invited_by
    )
    VALUES (
      ${data.vendor_id},
      ${data.email},
      ${data.full_name || null},
      ${data.job_title || null},
      ${data.role || "member"},
      ${data.invited_by || null}
    )
    RETURNING *
  `;
  return result[0] as VendorUser;
}

export async function updateVendorUserLogin(userId: string): Promise<void> {
  await sql`
    UPDATE vendor_users
    SET last_login = NOW(),
        login_count = COALESCE(login_count, 0) + 1,
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

// ================================================================
// VENDOR PRODUCT QUERIES
// ================================================================

export async function getVendorProducts(vendorId: string): Promise<VendorProduct[]> {
  const result = await sql`
    SELECT * FROM vendor_products
    WHERE vendor_id = ${vendorId}
    ORDER BY product_name ASC
  `;
  return result as VendorProduct[];
}

export async function createVendorProduct(data: {
  vendor_id: string;
  product_name: string;
  description?: string;
  category?: string;
  pricing_model?: string;
  starting_price?: number;
}): Promise<VendorProduct> {
  const result = await sql`
    INSERT INTO vendor_products (
      vendor_id, product_name, description, category,
      pricing_model, starting_price
    )
    VALUES (
      ${data.vendor_id},
      ${data.product_name},
      ${data.description || null},
      ${data.category || null},
      ${data.pricing_model || null},
      ${data.starting_price || null}
    )
    RETURNING *
  `;
  return result[0] as VendorProduct;
}

// ================================================================
// CUSTOMER QUERIES (for Vendor Portal)
// ================================================================

export async function getVendorCustomers(
  vendorId: string
): Promise<CustomerHealthData[]> {
  // Get the vendor to find their name
  const vendor = await getVendorById(vendorId);
  if (!vendor) return [];

  const result = await sql`
    SELECT
      s.company_id,
      c.company_name,
      c.slug as company_slug,
      s.software_name as product_name,
      COALESCE(s.utilization_rate, 0) as utilization_rate,
      s.renewal_date,
      s.days_to_renewal,
      s.total_annual_cost as annual_value,
      CASE
        WHEN s.utilization_rate < 30 THEN 'high'
        WHEN s.utilization_rate < 60 THEN 'medium'
        ELSE 'low'
      END as risk_level
    FROM software s
    JOIN companies c ON s.company_id = c.id
    WHERE LOWER(s.vendor_name) = LOWER(${vendor.vendor_name})
      AND s.deleted_at IS NULL
    ORDER BY s.renewal_date ASC
  `;

  return result.map((row: any) => ({
    company_id: row.company_id,
    company_name: row.company_name,
    company_slug: row.company_slug,
    product_name: row.product_name,
    health_score: Math.round(Number(row.utilization_rate)),
    utilization_rate: Number(row.utilization_rate),
    renewal_date: row.renewal_date,
    days_to_renewal: row.days_to_renewal,
    annual_value: Number(row.annual_value),
    risk_level: row.risk_level,
  })) as CustomerHealthData[];
}

export async function getVendorCustomerCount(vendorId: string): Promise<number> {
  const vendor = await getVendorById(vendorId);
  if (!vendor) return 0;

  const result = await sql`
    SELECT COUNT(DISTINCT company_id) as count
    FROM software
    WHERE LOWER(vendor_name) = LOWER(${vendor.vendor_name})
      AND deleted_at IS NULL
  `;

  return Number(result[0]?.count || 0);
}

// ================================================================
// PROSPECT SIGNAL QUERIES
// ================================================================

export async function getVendorProspects(
  vendorId: string,
  filters?: { minIntentScore?: number; signalType?: string }
): Promise<ProspectWithCompany[]> {
  let result;

  if (filters?.signalType && filters?.minIntentScore) {
    result = await sql`
      SELECT
        ps.*,
        c.company_name,
        c.slug as company_slug,
        c.industry,
        c.employee_count,
        c.headquarters_location as headquarters,
        c.total_annual_software_spend as total_software_spend
      FROM prospect_signals ps
      JOIN companies c ON ps.company_id = c.id
      WHERE ps.vendor_id = ${vendorId}
        AND ps.status = 'active'
        AND ps.expires_at > NOW()
        AND ps.intent_score >= ${filters.minIntentScore}
        AND ps.signal_type = ${filters.signalType}
      ORDER BY ps.intent_score DESC, ps.detected_at DESC
    `;
  } else if (filters?.minIntentScore) {
    result = await sql`
      SELECT
        ps.*,
        c.company_name,
        c.slug as company_slug,
        c.industry,
        c.employee_count,
        c.headquarters_location as headquarters,
        c.total_annual_software_spend as total_software_spend
      FROM prospect_signals ps
      JOIN companies c ON ps.company_id = c.id
      WHERE ps.vendor_id = ${vendorId}
        AND ps.status = 'active'
        AND ps.expires_at > NOW()
        AND ps.intent_score >= ${filters.minIntentScore}
      ORDER BY ps.intent_score DESC, ps.detected_at DESC
    `;
  } else if (filters?.signalType) {
    result = await sql`
      SELECT
        ps.*,
        c.company_name,
        c.slug as company_slug,
        c.industry,
        c.employee_count,
        c.headquarters_location as headquarters,
        c.total_annual_software_spend as total_software_spend
      FROM prospect_signals ps
      JOIN companies c ON ps.company_id = c.id
      WHERE ps.vendor_id = ${vendorId}
        AND ps.status = 'active'
        AND ps.expires_at > NOW()
        AND ps.signal_type = ${filters.signalType}
      ORDER BY ps.intent_score DESC, ps.detected_at DESC
    `;
  } else {
    result = await sql`
      SELECT
        ps.*,
        c.company_name,
        c.slug as company_slug,
        c.industry,
        c.employee_count,
        c.headquarters_location as headquarters,
        c.total_annual_software_spend as total_software_spend
      FROM prospect_signals ps
      JOIN companies c ON ps.company_id = c.id
      WHERE ps.vendor_id = ${vendorId}
        AND ps.status = 'active'
        AND ps.expires_at > NOW()
      ORDER BY ps.intent_score DESC, ps.detected_at DESC
    `;
  }

  return result as ProspectWithCompany[];
}

export async function createProspectSignal(data: {
  company_id: string;
  vendor_id: string;
  signal_type: string;
  intent_score: number;
  context?: Record<string, unknown>;
  related_software_id?: string;
}): Promise<ProspectSignal> {
  const result = await sql`
    INSERT INTO prospect_signals (
      company_id, vendor_id, signal_type, intent_score, context, related_software_id
    )
    VALUES (
      ${data.company_id},
      ${data.vendor_id},
      ${data.signal_type},
      ${data.intent_score},
      ${JSON.stringify(data.context || {})},
      ${data.related_software_id || null}
    )
    RETURNING *
  `;
  return result[0] as ProspectSignal;
}

// ================================================================
// CAMPAIGN QUERIES
// ================================================================

export async function getVendorCampaigns(vendorId: string): Promise<VendorCampaign[]> {
  const result = await sql`
    SELECT * FROM vendor_campaigns
    WHERE vendor_id = ${vendorId}
    ORDER BY created_at DESC
  `;
  return result as VendorCampaign[];
}

export async function createVendorCampaign(data: {
  vendor_id: string;
  campaign_name: string;
  campaign_type: string;
  description?: string;
  target_criteria?: Record<string, unknown>;
  offer_details?: Record<string, unknown>;
  budget_total?: number;
  start_date?: string;
  end_date?: string;
  created_by?: string;
}): Promise<VendorCampaign> {
  const result = await sql`
    INSERT INTO vendor_campaigns (
      vendor_id, campaign_name, campaign_type, description,
      target_criteria, offer_details, budget_total,
      start_date, end_date, created_by
    )
    VALUES (
      ${data.vendor_id},
      ${data.campaign_name},
      ${data.campaign_type},
      ${data.description || null},
      ${JSON.stringify(data.target_criteria || {})},
      ${JSON.stringify(data.offer_details || {})},
      ${data.budget_total || null},
      ${data.start_date || null},
      ${data.end_date || null},
      ${data.created_by || null}
    )
    RETURNING *
  `;
  return result[0] as VendorCampaign;
}

// ================================================================
// INTRODUCTION REQUEST QUERIES
// ================================================================

export async function getIntroductionRequests(
  vendorId: string,
  status?: string
): Promise<IntroductionRequest[]> {
  if (status) {
    const result = await sql`
      SELECT * FROM introduction_requests
      WHERE vendor_id = ${vendorId}
        AND status = ${status}
      ORDER BY created_at DESC
    `;
    return result as IntroductionRequest[];
  }

  const result = await sql`
    SELECT * FROM introduction_requests
    WHERE vendor_id = ${vendorId}
    ORDER BY created_at DESC
  `;
  return result as IntroductionRequest[];
}

export async function createIntroductionRequest(data: {
  vendor_id: string;
  company_id: string;
  requested_by: string;
  request_type?: string;
  subject?: string;
  message: string;
  signal_id?: string;
  campaign_id?: string;
}): Promise<IntroductionRequest> {
  const result = await sql`
    INSERT INTO introduction_requests (
      vendor_id, company_id, requested_by, request_type,
      subject, message, signal_id, campaign_id
    )
    VALUES (
      ${data.vendor_id},
      ${data.company_id},
      ${data.requested_by},
      ${data.request_type || "introduction"},
      ${data.subject || null},
      ${data.message},
      ${data.signal_id || null},
      ${data.campaign_id || null}
    )
    RETURNING *
  `;
  return result[0] as IntroductionRequest;
}

export async function respondToIntroductionRequest(
  requestId: string,
  data: {
    status: string;
    responded_by: string;
    decline_reason?: string;
  }
): Promise<IntroductionRequest | null> {
  const result = await sql`
    UPDATE introduction_requests
    SET status = ${data.status},
        responded_at = NOW(),
        responded_by = ${data.responded_by},
        decline_reason = ${data.decline_reason || null},
        updated_at = NOW()
    WHERE id = ${requestId}
    RETURNING *
  `;
  return (result[0] as IntroductionRequest) || null;
}

// ================================================================
// CLIENT DATA PREFERENCES QUERIES
// ================================================================

export async function getClientDataPreferences(
  companyId: string
): Promise<ClientDataPreferences | null> {
  const result = await sql`
    SELECT * FROM client_data_preferences
    WHERE company_id = ${companyId}
  `;
  return (result[0] as ClientDataPreferences) || null;
}

export async function upsertClientDataPreferences(
  companyId: string,
  data: Partial<ClientDataPreferences>
): Promise<ClientDataPreferences> {
  // Check if preferences exist
  const existing = await getClientDataPreferences(companyId);

  if (existing) {
    // Update
    const result = await sql`
      UPDATE client_data_preferences
      SET share_software_usage = COALESCE(${data.share_software_usage}, share_software_usage),
          share_evaluation_interest = COALESCE(${data.share_evaluation_interest}, share_evaluation_interest),
          accept_vendor_offers = COALESCE(${data.accept_vendor_offers}, accept_vendor_offers),
          allow_contact_requests = COALESCE(${data.allow_contact_requests}, allow_contact_requests),
          share_benchmark_data = COALESCE(${data.share_benchmark_data}, share_benchmark_data),
          enrolled_in_revenue_sharing = COALESCE(${data.enrolled_in_revenue_sharing}, enrolled_in_revenue_sharing),
          notify_on_intro_request = COALESCE(${data.notify_on_intro_request}, notify_on_intro_request),
          notify_on_vendor_offer = COALESCE(${data.notify_on_vendor_offer}, notify_on_vendor_offer),
          notification_email = COALESCE(${data.notification_email}, notification_email),
          updated_at = NOW(),
          last_reviewed_at = NOW()
      WHERE company_id = ${companyId}
      RETURNING *
    `;
    return result[0] as ClientDataPreferences;
  } else {
    // Insert
    const result = await sql`
      INSERT INTO client_data_preferences (
        company_id,
        share_software_usage,
        share_evaluation_interest,
        accept_vendor_offers,
        allow_contact_requests,
        share_benchmark_data,
        enrolled_in_revenue_sharing,
        notify_on_intro_request,
        notify_on_vendor_offer,
        notification_email
      )
      VALUES (
        ${companyId},
        ${data.share_software_usage ?? true},
        ${data.share_evaluation_interest ?? false},
        ${data.accept_vendor_offers ?? false},
        ${data.allow_contact_requests ?? false},
        ${data.share_benchmark_data ?? true},
        ${data.enrolled_in_revenue_sharing ?? false},
        ${data.notify_on_intro_request ?? true},
        ${data.notify_on_vendor_offer ?? true},
        ${data.notification_email || null}
      )
      RETURNING *
    `;
    return result[0] as ClientDataPreferences;
  }
}

// ================================================================
// VENDOR BADGES QUERIES
// ================================================================

export async function getVendorBadges(vendorId: string): Promise<VendorBadge[]> {
  const result = await sql`
    SELECT * FROM vendor_badges
    WHERE vendor_id = ${vendorId}
      AND status = 'active'
    ORDER BY earned_at DESC
  `;
  return result as VendorBadge[];
}

export async function awardVendorBadge(data: {
  vendor_id: string;
  badge_type: string;
  display_name: string;
  description?: string;
  verified_by?: string;
}): Promise<VendorBadge> {
  const result = await sql`
    INSERT INTO vendor_badges (
      vendor_id, badge_type, display_name, description, verified_by
    )
    VALUES (
      ${data.vendor_id},
      ${data.badge_type},
      ${data.display_name},
      ${data.description || null},
      ${data.verified_by || null}
    )
    ON CONFLICT (vendor_id, badge_type) DO UPDATE
    SET status = 'active',
        earned_at = NOW(),
        verified_by = EXCLUDED.verified_by
    RETURNING *
  `;
  return result[0] as VendorBadge;
}

// ================================================================
// MARKET INTELLIGENCE QUERIES
// ================================================================

export async function getVendorMarketIntelligence(
  vendorId: string,
  category?: string
): Promise<VendorMarketIntelligence | null> {
  if (category) {
    const result = await sql`
      SELECT * FROM vendor_market_intelligence
      WHERE vendor_id = ${vendorId}
        AND category = ${category}
      ORDER BY calculated_at DESC
      LIMIT 1
    `;
    return (result[0] as VendorMarketIntelligence) || null;
  }

  const result = await sql`
    SELECT * FROM vendor_market_intelligence
    WHERE vendor_id = ${vendorId}
    ORDER BY calculated_at DESC
    LIMIT 1
  `;
  return (result[0] as VendorMarketIntelligence) || null;
}

// ================================================================
// VENDOR DASHBOARD METRICS
// ================================================================

export async function getVendorDashboardMetrics(
  vendorId: string
): Promise<VendorDashboardMetrics | null> {
  const vendor = await getVendorById(vendorId);
  if (!vendor) return null;

  // Get customer metrics
  const customerMetrics = await sql`
    SELECT
      COUNT(DISTINCT s.company_id) as total_customers,
      AVG(s.utilization_rate) as avg_utilization,
      COUNT(CASE WHEN s.utilization_rate < 30 THEN 1 END) as customers_at_risk,
      COUNT(CASE WHEN s.days_to_renewal <= 30 AND s.days_to_renewal > 0 THEN 1 END) as renewals_30,
      COUNT(CASE WHEN s.days_to_renewal <= 90 AND s.days_to_renewal > 0 THEN 1 END) as renewals_90,
      SUM(CASE WHEN s.days_to_renewal <= 90 AND s.days_to_renewal > 0 THEN s.total_annual_cost ELSE 0 END) as pipeline_value,
      SUM(s.total_annual_cost) as total_revenue
    FROM software s
    WHERE LOWER(s.vendor_name) = LOWER(${vendor.vendor_name})
      AND s.deleted_at IS NULL
  `;

  const cm = customerMetrics[0];

  // Get prospect metrics
  const prospectMetrics = await sql`
    SELECT
      COUNT(*) as active_prospects,
      COUNT(CASE WHEN intent_score >= 90 THEN 1 END) as hot_prospects
    FROM prospect_signals
    WHERE vendor_id = ${vendorId}
      AND status = 'active'
      AND expires_at > NOW()
  `;

  const pm = prospectMetrics[0];

  // Get introduction metrics
  const introMetrics = await sql`
    SELECT
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as accepted
    FROM introduction_requests
    WHERE vendor_id = ${vendorId}
  `;

  const im = introMetrics[0];

  // Get campaign metrics
  const campaignMetrics = await sql`
    SELECT
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
      SUM(impressions) as total_impressions,
      SUM(leads_generated) as total_leads,
      SUM(conversions) as total_conversions
    FROM vendor_campaigns
    WHERE vendor_id = ${vendorId}
  `;

  const cpm = campaignMetrics[0];

  return {
    total_customers: Number(cm?.total_customers || 0),
    avg_license_utilization: Number(cm?.avg_utilization || 0),
    avg_satisfaction_score: 0, // Would need review data
    customers_at_risk: Number(cm?.customers_at_risk || 0),
    renewals_next_30_days: Number(cm?.renewals_30 || 0),
    renewals_next_90_days: Number(cm?.renewals_90 || 0),
    pipeline_value: Number(cm?.pipeline_value || 0),
    active_prospects: Number(pm?.active_prospects || 0),
    hot_prospects: Number(pm?.hot_prospects || 0),
    introductions_pending: Number(im?.pending || 0),
    introductions_accepted: Number(im?.accepted || 0),
    active_campaigns: Number(cpm?.active_campaigns || 0),
    total_impressions: Number(cpm?.total_impressions || 0),
    total_leads: Number(cpm?.total_leads || 0),
    conversion_rate:
      Number(cpm?.total_leads || 0) > 0
        ? (Number(cpm?.total_conversions || 0) / Number(cpm?.total_leads || 0)) * 100
        : 0,
    total_revenue_in_prism: Number(cm?.total_revenue || 0),
    revenue_trend: "stable" as const,
    market_share: 0, // Would need category calculation
  };
}
