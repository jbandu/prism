-- ================================================================
-- VENDORS MARKETPLACE MODULE - DATABASE MIGRATION
-- Two-Sided B2B SaaS Marketplace for PRISM
-- Run this SQL in your Neon SQL editor
-- ================================================================

-- ================================================================
-- 1. VENDORS
-- Primary vendor entity - SaaS companies selling through PRISM
-- ================================================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  vendor_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  domain VARCHAR(255) UNIQUE,
  category VARCHAR(100),
  description TEXT,

  -- Company Details
  company_size VARCHAR(50), -- startup, small, medium, large, enterprise
  founding_year INTEGER,
  headquarters VARCHAR(255),
  funding_total DECIMAL(15,2),
  funding_stage VARCHAR(50), -- seed, series_a, series_b, series_c, public, bootstrapped

  -- Branding
  logo_url TEXT,
  website_url TEXT,
  support_email VARCHAR(255),
  support_phone VARCHAR(50),

  -- Verification
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  verification_date TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ,
  claimed_by UUID,

  -- Subscription
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, growth, pro, enterprise
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- Metrics (aggregated from PRISM client data)
  total_prism_customers INTEGER DEFAULT 0,
  avg_customer_health_score DECIMAL(5,2),
  total_revenue_in_prism DECIMAL(15,2),
  market_share_percentage DECIMAL(5,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_company_size CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'growth', 'pro', 'enterprise'))
);

CREATE INDEX idx_vendors_name ON vendors(vendor_name);
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_domain ON vendors(domain);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_subscription_tier ON vendors(subscription_tier);
CREATE INDEX idx_vendors_verification_status ON vendors(verification_status);

-- Auto-generate slug from vendor_name
CREATE OR REPLACE FUNCTION generate_vendor_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.vendor_name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := REGEXP_REPLACE(NEW.slug, '^-|-$', '', 'g');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendor_slug_trigger
BEFORE INSERT ON vendors
FOR EACH ROW EXECUTE FUNCTION generate_vendor_slug();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_updated_at_trigger
BEFORE UPDATE ON vendors
FOR EACH ROW EXECUTE FUNCTION update_vendors_updated_at();

-- ================================================================
-- 2. VENDOR USERS
-- Team members who can access the vendor portal
-- ================================================================
CREATE TABLE IF NOT EXISTS vendor_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Contact Info (may differ from main user record)
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  job_title VARCHAR(255),
  phone VARCHAR(50),

  -- Role & Permissions
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
  permissions JSONB DEFAULT '{}',
  -- Possible permissions:
  -- { "view_customers": true, "view_prospects": true, "manage_campaigns": true,
  --   "view_intelligence": true, "manage_profile": true, "manage_team": true,
  --   "billing": true, "api_access": true }

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended, removed
  invited_by UUID REFERENCES vendor_users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- Activity
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(vendor_id, email),
  CONSTRAINT valid_vendor_user_role CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  CONSTRAINT valid_vendor_user_status CHECK (status IN ('pending', 'active', 'suspended', 'removed'))
);

CREATE INDEX idx_vendor_users_vendor ON vendor_users(vendor_id);
CREATE INDEX idx_vendor_users_email ON vendor_users(email);
CREATE INDEX idx_vendor_users_user ON vendor_users(user_id);
CREATE INDEX idx_vendor_users_status ON vendor_users(status);

-- ================================================================
-- 3. VENDOR PRODUCTS
-- Catalog of products offered by each vendor
-- ================================================================
CREATE TABLE IF NOT EXISTS vendor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Product Details
  product_name VARCHAR(255) NOT NULL,
  product_slug VARCHAR(255),
  description TEXT,
  short_description VARCHAR(500),
  category VARCHAR(100),
  subcategory VARCHAR(100),

  -- Pricing
  pricing_model VARCHAR(50), -- per_user, per_seat, flat_rate, usage_based, custom
  starting_price DECIMAL(15,2),
  price_currency VARCHAR(3) DEFAULT 'USD',
  pricing_tiers JSONB,
  -- Example: [
  --   { "name": "Starter", "price": 10, "per": "user/month", "features": [...] },
  --   { "name": "Pro", "price": 25, "per": "user/month", "features": [...] }
  -- ]

  -- Features
  features JSONB DEFAULT '[]',
  integrations JSONB DEFAULT '[]',

  -- Compliance & Security
  compliance JSONB DEFAULT '[]', -- SOC2, GDPR, HIPAA, ISO27001, etc.
  security_features JSONB DEFAULT '[]',

  -- Target Market
  target_company_size JSONB DEFAULT '[]', -- startup, small, medium, large, enterprise
  target_industries JSONB DEFAULT '[]',

  -- Media
  logo_url TEXT,
  screenshots JSONB DEFAULT '[]',
  video_url TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, deprecated, archived
  published_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(vendor_id, product_slug),
  CONSTRAINT valid_pricing_model CHECK (pricing_model IN ('per_user', 'per_seat', 'flat_rate', 'usage_based', 'custom')),
  CONSTRAINT valid_product_status CHECK (status IN ('draft', 'active', 'deprecated', 'archived'))
);

CREATE INDEX idx_vendor_products_vendor ON vendor_products(vendor_id);
CREATE INDEX idx_vendor_products_category ON vendor_products(category);
CREATE INDEX idx_vendor_products_status ON vendor_products(status);

-- ================================================================
-- 4. PROSPECT SIGNALS
-- Intent signals detected from PRISM client activity
-- ================================================================
CREATE TABLE IF NOT EXISTS prospect_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Signal Details
  signal_type VARCHAR(50) NOT NULL,
  -- active_evaluator: Used Alternative Discovery for this category in last 30 days
  -- competitor_churn_risk: High churn risk score for a competitor's product
  -- renewal_window: Competitor contract renewing in 90 days
  -- category_interest: Viewed this category in software catalog
  -- icp_match: Matches vendor's ideal customer profile

  intent_score INTEGER CHECK (intent_score BETWEEN 0 AND 100),
  -- Hot (90-100), Warm (60-89), Cool (30-59)

  -- Context
  context JSONB DEFAULT '{}',
  -- May include: competitor_name, competitor_product, renewal_date,
  -- search_terms, features_needed, budget_range, timeline

  -- Related Data
  related_software_id UUID REFERENCES software(id) ON DELETE SET NULL,
  related_alternative_id UUID REFERENCES software_alternatives(id) ON DELETE SET NULL,

  -- Lifecycle
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
  status VARCHAR(50) DEFAULT 'active', -- active, contacted, converted, expired, dismissed

  -- Actions Taken
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES vendor_users(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_signal_type CHECK (signal_type IN (
    'active_evaluator', 'competitor_churn_risk', 'renewal_window',
    'category_interest', 'icp_match'
  )),
  CONSTRAINT valid_signal_status CHECK (status IN (
    'active', 'contacted', 'converted', 'expired', 'dismissed'
  ))
);

CREATE INDEX idx_prospect_signals_company ON prospect_signals(company_id);
CREATE INDEX idx_prospect_signals_vendor ON prospect_signals(vendor_id);
CREATE INDEX idx_prospect_signals_type ON prospect_signals(signal_type);
CREATE INDEX idx_prospect_signals_score ON prospect_signals(intent_score DESC);
CREATE INDEX idx_prospect_signals_status ON prospect_signals(status);
CREATE INDEX idx_prospect_signals_expires ON prospect_signals(expires_at);

-- ================================================================
-- 5. VENDOR CAMPAIGNS
-- Marketing campaigns created by vendors
-- ================================================================
CREATE TABLE IF NOT EXISTS vendor_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Campaign Details
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50) NOT NULL,
  -- competitive_displacement: Target users of specific competitor with switch incentive
  -- renewal_retention: Proactive offer to at-risk customers
  -- category_promotion: Broadcast to all companies evaluating category
  -- rfp_response: Respond to active procurement requests
  -- expansion_upsell: Upgrade offers to existing customers

  description TEXT,

  -- Targeting
  target_criteria JSONB DEFAULT '{}',
  -- May include: competitor_names, categories, company_sizes, industries,
  -- min_intent_score, regions, renewal_window_days

  -- Offer
  offer_details JSONB DEFAULT '{}',
  -- May include: discount_percentage, discount_amount, free_trial_days,
  -- bonus_features, limited_time, promo_code, custom_message

  -- Budget & Bidding
  budget_total DECIMAL(15,2),
  budget_daily DECIMAL(15,2),
  budget_spent DECIMAL(15,2) DEFAULT 0,
  cost_model VARCHAR(50) DEFAULT 'per_lead', -- per_lead, per_impression, flat_fee, revenue_share
  cost_per_unit DECIMAL(15,2),

  -- Schedule
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending_review, active, paused, completed, rejected
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,

  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_generated DECIMAL(15,2) DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES vendor_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_campaign_type CHECK (campaign_type IN (
    'competitive_displacement', 'renewal_retention', 'category_promotion',
    'rfp_response', 'expansion_upsell'
  )),
  CONSTRAINT valid_campaign_status CHECK (status IN (
    'draft', 'pending_review', 'active', 'paused', 'completed', 'rejected'
  )),
  CONSTRAINT valid_cost_model CHECK (cost_model IN (
    'per_lead', 'per_impression', 'flat_fee', 'revenue_share'
  ))
);

CREATE INDEX idx_vendor_campaigns_vendor ON vendor_campaigns(vendor_id);
CREATE INDEX idx_vendor_campaigns_type ON vendor_campaigns(campaign_type);
CREATE INDEX idx_vendor_campaigns_status ON vendor_campaigns(status);
CREATE INDEX idx_vendor_campaigns_dates ON vendor_campaigns(start_date, end_date);

-- ================================================================
-- 6. CAMPAIGN IMPRESSIONS
-- Track campaign delivery to specific companies
-- ================================================================
CREATE TABLE IF NOT EXISTS campaign_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES vendor_campaigns(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Impression Data
  impression_type VARCHAR(50), -- email, in_app, notification, marketplace
  delivered_at TIMESTAMPTZ DEFAULT NOW(),

  -- Engagement
  viewed_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Response
  response_type VARCHAR(50), -- interested, not_interested, request_demo, request_quote
  response_at TIMESTAMPTZ,
  response_data JSONB,

  -- Attribution
  converted BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMPTZ,
  conversion_value DECIMAL(15,2),

  UNIQUE(campaign_id, company_id, impression_type)
);

CREATE INDEX idx_campaign_impressions_campaign ON campaign_impressions(campaign_id);
CREATE INDEX idx_campaign_impressions_company ON campaign_impressions(company_id);
CREATE INDEX idx_campaign_impressions_converted ON campaign_impressions(converted);

-- ================================================================
-- 7. INTRODUCTION REQUESTS
-- Vendor-to-client warm introductions facilitated by PRISM
-- ================================================================
CREATE TABLE IF NOT EXISTS introduction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Request Details
  requested_by UUID NOT NULL REFERENCES vendor_users(id),
  request_type VARCHAR(50) DEFAULT 'introduction', -- introduction, demo_request, quote_request

  -- Message
  subject VARCHAR(255),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',

  -- Context (why this introduction)
  signal_id UUID REFERENCES prospect_signals(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES vendor_campaigns(id) ON DELETE SET NULL,
  context JSONB DEFAULT '{}',

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  -- pending: Awaiting client response
  -- approved: Client accepted introduction
  -- declined: Client declined
  -- expired: No response within timeframe
  -- completed: Introduction successfully made

  -- Client Response
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES users(id),
  decline_reason VARCHAR(255),

  -- Introduction Completion
  intro_scheduled_at TIMESTAMPTZ,
  intro_completed_at TIMESTAMPTZ,
  intro_notes TEXT,

  -- Outcome
  outcome VARCHAR(50), -- meeting_held, demo_scheduled, quote_sent, deal_closed, no_follow_up
  deal_value DECIMAL(15,2),

  -- Billing
  credit_charged BOOLEAN DEFAULT FALSE,
  credit_amount INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',

  CONSTRAINT valid_request_type CHECK (request_type IN (
    'introduction', 'demo_request', 'quote_request'
  )),
  CONSTRAINT valid_intro_status CHECK (status IN (
    'pending', 'approved', 'declined', 'expired', 'completed'
  )),
  CONSTRAINT valid_outcome CHECK (outcome IS NULL OR outcome IN (
    'meeting_held', 'demo_scheduled', 'quote_sent', 'deal_closed', 'no_follow_up'
  ))
);

CREATE INDEX idx_intro_requests_vendor ON introduction_requests(vendor_id);
CREATE INDEX idx_intro_requests_company ON introduction_requests(company_id);
CREATE INDEX idx_intro_requests_status ON introduction_requests(status);
CREATE INDEX idx_intro_requests_created ON introduction_requests(created_at DESC);

-- ================================================================
-- 8. CLIENT DATA PREFERENCES
-- Consent settings for what data clients share with vendors
-- ================================================================
CREATE TABLE IF NOT EXISTS client_data_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,

  -- Data Sharing Toggles
  share_software_usage BOOLEAN DEFAULT TRUE,
  -- Which products you use (visible to those vendors)

  share_evaluation_interest BOOLEAN DEFAULT FALSE,
  -- Show vendors when you're evaluating alternatives

  accept_vendor_offers BOOLEAN DEFAULT FALSE,
  -- Receive targeted promotions from vendors

  allow_contact_requests BOOLEAN DEFAULT FALSE,
  -- Allow vendors to request introductions

  share_benchmark_data BOOLEAN DEFAULT TRUE,
  -- Contribute anonymized data to market benchmarks

  -- Granular Controls
  blocked_vendors JSONB DEFAULT '[]', -- Vendor IDs that cannot see this company
  hidden_software JSONB DEFAULT '[]', -- Software IDs to hide from vendor visibility

  -- Revenue Sharing Program
  enrolled_in_revenue_sharing BOOLEAN DEFAULT FALSE,
  revenue_share_payout_method VARCHAR(50), -- credits, bank_transfer, check
  revenue_share_bank_details JSONB, -- Encrypted bank details
  total_revenue_share_earned DECIMAL(15,2) DEFAULT 0,

  -- Notification Preferences
  notify_on_intro_request BOOLEAN DEFAULT TRUE,
  notify_on_vendor_offer BOOLEAN DEFAULT TRUE,
  notification_email VARCHAR(255),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_client_preferences_company ON client_data_preferences(company_id);

-- ================================================================
-- 9. VENDOR VERIFICATION BADGES
-- Trust badges earned by vendors
-- ================================================================
CREATE TABLE IF NOT EXISTS vendor_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  badge_type VARCHAR(50) NOT NULL,
  -- prism_verified: Claimed profile, verified domain ownership
  -- security_certified: Uploaded SOC 2, ISO 27001, or equivalent
  -- top_rated: Average customer health score > 85%
  -- fast_growing: >20% adoption growth in PRISM base
  -- trusted_partner: Completed PRISM partnership program

  -- Badge Details
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,

  -- Verification
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  verification_data JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, expired, revoked
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,

  UNIQUE(vendor_id, badge_type),
  CONSTRAINT valid_badge_type CHECK (badge_type IN (
    'prism_verified', 'security_certified', 'top_rated',
    'fast_growing', 'trusted_partner'
  )),
  CONSTRAINT valid_badge_status CHECK (status IN ('active', 'expired', 'revoked'))
);

CREATE INDEX idx_vendor_badges_vendor ON vendor_badges(vendor_id);
CREATE INDEX idx_vendor_badges_type ON vendor_badges(badge_type);
CREATE INDEX idx_vendor_badges_status ON vendor_badges(status);

-- ================================================================
-- 10. VENDOR CREDITS
-- Credit system for vendor marketplace features
-- ================================================================
CREATE TABLE IF NOT EXISTS vendor_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL,
  -- purchase: Credits purchased
  -- subscription: Monthly credit allocation
  -- introduction: Credits used for intro request
  -- campaign: Credits used for campaign
  -- refund: Credits refunded
  -- bonus: Promotional credits

  amount INTEGER NOT NULL, -- Positive for credits added, negative for used
  balance_after INTEGER NOT NULL,

  -- Reference
  reference_type VARCHAR(50), -- introduction_request, campaign, stripe_payment
  reference_id UUID,

  -- Description
  description TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES vendor_users(id),

  CONSTRAINT valid_credit_transaction_type CHECK (transaction_type IN (
    'purchase', 'subscription', 'introduction', 'campaign', 'refund', 'bonus'
  ))
);

CREATE INDEX idx_vendor_credits_vendor ON vendor_credits(vendor_id);
CREATE INDEX idx_vendor_credits_type ON vendor_credits(transaction_type);
CREATE INDEX idx_vendor_credits_created ON vendor_credits(created_at DESC);

-- ================================================================
-- 11. MARKET INTELLIGENCE DATA
-- Aggregated market data for vendor intelligence features
-- ================================================================
CREATE TABLE IF NOT EXISTS vendor_market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Market Position
  category VARCHAR(100) NOT NULL,
  market_share_prism DECIMAL(5,2), -- % of PRISM clients in category
  market_rank INTEGER, -- Rank within category on PRISM

  -- Competitive Analysis
  top_competitors JSONB DEFAULT '[]',
  -- [{ vendor_id, vendor_name, market_share, win_rate_against }]

  win_loss_data JSONB DEFAULT '{}',
  -- { wins: { total, from_competitors: {...} }, losses: { total, to_competitors: {...} } }

  -- Pricing Intelligence
  avg_price_per_user DECIMAL(15,2),
  price_percentile INTEGER, -- Where this vendor falls in pricing distribution
  typical_discount_rate DECIMAL(5,2),

  -- Customer Insights
  avg_customer_satisfaction DECIMAL(3,2),
  avg_utilization_rate DECIMAL(5,2),
  churn_rate_prism DECIMAL(5,2), -- Among PRISM clients
  net_promoter_score INTEGER,

  -- Trends
  adoption_trend VARCHAR(20), -- growing, stable, declining
  adoption_growth_rate DECIMAL(5,2), -- YoY growth %
  evaluation_frequency INTEGER, -- How often searched in alternatives

  -- Feature Analysis
  most_valued_features JSONB DEFAULT '[]',
  feature_gaps JSONB DEFAULT '[]', -- Features commonly requested but missing

  -- Metadata
  period_start DATE,
  period_end DATE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  data_points_count INTEGER,

  UNIQUE(vendor_id, category, period_start)
);

CREATE INDEX idx_market_intel_vendor ON vendor_market_intelligence(vendor_id);
CREATE INDEX idx_market_intel_category ON vendor_market_intelligence(category);
CREATE INDEX idx_market_intel_period ON vendor_market_intelligence(period_start, period_end);

-- ================================================================
-- 12. VENDOR API KEYS
-- API access for vendor integrations
-- ================================================================
CREATE TABLE IF NOT EXISTS vendor_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Key Details
  key_name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL, -- First 10 chars for identification
  key_hash TEXT NOT NULL, -- Hashed API key

  -- Permissions
  scopes JSONB DEFAULT '["read:customers", "read:prospects"]',
  -- Available scopes: read:customers, read:prospects, read:intelligence,
  -- write:campaigns, manage:profile, manage:products

  -- Rate Limits
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,

  -- Usage
  last_used_at TIMESTAMPTZ,
  total_requests INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, revoked, expired
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,

  -- Metadata
  created_by UUID REFERENCES vendor_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_api_key_status CHECK (status IN ('active', 'revoked', 'expired'))
);

CREATE INDEX idx_vendor_api_keys_vendor ON vendor_api_keys(vendor_id);
CREATE INDEX idx_vendor_api_keys_prefix ON vendor_api_keys(key_prefix);
CREATE INDEX idx_vendor_api_keys_status ON vendor_api_keys(status);

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
SELECT 'vendors' as table_name, COUNT(*) as rows FROM vendors
UNION ALL
SELECT 'vendor_users', COUNT(*) FROM vendor_users
UNION ALL
SELECT 'vendor_products', COUNT(*) FROM vendor_products
UNION ALL
SELECT 'prospect_signals', COUNT(*) FROM prospect_signals
UNION ALL
SELECT 'vendor_campaigns', COUNT(*) FROM vendor_campaigns
UNION ALL
SELECT 'campaign_impressions', COUNT(*) FROM campaign_impressions
UNION ALL
SELECT 'introduction_requests', COUNT(*) FROM introduction_requests
UNION ALL
SELECT 'client_data_preferences', COUNT(*) FROM client_data_preferences
UNION ALL
SELECT 'vendor_badges', COUNT(*) FROM vendor_badges
UNION ALL
SELECT 'vendor_credits', COUNT(*) FROM vendor_credits
UNION ALL
SELECT 'vendor_market_intelligence', COUNT(*) FROM vendor_market_intelligence
UNION ALL
SELECT 'vendor_api_keys', COUNT(*) FROM vendor_api_keys;

-- ================================================================
-- TABLE COMMENTS
-- ================================================================
COMMENT ON TABLE vendors IS 'Primary vendor entities - SaaS companies selling through the PRISM marketplace';
COMMENT ON TABLE vendor_users IS 'Team members with access to the vendor portal';
COMMENT ON TABLE vendor_products IS 'Product catalog for each vendor with pricing and features';
COMMENT ON TABLE prospect_signals IS 'Intent signals detected from PRISM client activity for lead generation';
COMMENT ON TABLE vendor_campaigns IS 'Marketing campaigns created by vendors to reach prospects';
COMMENT ON TABLE campaign_impressions IS 'Tracking campaign delivery and engagement per company';
COMMENT ON TABLE introduction_requests IS 'Vendor-to-client warm introductions facilitated by PRISM';
COMMENT ON TABLE client_data_preferences IS 'Consent settings for what data clients share with vendors';
COMMENT ON TABLE vendor_badges IS 'Trust badges earned by verified vendors';
COMMENT ON TABLE vendor_credits IS 'Credit system for vendor marketplace features';
COMMENT ON TABLE vendor_market_intelligence IS 'Aggregated market intelligence data for vendor analytics';
COMMENT ON TABLE vendor_api_keys IS 'API keys for vendor integrations';

-- ✅ Migration Complete!
