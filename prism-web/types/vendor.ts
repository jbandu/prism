// ================================================================
// VENDOR MARKETPLACE TYPES
// Two-Sided B2B SaaS Marketplace for PRISM
// ================================================================

// ================================================================
// CORE VENDOR TYPES
// ================================================================

export type VendorCompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type VendorFundingStage = 'seed' | 'series_a' | 'series_b' | 'series_c' | 'public' | 'bootstrapped';
export type VendorVerificationStatus = 'pending' | 'verified' | 'rejected';
export type VendorSubscriptionTier = 'free' | 'growth' | 'pro' | 'enterprise';
export type VendorUserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type VendorUserStatus = 'pending' | 'active' | 'suspended' | 'removed';

export interface Vendor {
  id: string;
  vendor_name: string;
  slug: string;
  domain?: string;
  category?: string;
  description?: string;

  // Company Details
  company_size?: VendorCompanySize;
  founding_year?: number;
  headquarters?: string;
  funding_total?: number | string;
  funding_stage?: VendorFundingStage;

  // Branding
  logo_url?: string;
  website_url?: string;
  support_email?: string;
  support_phone?: string;

  // Verification
  verification_status: VendorVerificationStatus;
  verification_date?: Date;
  verified_by?: string;
  claimed_at?: Date;
  claimed_by?: string;

  // Subscription
  subscription_tier: VendorSubscriptionTier;
  subscription_started_at?: Date;
  subscription_expires_at?: Date;

  // Metrics (aggregated from PRISM client data)
  total_prism_customers?: number;
  avg_customer_health_score?: number | string;
  total_revenue_in_prism?: number | string;
  market_share_percentage?: number | string;

  // Metadata
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface VendorUser {
  id: string;
  vendor_id: string;
  user_id?: string;
  email: string;
  full_name?: string;
  job_title?: string;
  phone?: string;
  role: VendorUserRole;
  permissions: VendorPermissions;
  status: VendorUserStatus;
  invited_by?: string;
  invited_at?: Date;
  accepted_at?: Date;
  last_login?: Date;
  login_count?: number;
  created_at: Date;
  updated_at?: Date;
}

export interface VendorPermissions {
  view_customers?: boolean;
  view_prospects?: boolean;
  manage_campaigns?: boolean;
  view_intelligence?: boolean;
  manage_profile?: boolean;
  manage_team?: boolean;
  billing?: boolean;
  api_access?: boolean;
}

// ================================================================
// VENDOR PRODUCT TYPES
// ================================================================

export type ProductPricingModel = 'per_user' | 'per_seat' | 'flat_rate' | 'usage_based' | 'custom';
export type ProductStatus = 'draft' | 'active' | 'deprecated' | 'archived';

export interface VendorProduct {
  id: string;
  vendor_id: string;
  product_name: string;
  product_slug?: string;
  description?: string;
  short_description?: string;
  category?: string;
  subcategory?: string;

  // Pricing
  pricing_model?: ProductPricingModel;
  starting_price?: number | string;
  price_currency?: string;
  pricing_tiers?: ProductPricingTier[];

  // Features
  features?: string[];
  integrations?: string[];

  // Compliance & Security
  compliance?: string[];
  security_features?: string[];

  // Target Market
  target_company_size?: VendorCompanySize[];
  target_industries?: string[];

  // Media
  logo_url?: string;
  screenshots?: string[];
  video_url?: string;

  // Status
  status: ProductStatus;
  published_at?: Date;

  // Metadata
  created_at: Date;
  updated_at?: Date;
}

export interface ProductPricingTier {
  name: string;
  price: number;
  per: string;
  features: string[];
  popular?: boolean;
}

// ================================================================
// PROSPECT & SIGNAL TYPES
// ================================================================

export type SignalType =
  | 'active_evaluator'
  | 'competitor_churn_risk'
  | 'renewal_window'
  | 'category_interest'
  | 'icp_match';

export type SignalStatus = 'active' | 'contacted' | 'converted' | 'expired' | 'dismissed';

export interface ProspectSignal {
  id: string;
  company_id: string;
  vendor_id: string;
  signal_type: SignalType;
  intent_score: number;
  context: ProspectContext;
  related_software_id?: string;
  related_alternative_id?: string;
  detected_at: Date;
  expires_at: Date;
  status: SignalStatus;
  contacted_at?: Date;
  contacted_by?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface ProspectContext {
  competitor_name?: string;
  competitor_product?: string;
  renewal_date?: Date;
  search_terms?: string[];
  features_needed?: string[];
  budget_range?: { min: number; max: number };
  timeline?: string;
  churn_risk_score?: number;
}

export interface ProspectWithCompany extends ProspectSignal {
  company_name: string;
  company_slug?: string;
  industry?: string;
  employee_count?: number;
  headquarters?: string;
  total_software_spend?: number | string;
}

// ================================================================
// CAMPAIGN TYPES
// ================================================================

export type CampaignType =
  | 'competitive_displacement'
  | 'renewal_retention'
  | 'category_promotion'
  | 'rfp_response'
  | 'expansion_upsell';

export type CampaignStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'rejected';
export type CampaignCostModel = 'per_lead' | 'per_impression' | 'flat_fee' | 'revenue_share';

export interface VendorCampaign {
  id: string;
  vendor_id: string;
  campaign_name: string;
  campaign_type: CampaignType;
  description?: string;

  // Targeting
  target_criteria: CampaignTargetCriteria;

  // Offer
  offer_details: CampaignOfferDetails;

  // Budget
  budget_total?: number | string;
  budget_daily?: number | string;
  budget_spent?: number | string;
  cost_model?: CampaignCostModel;
  cost_per_unit?: number | string;

  // Schedule
  start_date?: Date;
  end_date?: Date;

  // Status
  status: CampaignStatus;
  approved_at?: Date;
  approved_by?: string;
  rejection_reason?: string;

  // Performance
  impressions?: number;
  clicks?: number;
  leads_generated?: number;
  conversions?: number;
  revenue_generated?: number | string;

  // Metadata
  created_by?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface CampaignTargetCriteria {
  competitor_names?: string[];
  categories?: string[];
  company_sizes?: VendorCompanySize[];
  industries?: string[];
  min_intent_score?: number;
  regions?: string[];
  renewal_window_days?: number;
}

export interface CampaignOfferDetails {
  discount_percentage?: number;
  discount_amount?: number;
  free_trial_days?: number;
  bonus_features?: string[];
  limited_time?: boolean;
  promo_code?: string;
  custom_message?: string;
  expiration_date?: Date;
}

export interface CampaignImpression {
  id: string;
  campaign_id: string;
  company_id: string;
  impression_type?: 'email' | 'in_app' | 'notification' | 'marketplace';
  delivered_at: Date;
  viewed_at?: Date;
  clicked_at?: Date;
  response_type?: 'interested' | 'not_interested' | 'request_demo' | 'request_quote';
  response_at?: Date;
  response_data?: Record<string, unknown>;
  converted: boolean;
  conversion_date?: Date;
  conversion_value?: number | string;
}

// ================================================================
// INTRODUCTION REQUEST TYPES
// ================================================================

export type IntroductionRequestType = 'introduction' | 'demo_request' | 'quote_request';
export type IntroductionStatus = 'pending' | 'approved' | 'declined' | 'expired' | 'completed';
export type IntroductionOutcome = 'meeting_held' | 'demo_scheduled' | 'quote_sent' | 'deal_closed' | 'no_follow_up';

export interface IntroductionRequest {
  id: string;
  vendor_id: string;
  company_id: string;
  requested_by: string;
  request_type: IntroductionRequestType;
  subject?: string;
  message: string;
  attachments?: string[];
  signal_id?: string;
  campaign_id?: string;
  context?: Record<string, unknown>;
  status: IntroductionStatus;
  responded_at?: Date;
  responded_by?: string;
  decline_reason?: string;
  intro_scheduled_at?: Date;
  intro_completed_at?: Date;
  intro_notes?: string;
  outcome?: IntroductionOutcome;
  deal_value?: number | string;
  credit_charged?: boolean;
  credit_amount?: number;
  created_at: Date;
  updated_at?: Date;
  expires_at: Date;
}

export interface IntroductionRequestWithDetails extends IntroductionRequest {
  vendor_name: string;
  company_name: string;
  requester_name: string;
  requester_email: string;
}

// ================================================================
// CLIENT DATA PREFERENCES
// ================================================================

export type PayoutMethod = 'credits' | 'bank_transfer' | 'check';

export interface ClientDataPreferences {
  id: string;
  company_id: string;
  share_software_usage: boolean;
  share_evaluation_interest: boolean;
  accept_vendor_offers: boolean;
  allow_contact_requests: boolean;
  share_benchmark_data: boolean;
  blocked_vendors?: string[];
  hidden_software?: string[];
  enrolled_in_revenue_sharing: boolean;
  revenue_share_payout_method?: PayoutMethod;
  total_revenue_share_earned?: number | string;
  notify_on_intro_request: boolean;
  notify_on_vendor_offer: boolean;
  notification_email?: string;
  created_at: Date;
  updated_at?: Date;
  last_reviewed_at?: Date;
}

// ================================================================
// VENDOR BADGES
// ================================================================

export type VendorBadgeType =
  | 'prism_verified'
  | 'security_certified'
  | 'top_rated'
  | 'fast_growing'
  | 'trusted_partner';

export type BadgeStatus = 'active' | 'expired' | 'revoked';

export interface VendorBadge {
  id: string;
  vendor_id: string;
  badge_type: VendorBadgeType;
  display_name: string;
  description?: string;
  icon_url?: string;
  earned_at: Date;
  expires_at?: Date;
  verified_by?: string;
  verification_data?: Record<string, unknown>;
  status: BadgeStatus;
  revoked_at?: Date;
  revoke_reason?: string;
}

// ================================================================
// MARKET INTELLIGENCE TYPES
// ================================================================

export type AdoptionTrend = 'growing' | 'stable' | 'declining';

export interface VendorMarketIntelligence {
  id: string;
  vendor_id: string;
  category: string;
  market_share_prism?: number | string;
  market_rank?: number;

  // Competitive Analysis
  top_competitors?: CompetitorData[];
  win_loss_data?: WinLossData;

  // Pricing Intelligence
  avg_price_per_user?: number | string;
  price_percentile?: number;
  typical_discount_rate?: number | string;

  // Customer Insights
  avg_customer_satisfaction?: number | string;
  avg_utilization_rate?: number | string;
  churn_rate_prism?: number | string;
  net_promoter_score?: number;

  // Trends
  adoption_trend?: AdoptionTrend;
  adoption_growth_rate?: number | string;
  evaluation_frequency?: number;

  // Feature Analysis
  most_valued_features?: string[];
  feature_gaps?: string[];

  // Metadata
  period_start?: Date;
  period_end?: Date;
  calculated_at: Date;
  data_points_count?: number;
}

export interface CompetitorData {
  vendor_id: string;
  vendor_name: string;
  market_share: number;
  win_rate_against: number;
}

export interface WinLossData {
  wins: {
    total: number;
    from_competitors: Record<string, number>;
  };
  losses: {
    total: number;
    to_competitors: Record<string, number>;
  };
}

// ================================================================
// VENDOR CREDITS
// ================================================================

export type CreditTransactionType = 'purchase' | 'subscription' | 'introduction' | 'campaign' | 'refund' | 'bonus';

export interface VendorCredit {
  id: string;
  vendor_id: string;
  transaction_type: CreditTransactionType;
  amount: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  created_at: Date;
  created_by?: string;
}

// ================================================================
// API KEY TYPES
// ================================================================

export type ApiKeyStatus = 'active' | 'revoked' | 'expired';
export type ApiScope =
  | 'read:customers'
  | 'read:prospects'
  | 'read:intelligence'
  | 'write:campaigns'
  | 'manage:profile'
  | 'manage:products';

export interface VendorApiKey {
  id: string;
  vendor_id: string;
  key_name: string;
  key_prefix: string;
  scopes: ApiScope[];
  rate_limit_per_hour?: number;
  rate_limit_per_day?: number;
  last_used_at?: Date;
  total_requests?: number;
  status: ApiKeyStatus;
  expires_at?: Date;
  revoked_at?: Date;
  revoke_reason?: string;
  created_by?: string;
  created_at: Date;
}

// ================================================================
// DASHBOARD METRICS
// ================================================================

export interface VendorDashboardMetrics {
  // Customer Metrics
  total_customers: number;
  avg_license_utilization: number;
  avg_satisfaction_score: number;
  customers_at_risk: number;

  // Renewal Pipeline
  renewals_next_30_days: number;
  renewals_next_90_days: number;
  pipeline_value: number;

  // Prospect Metrics
  active_prospects: number;
  hot_prospects: number;
  introductions_pending: number;
  introductions_accepted: number;

  // Campaign Metrics
  active_campaigns: number;
  total_impressions: number;
  total_leads: number;
  conversion_rate: number;

  // Revenue Metrics
  total_revenue_in_prism: number;
  revenue_trend: AdoptionTrend;
  market_share: number;
}

export interface CustomerHealthData {
  company_id: string;
  company_name: string;
  company_slug?: string;
  product_name: string;
  health_score: number;
  renewal_date?: Date;
  days_to_renewal?: number;
  risk_level: 'low' | 'medium' | 'high';
  utilization_rate: number;
  annual_value: number;
  last_activity?: Date;
  expansion_signals?: string[];
  churn_risk_factors?: string[];
}

// ================================================================
// REQUEST/RESPONSE TYPES
// ================================================================

export interface CreateVendorRequest {
  vendor_name: string;
  domain?: string;
  category?: string;
  description?: string;
  company_size?: VendorCompanySize;
  founding_year?: number;
  headquarters?: string;
  website_url?: string;
  support_email?: string;
}

export interface UpdateVendorRequest {
  vendor_name?: string;
  domain?: string;
  category?: string;
  description?: string;
  company_size?: VendorCompanySize;
  founding_year?: number;
  headquarters?: string;
  funding_total?: number;
  funding_stage?: VendorFundingStage;
  logo_url?: string;
  website_url?: string;
  support_email?: string;
  support_phone?: string;
}

export interface CreateCampaignRequest {
  campaign_name: string;
  campaign_type: CampaignType;
  description?: string;
  target_criteria: CampaignTargetCriteria;
  offer_details: CampaignOfferDetails;
  budget_total?: number;
  budget_daily?: number;
  cost_model?: CampaignCostModel;
  start_date?: string;
  end_date?: string;
}

export interface CreateIntroductionRequest {
  company_id: string;
  request_type?: IntroductionRequestType;
  subject?: string;
  message: string;
  signal_id?: string;
  campaign_id?: string;
}

export interface UpdateDataPreferencesRequest {
  share_software_usage?: boolean;
  share_evaluation_interest?: boolean;
  accept_vendor_offers?: boolean;
  allow_contact_requests?: boolean;
  share_benchmark_data?: boolean;
  blocked_vendors?: string[];
  hidden_software?: string[];
  enrolled_in_revenue_sharing?: boolean;
  revenue_share_payout_method?: PayoutMethod;
  notify_on_intro_request?: boolean;
  notify_on_vendor_offer?: boolean;
  notification_email?: string;
}
