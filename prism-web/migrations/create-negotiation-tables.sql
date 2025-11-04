-- ================================================================
-- NEGOTIATION ASSISTANT DATABASE MIGRATION
-- Run this SQL in your Neon SQL editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. NEGOTIATION PLAYBOOKS
-- Stores AI-generated negotiation strategies
-- ================================================================
CREATE TABLE IF NOT EXISTS negotiation_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Market Intelligence
  market_average_price DECIMAL(15,2),
  market_discount_range_min INTEGER,
  market_discount_range_max INTEGER,
  competitor_alternatives JSONB,
  pricing_trends TEXT,

  -- Your Leverage Points
  utilization_rate DECIMAL(5,2),
  unused_licenses INTEGER,
  contract_length_years INTEGER,
  total_spent_to_date DECIMAL(15,2),
  payment_history_score INTEGER,

  -- Negotiation Strategy
  recommended_target_discount INTEGER,
  confidence_level VARCHAR(20),
  leverage_points JSONB,
  risks JSONB,
  talking_points JSONB,

  -- Email Templates
  email_initial_outreach TEXT,
  email_counter_offer TEXT,
  email_final_push TEXT,
  email_alternative_threat TEXT,

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID,
  ai_model_version VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',

  -- Tracking
  negotiation_started_at TIMESTAMPTZ,
  negotiation_completed_at TIMESTAMPTZ,

  UNIQUE(software_id, generated_at)
);

CREATE INDEX IF NOT EXISTS idx_negotiation_playbooks_company
ON negotiation_playbooks(company_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_playbooks_software
ON negotiation_playbooks(software_id);

-- ================================================================
-- 2. NEGOTIATION OUTCOMES
-- Tracks actual savings achieved from negotiations
-- ================================================================
CREATE TABLE IF NOT EXISTS negotiation_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID REFERENCES negotiation_playbooks(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Original vs Achieved
  original_annual_cost DECIMAL(15,2) NOT NULL,
  negotiated_annual_cost DECIMAL(15,2) NOT NULL,
  annual_savings DECIMAL(15,2) NOT NULL,
  discount_achieved INTEGER NOT NULL,

  -- Details
  negotiation_tactics_used JSONB,
  vendor_response TEXT,
  final_terms JSONB,

  -- Success Metrics
  negotiation_duration_days INTEGER,
  success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
  notes TEXT,

  -- Metadata
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID,

  -- New Contract Terms
  new_renewal_date DATE,
  new_contract_length_years INTEGER,
  new_payment_terms VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_negotiation_outcomes_company
ON negotiation_outcomes(company_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_outcomes_software
ON negotiation_outcomes(software_id);

-- ================================================================
-- 3. NEGOTIATION MARKET DATA
-- Caches market intelligence to reduce API calls
-- ================================================================
CREATE TABLE IF NOT EXISTS negotiation_market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  software_name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,

  -- Pricing Intelligence
  average_price_per_user DECIMAL(15,2),
  price_range_min DECIMAL(15,2),
  price_range_max DECIMAL(15,2),
  typical_discount_range VARCHAR(50),

  -- Market Data
  market_share_percentage DECIMAL(5,2),
  competitor_list JSONB,
  recent_price_changes JSONB,
  seasonal_discount_periods JSONB,

  -- Source & Freshness
  data_source VARCHAR(100),
  data_quality_score INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  next_update_due TIMESTAMPTZ,

  UNIQUE(software_name, vendor_name)
);

CREATE INDEX IF NOT EXISTS idx_market_data_software
ON negotiation_market_data(software_name, vendor_name);

-- ================================================================
-- VERIFICATION QUERIES
-- Run these to confirm tables were created successfully
-- ================================================================

-- Check if all tables exist
SELECT
  'negotiation_playbooks' as table_name,
  COUNT(*) as row_count
FROM negotiation_playbooks
UNION ALL
SELECT
  'negotiation_outcomes' as table_name,
  COUNT(*) as row_count
FROM negotiation_outcomes
UNION ALL
SELECT
  'negotiation_market_data' as table_name,
  COUNT(*) as row_count
FROM negotiation_market_data;

-- ✅ Migration Complete!
-- You should see 3 tables with 0 rows each
