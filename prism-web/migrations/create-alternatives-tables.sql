-- ================================================================
-- SMART ALTERNATIVES DISCOVERY - DATABASE MIGRATION
-- Run this SQL in your Neon SQL editor
-- ================================================================

-- ================================================================
-- 1. SOFTWARE ALTERNATIVES
-- Master catalog of alternative software options
-- ================================================================
CREATE TABLE IF NOT EXISTS software_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Original Software
  original_software_id UUID REFERENCES software_catalog(id),
  original_software_name VARCHAR(255) NOT NULL,
  original_vendor_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,

  -- Alternative Software
  alternative_software_name VARCHAR(255) NOT NULL,
  alternative_vendor_name VARCHAR(255) NOT NULL,
  alternative_category VARCHAR(100),

  -- Feature Match Analysis
  feature_match_score DECIMAL(5,2) CHECK (feature_match_score BETWEEN 0 AND 100),
  shared_features JSONB,
  unique_features_original JSONB,
  unique_features_alternative JSONB,
  missing_critical_features JSONB,

  -- Pricing Comparison
  pricing_model VARCHAR(100),
  estimated_cost_difference_percentage INTEGER,
  cost_comparison_details JSONB,

  -- Migration Analysis
  migration_difficulty VARCHAR(20) CHECK (migration_difficulty IN ('easy', 'moderate', 'complex', 'very_complex')),
  migration_time_estimate VARCHAR(50),
  migration_cost_estimate DECIMAL(15,2),
  data_migration_complexity VARCHAR(20),
  integration_challenges JSONB,

  -- Market Intelligence
  market_position VARCHAR(50),
  user_rating DECIMAL(3,2) CHECK (user_rating BETWEEN 0 AND 5),
  total_users INTEGER,
  company_size_fit VARCHAR(50),

  -- AI Analysis
  recommendation_confidence VARCHAR(20) CHECK (recommendation_confidence IN ('high', 'medium', 'low')),
  ai_summary TEXT,
  pros JSONB,
  cons JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  data_source VARCHAR(100),

  UNIQUE(original_software_name, alternative_software_name)
);

CREATE INDEX idx_alternatives_original ON software_alternatives(original_software_name);
CREATE INDEX idx_alternatives_category ON software_alternatives(category);
CREATE INDEX idx_alternatives_match_score ON software_alternatives(feature_match_score DESC);

-- ================================================================
-- 2. ALTERNATIVE EVALUATIONS
-- Company-specific evaluations of alternatives
-- ================================================================
CREATE TABLE IF NOT EXISTS alternative_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  current_software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,
  alternative_id UUID NOT NULL REFERENCES software_alternatives(id) ON DELETE CASCADE,

  -- Current State
  current_annual_cost DECIMAL(15,2) NOT NULL,
  current_license_count INTEGER,
  current_utilization_rate DECIMAL(5,2),

  -- Alternative Projected State
  projected_annual_cost DECIMAL(15,2) NOT NULL,
  projected_license_count INTEGER,
  projected_utilization_rate DECIMAL(5,2),

  -- Financial Analysis
  annual_savings DECIMAL(15,2),
  total_cost_of_ownership_3yr DECIMAL(15,2),
  break_even_months INTEGER,
  roi_percentage DECIMAL(5,2),

  -- Hidden Costs
  training_cost DECIMAL(15,2),
  migration_cost DECIMAL(15,2),
  integration_cost DECIMAL(15,2),
  productivity_loss_cost DECIMAL(15,2),
  total_hidden_costs DECIMAL(15,2),

  -- Risk Assessment
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB,
  mitigation_strategies JSONB,

  -- Decision Support
  recommendation VARCHAR(20) CHECK (recommendation IN ('highly_recommended', 'recommended', 'consider', 'not_recommended')),
  decision_rationale TEXT,
  key_considerations JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'under_review',
  evaluated_by UUID REFERENCES users(id),
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  decision VARCHAR(50),
  decision_date TIMESTAMPTZ,
  decision_notes TEXT,

  UNIQUE(company_id, current_software_id, alternative_id)
);

CREATE INDEX idx_evaluations_company ON alternative_evaluations(company_id);
CREATE INDEX idx_evaluations_software ON alternative_evaluations(current_software_id);
CREATE INDEX idx_evaluations_savings ON alternative_evaluations(annual_savings DESC);
CREATE INDEX idx_evaluations_roi ON alternative_evaluations(roi_percentage DESC);

-- ================================================================
-- 3. PEER REVIEWS & RATINGS
-- Real user experiences with software alternatives
-- ================================================================
CREATE TABLE IF NOT EXISTS software_peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  software_name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,

  -- Reviewer Info (anonymized)
  company_size VARCHAR(50),
  industry VARCHAR(100),
  use_case VARCHAR(100),

  -- Ratings
  overall_rating DECIMAL(3,2) CHECK (overall_rating BETWEEN 0 AND 5),
  ease_of_use_rating DECIMAL(3,2) CHECK (ease_of_use_rating BETWEEN 0 AND 5),
  features_rating DECIMAL(3,2) CHECK (features_rating BETWEEN 0 AND 5),
  support_rating DECIMAL(3,2) CHECK (support_rating BETWEEN 0 AND 5),
  value_for_money_rating DECIMAL(3,2) CHECK (value_for_money_rating BETWEEN 0 AND 5),

  -- Review Content
  title VARCHAR(200),
  review_text TEXT,
  pros JSONB,
  cons JSONB,

  -- Migration Experience
  migrated_from VARCHAR(255),
  migration_experience TEXT,
  migration_duration_days INTEGER,
  would_recommend BOOLEAN,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0
);

CREATE INDEX idx_peer_reviews_software ON software_peer_reviews(software_name, vendor_name);
CREATE INDEX idx_peer_reviews_rating ON software_peer_reviews(overall_rating DESC);

-- ================================================================
-- 4. SWITCH TRACKING
-- Track when companies switch software
-- ================================================================
CREATE TABLE IF NOT EXISTS software_switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Old Software
  old_software_id UUID REFERENCES software(id) ON DELETE SET NULL,
  old_software_name VARCHAR(255) NOT NULL,
  old_vendor_name VARCHAR(255) NOT NULL,
  old_annual_cost DECIMAL(15,2),

  -- New Software
  new_software_id UUID REFERENCES software(id) ON DELETE SET NULL,
  new_software_name VARCHAR(255) NOT NULL,
  new_vendor_name VARCHAR(255) NOT NULL,
  new_annual_cost DECIMAL(15,2),

  -- Switch Details
  reason_for_switch TEXT,
  annual_savings DECIMAL(15,2),
  migration_duration_days INTEGER,
  migration_challenges TEXT,

  -- Success Metrics
  user_satisfaction_before DECIMAL(3,2),
  user_satisfaction_after DECIMAL(3,2),
  productivity_impact VARCHAR(50),
  would_switch_again BOOLEAN,

  -- Timeline
  decision_date DATE,
  migration_start_date DATE,
  migration_complete_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_switches_company ON software_switches(company_id);
CREATE INDEX idx_switches_old_software ON software_switches(old_software_name);
CREATE INDEX idx_switches_new_software ON software_switches(new_software_name);

-- ================================================================
-- VERIFICATION
-- ================================================================
SELECT 'software_alternatives' as table_name, COUNT(*) as rows FROM software_alternatives
UNION ALL
SELECT 'alternative_evaluations', COUNT(*) FROM alternative_evaluations
UNION ALL
SELECT 'software_peer_reviews', COUNT(*) FROM software_peer_reviews
UNION ALL
SELECT 'software_switches', COUNT(*) FROM software_switches;

-- ✅ Migration Complete!
