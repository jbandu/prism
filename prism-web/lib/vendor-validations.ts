import { z } from "zod";

// ================================================================
// VENDOR VALIDATION SCHEMAS
// ================================================================

// Company size enum
const companySizeEnum = z.enum([
  "startup",
  "small",
  "medium",
  "large",
  "enterprise",
]);

// Funding stage enum
const fundingStageEnum = z.enum([
  "seed",
  "series_a",
  "series_b",
  "series_c",
  "public",
  "bootstrapped",
]);

// Subscription tier enum
const subscriptionTierEnum = z.enum(["free", "growth", "pro", "enterprise"]);

// Verification status enum
const verificationStatusEnum = z.enum(["pending", "verified", "rejected"]);

// Create vendor schema
export const createVendorSchema = z.object({
  vendor_name: z.string().min(2, "Vendor name must be at least 2 characters"),
  domain: z
    .string()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    )
    .optional(),
  category: z.string().min(2, "Category must be specified").optional(),
  description: z.string().max(2000, "Description too long").optional(),
  company_size: companySizeEnum.optional(),
  founding_year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  headquarters: z.string().max(255).optional(),
  website_url: z.string().url("Invalid website URL").optional(),
  support_email: z.string().email("Invalid email address").optional(),
});

// Update vendor schema
export const updateVendorSchema = z.object({
  vendor_name: z.string().min(2).optional(),
  domain: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)
    .optional(),
  category: z.string().min(2).optional(),
  description: z.string().max(2000).optional(),
  company_size: companySizeEnum.optional(),
  founding_year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  headquarters: z.string().max(255).optional(),
  funding_total: z.number().nonnegative().optional(),
  funding_stage: fundingStageEnum.optional(),
  logo_url: z.string().url().optional(),
  website_url: z.string().url().optional(),
  support_email: z.string().email().optional(),
  support_phone: z.string().max(50).optional(),
});

// Verify vendor schema
export const verifyVendorSchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  verification_status: verificationStatusEnum,
  verification_notes: z.string().max(1000).optional(),
});

// ================================================================
// VENDOR USER VALIDATION SCHEMAS
// ================================================================

const vendorUserRoleEnum = z.enum(["owner", "admin", "member", "viewer"]);

export const createVendorUserSchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  job_title: z.string().max(100).optional(),
  role: vendorUserRoleEnum.default("member"),
});

export const updateVendorUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  job_title: z.string().max(100).optional(),
  role: vendorUserRoleEnum.optional(),
  permissions: z
    .object({
      view_customers: z.boolean().optional(),
      view_prospects: z.boolean().optional(),
      manage_campaigns: z.boolean().optional(),
      view_intelligence: z.boolean().optional(),
      manage_profile: z.boolean().optional(),
      manage_team: z.boolean().optional(),
      billing: z.boolean().optional(),
      api_access: z.boolean().optional(),
    })
    .optional(),
});

// ================================================================
// VENDOR PRODUCT VALIDATION SCHEMAS
// ================================================================

const pricingModelEnum = z.enum([
  "per_user",
  "per_seat",
  "flat_rate",
  "usage_based",
  "custom",
]);

const productStatusEnum = z.enum(["draft", "active", "deprecated", "archived"]);

export const createVendorProductSchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  product_name: z
    .string()
    .min(2, "Product name must be at least 2 characters"),
  description: z.string().max(5000).optional(),
  short_description: z.string().max(500).optional(),
  category: z.string().min(2).optional(),
  subcategory: z.string().optional(),
  pricing_model: pricingModelEnum.optional(),
  starting_price: z.number().nonnegative().optional(),
  price_currency: z.string().length(3).default("USD"),
  features: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  compliance: z.array(z.string()).optional(),
  target_company_size: z.array(companySizeEnum).optional(),
  target_industries: z.array(z.string()).optional(),
});

export const updateVendorProductSchema = z.object({
  product_name: z.string().min(2).optional(),
  description: z.string().max(5000).optional(),
  short_description: z.string().max(500).optional(),
  category: z.string().min(2).optional(),
  subcategory: z.string().optional(),
  pricing_model: pricingModelEnum.optional(),
  starting_price: z.number().nonnegative().optional(),
  price_currency: z.string().length(3).optional(),
  features: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  compliance: z.array(z.string()).optional(),
  status: productStatusEnum.optional(),
  target_company_size: z.array(companySizeEnum).optional(),
  target_industries: z.array(z.string()).optional(),
});

// ================================================================
// CAMPAIGN VALIDATION SCHEMAS
// ================================================================

const campaignTypeEnum = z.enum([
  "competitive_displacement",
  "renewal_retention",
  "category_promotion",
  "rfp_response",
  "expansion_upsell",
]);

const campaignStatusEnum = z.enum([
  "draft",
  "pending_review",
  "active",
  "paused",
  "completed",
  "rejected",
]);

const costModelEnum = z.enum([
  "per_lead",
  "per_impression",
  "flat_fee",
  "revenue_share",
]);

export const createCampaignSchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  campaign_name: z
    .string()
    .min(2, "Campaign name must be at least 2 characters"),
  campaign_type: campaignTypeEnum,
  description: z.string().max(2000).optional(),
  target_criteria: z
    .object({
      competitor_names: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      company_sizes: z.array(companySizeEnum).optional(),
      industries: z.array(z.string()).optional(),
      min_intent_score: z.number().int().min(0).max(100).optional(),
      regions: z.array(z.string()).optional(),
      renewal_window_days: z.number().int().positive().optional(),
    })
    .optional(),
  offer_details: z
    .object({
      discount_percentage: z.number().min(0).max(100).optional(),
      discount_amount: z.number().nonnegative().optional(),
      free_trial_days: z.number().int().nonnegative().optional(),
      bonus_features: z.array(z.string()).optional(),
      limited_time: z.boolean().optional(),
      promo_code: z.string().max(50).optional(),
      custom_message: z.string().max(1000).optional(),
      expiration_date: z.string().datetime().optional(),
    })
    .optional(),
  budget_total: z.number().positive().optional(),
  budget_daily: z.number().positive().optional(),
  cost_model: costModelEnum.default("per_lead"),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const updateCampaignSchema = z.object({
  campaign_name: z.string().min(2).optional(),
  description: z.string().max(2000).optional(),
  target_criteria: z
    .object({
      competitor_names: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      company_sizes: z.array(companySizeEnum).optional(),
      industries: z.array(z.string()).optional(),
      min_intent_score: z.number().int().min(0).max(100).optional(),
      regions: z.array(z.string()).optional(),
      renewal_window_days: z.number().int().positive().optional(),
    })
    .optional(),
  offer_details: z
    .object({
      discount_percentage: z.number().min(0).max(100).optional(),
      discount_amount: z.number().nonnegative().optional(),
      free_trial_days: z.number().int().nonnegative().optional(),
      bonus_features: z.array(z.string()).optional(),
      limited_time: z.boolean().optional(),
      promo_code: z.string().max(50).optional(),
      custom_message: z.string().max(1000).optional(),
      expiration_date: z.string().datetime().optional(),
    })
    .optional(),
  budget_total: z.number().positive().optional(),
  budget_daily: z.number().positive().optional(),
  status: campaignStatusEnum.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// ================================================================
// INTRODUCTION REQUEST VALIDATION SCHEMAS
// ================================================================

const introRequestTypeEnum = z.enum([
  "introduction",
  "demo_request",
  "quote_request",
]);

const introStatusEnum = z.enum([
  "pending",
  "approved",
  "declined",
  "expired",
  "completed",
]);

export const createIntroductionRequestSchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  company_id: z.string().uuid("Invalid company ID"),
  request_type: introRequestTypeEnum.default("introduction"),
  subject: z.string().max(255).optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
  signal_id: z.string().uuid().optional(),
  campaign_id: z.string().uuid().optional(),
});

export const respondToIntroductionSchema = z.object({
  status: z.enum(["approved", "declined"]),
  decline_reason: z.string().max(500).optional(),
});

// ================================================================
// CLIENT DATA PREFERENCES VALIDATION SCHEMAS
// ================================================================

const payoutMethodEnum = z.enum(["credits", "bank_transfer", "check"]);

export const updateClientDataPreferencesSchema = z.object({
  share_software_usage: z.boolean().optional(),
  share_evaluation_interest: z.boolean().optional(),
  accept_vendor_offers: z.boolean().optional(),
  allow_contact_requests: z.boolean().optional(),
  share_benchmark_data: z.boolean().optional(),
  blocked_vendors: z.array(z.string().uuid()).optional(),
  hidden_software: z.array(z.string().uuid()).optional(),
  enrolled_in_revenue_sharing: z.boolean().optional(),
  revenue_share_payout_method: payoutMethodEnum.optional(),
  notify_on_intro_request: z.boolean().optional(),
  notify_on_vendor_offer: z.boolean().optional(),
  notification_email: z.string().email().optional(),
});

// ================================================================
// QUERY PARAMETER SCHEMAS
// ================================================================

export const vendorQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  verification_status: verificationStatusEnum.optional(),
  subscription_tier: subscriptionTierEnum.optional(),
  search: z.string().optional(),
});

export const prospectQuerySchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  min_intent_score: z.coerce.number().int().min(0).max(100).optional(),
  signal_type: z
    .enum([
      "active_evaluator",
      "competitor_churn_risk",
      "renewal_window",
      "category_interest",
      "icp_match",
    ])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const campaignQuerySchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  status: campaignStatusEnum.optional(),
  campaign_type: campaignTypeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
