-- ============================================================================
-- PRISM - Portfolio Risk Intelligence & Savings Management
-- Database Schema v1.0 - Neon Compatible
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: SOFTWARE_ASSETS
-- ============================================================================
CREATE TABLE software_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  software_name VARCHAR(200) NOT NULL,
  vendor_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  
  license_type VARCHAR(50) NOT NULL,
  total_annual_cost DECIMAL(12,2) NOT NULL,
  cost_per_user DECIMAL(10,2),
  total_licenses INTEGER,
  active_users INTEGER,
  utilization_rate DECIMAL(5,2), -- Changed from GENERATED to regular column
  
  vendor_contact_name VARCHAR(200),
  vendor_contact_email VARCHAR(200),
  contract_start_date DATE,
  contract_end_date DATE,
  renewal_date DATE NOT NULL,
  days_to_renewal INTEGER, -- Changed from GENERATED to regular column
  auto_renewal BOOLEAN DEFAULT false,
  notice_period_days INTEGER DEFAULT 30,
  payment_frequency VARCHAR(20) DEFAULT 'annual',
  
  deployment_type VARCHAR(50),
  primary_use_case TEXT,
  business_owner VARCHAR(200),
  technical_owner VARCHAR(200),
  integration_complexity VARCHAR(20) CHECK (integration_complexity IN ('low', 'medium', 'high', 'critical')),
  api_available BOOLEAN DEFAULT false,
  
  replacement_priority VARCHAR(20) CHECK (replacement_priority IN ('immediate', 'high', 'medium', 'low', 'never')),
  replacement_feasibility_score DECIMAL(3,2) CHECK (replacement_feasibility_score BETWEEN 0 AND 1),
  business_criticality VARCHAR(20) CHECK (business_criticality IN ('mission-critical', 'high', 'medium', 'low')),
  regulatory_requirement BOOLEAN DEFAULT false,
  last_used_date DATE,
  usage_trend VARCHAR(20) CHECK (usage_trend IN ('increasing', 'stable', 'declining', 'unknown')),
  
  ai_replacement_candidate BOOLEAN DEFAULT false,
  ai_augmentation_candidate BOOLEAN DEFAULT false,
  workflow_automation_potential VARCHAR(20) CHECK (workflow_automation_potential IN ('high', 'medium', 'low', 'none')),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(200),
  
  CONSTRAINT valid_dates CHECK (contract_start_date <= contract_end_date),
  CONSTRAINT valid_licenses CHECK (total_licenses >= 0),
  CONSTRAINT valid_cost CHECK (total_annual_cost >= 0)
);

CREATE INDEX idx_software_renewal_date ON software_assets(renewal_date);
CREATE INDEX idx_software_category ON software_assets(category);
CREATE INDEX idx_software_vendor ON software_assets(vendor_name);
CREATE INDEX idx_software_replacement_priority ON software_assets(replacement_priority);
CREATE INDEX idx_software_business_criticality ON software_assets(business_criticality);
CREATE INDEX idx_software_days_to_renewal ON software_assets(days_to_renewal);

-- ============================================================================
-- TABLE 2: VENDOR_INTELLIGENCE
-- ============================================================================
CREATE TABLE vendor_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_name VARCHAR(200) UNIQUE NOT NULL,
  
  headquarters_location VARCHAR(200),
  founded_year INTEGER CHECK (founded_year > 1900 AND founded_year <= 2025),
  employee_count INTEGER CHECK (employee_count >= 0),
  company_status VARCHAR(50) CHECK (company_status IN ('public', 'private', 'acquired', 'startup', 'unknown')),
  parent_company VARCHAR(200),
  stock_ticker VARCHAR(10),
  website_url TEXT,
  
  annual_revenue DECIMAL(15,2) CHECK (annual_revenue >= 0),
  revenue_growth_rate DECIMAL(5,2),
  profitability VARCHAR(20) CHECK (profitability IN ('profitable', 'break-even', 'burning-cash', 'unknown')),
  funding_stage VARCHAR(50),
  last_funding_date DATE,
  last_funding_amount DECIMAL(15,2) CHECK (last_funding_amount >= 0),
  
  financial_risk_score DECIMAL(3,2) CHECK (financial_risk_score BETWEEN 0 AND 1),
  acquisition_risk VARCHAR(20) CHECK (acquisition_risk IN ('high', 'medium', 'low', 'unknown')),
  technology_risk VARCHAR(20) CHECK (technology_risk IN ('high', 'medium', 'low', 'unknown')),
  vendor_lock_in_severity VARCHAR(20) CHECK (vendor_lock_in_severity IN ('severe', 'moderate', 'low', 'minimal')),
  
  market_position VARCHAR(50) CHECK (market_position IN ('leader', 'challenger', 'niche', 'declining', 'emerging')),
  major_competitors TEXT[],
  customer_count INTEGER CHECK (customer_count >= 0),
  notable_customers TEXT[],
  
  support_quality_rating DECIMAL(2,1) CHECK (support_quality_rating BETWEEN 1 AND 5),
  response_time_sla VARCHAR(50),
  customer_satisfaction_score DECIMAL(3,1) CHECK (customer_satisfaction_score BETWEEN 0 AND 100),
  
  product_roadmap_summary TEXT,
  recent_acquisitions TEXT[],
  recent_layoffs BOOLEAN DEFAULT false,
  leadership_changes TEXT,
  security_incidents TEXT[],
  
  last_researched_date DATE,
  research_summary TEXT,
  analyst_reports TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_risk_score ON vendor_intelligence(financial_risk_score);
CREATE INDEX idx_vendor_market_position ON vendor_intelligence(market_position);
CREATE INDEX idx_vendor_last_researched ON vendor_intelligence(last_researched_date);

-- ============================================================================
-- TABLE 3: ALTERNATIVE_SOLUTIONS
-- ============================================================================
CREATE TABLE alternative_solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_software_id UUID REFERENCES software_assets(id) ON DELETE CASCADE,
  
  alternative_name VARCHAR(200) NOT NULL,
  alternative_vendor VARCHAR(200),
  alternative_type VARCHAR(50) CHECK (alternative_type IN ('commercial', 'open-source', 'ai-powered', 'custom-built', 'hybrid')),
  alternative_url TEXT,
  
  cost_comparison DECIMAL(12,2) CHECK (cost_comparison >= 0),
  cost_savings_percentage DECIMAL(5,2),
  feature_parity_score DECIMAL(3,2) CHECK (feature_parity_score BETWEEN 0 AND 1),
  missing_critical_features TEXT[],
  additional_capabilities TEXT[],
  
  implementation_complexity VARCHAR(20) CHECK (implementation_complexity IN ('low', 'medium', 'high', 'very-high')),
  estimated_migration_time_weeks INTEGER CHECK (estimated_migration_time_weeks > 0),
  estimated_migration_cost DECIMAL(12,2) CHECK (estimated_migration_cost >= 0),
  training_required VARCHAR(20) CHECK (training_required IN ('minimal', 'moderate', 'extensive')),
  
  integration_compatibility_score DECIMAL(3,2) CHECK (integration_compatibility_score BETWEEN 0 AND 1),
  api_quality VARCHAR(20) CHECK (api_quality IN ('excellent', 'good', 'limited', 'none', 'unknown')),
  security_compliance BOOLEAN DEFAULT false,
  regulatory_compliant BOOLEAN DEFAULT false,
  
  replacement_risk_score DECIMAL(3,2) CHECK (replacement_risk_score BETWEEN 0 AND 1),
  rollback_difficulty VARCHAR(20) CHECK (rollback_difficulty IN ('easy', 'moderate', 'difficult', 'impossible')),
  business_continuity_risk VARCHAR(20) CHECK (business_continuity_risk IN ('low', 'medium', 'high', 'critical')),
  
  recommendation_status VARCHAR(50) CHECK (recommendation_status IN ('strongly-recommend', 'recommend', 'consider', 'not-recommended', 'needs-investigation')),
  recommendation_reasoning TEXT,
  pilot_feasibility VARCHAR(20) CHECK (pilot_feasibility IN ('ideal', 'possible', 'difficult', 'not-feasible')),
  
  case_studies TEXT[],
  reference_customers TEXT[],
  proof_of_concept_completed BOOLEAN DEFAULT false,
  poc_results_summary TEXT,
  poc_date DATE,
  
  payback_period_months INTEGER,
  three_year_total_savings DECIMAL(12,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alt_original_software ON alternative_solutions(original_software_id);
CREATE INDEX idx_alt_recommendation ON alternative_solutions(recommendation_status);
CREATE INDEX idx_alt_type ON alternative_solutions(alternative_type);
CREATE INDEX idx_alt_savings ON alternative_solutions(cost_savings_percentage);

-- ============================================================================
-- TABLE 4: USAGE_ANALYTICS
-- ============================================================================
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  software_id UUID REFERENCES software_assets(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  
  licenses_purchased INTEGER CHECK (licenses_purchased >= 0),
  licenses_active INTEGER CHECK (licenses_active >= 0),
  licenses_unused INTEGER, -- Changed from GENERATED
  utilization_percentage DECIMAL(5,2), -- Changed from GENERATED
  
  daily_active_users INTEGER CHECK (daily_active_users >= 0),
  weekly_active_users INTEGER CHECK (weekly_active_users >= 0),
  monthly_active_users INTEGER CHECK (monthly_active_users >= 0),
  power_users_count INTEGER CHECK (power_users_count >= 0),
  occasional_users_count INTEGER CHECK (occasional_users_count >= 0),
  inactive_users_count INTEGER CHECK (inactive_users_count >= 0),
  
  features_available INTEGER CHECK (features_available >= 0),
  features_used INTEGER CHECK (features_used >= 0),
  feature_utilization_percentage DECIMAL(5,2), -- Changed from GENERATED
  underutilized_features TEXT[],
  heavily_used_features TEXT[],
  
  cost_per_active_user DECIMAL(10,2),
  waste_amount DECIMAL(12,2) CHECK (waste_amount >= 0),
  
  usage_trend VARCHAR(20) CHECK (usage_trend IN ('increasing', 'stable', 'declining', 'volatile')),
  trend_percentage DECIMAL(5,2),
  
  optimization_opportunity DECIMAL(12,2) CHECK (optimization_opportunity >= 0),
  right_sizing_recommendation TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_license_numbers CHECK (licenses_active <= licenses_purchased),
  CONSTRAINT valid_feature_numbers CHECK (features_used <= features_available),
  UNIQUE(software_id, analysis_date)
);

CREATE INDEX idx_usage_software ON usage_analytics(software_id);
CREATE INDEX idx_usage_date ON usage_analytics(analysis_date);
CREATE INDEX idx_usage_waste ON usage_analytics(waste_amount);

-- ============================================================================
-- TABLE 5: INTEGRATION_DEPENDENCIES
-- ============================================================================
CREATE TABLE integration_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  source_software_id UUID REFERENCES software_assets(id) ON DELETE CASCADE,
  target_software_id UUID REFERENCES software_assets(id) ON DELETE CASCADE,
  
  integration_name VARCHAR(200),
  integration_type VARCHAR(50) CHECK (integration_type IN ('api', 'file-transfer', 'database', 'manual', 'embedded', 'webhook', 'etl')),
  integration_method VARCHAR(100),
  data_flow_direction VARCHAR(20) CHECK (data_flow_direction IN ('bidirectional', 'source-to-target', 'target-to-source')),
  
  business_criticality VARCHAR(20) CHECK (business_criticality IN ('critical', 'high', 'medium', 'low')),
  data_volume VARCHAR(50) CHECK (data_volume IN ('realtime', 'hourly', 'daily', 'weekly', 'monthly', 'on-demand')),
  failure_impact TEXT,
  
  api_stability VARCHAR(20) CHECK (api_stability IN ('stable', 'deprecated', 'beta', 'unknown')),
  authentication_method VARCHAR(100),
  has_documentation BOOLEAN DEFAULT false,
  custom_code_required BOOLEAN DEFAULT false,
  custom_code_location TEXT,
  
  replacement_blocker BOOLEAN DEFAULT false,
  workaround_available BOOLEAN DEFAULT false,
  workaround_description TEXT,
  migration_complexity VARCHAR(20) CHECK (migration_complexity IN ('simple', 'moderate', 'complex', 'very-complex')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT different_systems CHECK (source_software_id != target_software_id)
);

CREATE INDEX idx_integration_source ON integration_dependencies(source_software_id);
CREATE INDEX idx_integration_target ON integration_dependencies(target_software_id);
CREATE INDEX idx_integration_criticality ON integration_dependencies(business_criticality);
CREATE INDEX idx_integration_blocker ON integration_dependencies(replacement_blocker);

-- ============================================================================
-- TABLE 6: RENEWAL_NEGOTIATIONS
-- ============================================================================
CREATE TABLE renewal_negotiations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  software_id UUID REFERENCES software_assets(id) ON DELETE CASCADE,
  renewal_date DATE NOT NULL,
  
  current_annual_cost DECIMAL(12,2) CHECK (current_annual_cost >= 0),
  current_terms TEXT,
  current_contract_length_years INTEGER,
  
  negotiation_status VARCHAR(50) CHECK (negotiation_status IN ('planning', 'in-progress', 'completed', 'cancelled', 'on-hold')),
  target_discount_percentage DECIMAL(5,2),
  target_annual_cost DECIMAL(12,2) CHECK (target_annual_cost >= 0),
  
  usage_decline_evidence TEXT,
  alternative_vendors TEXT[],
  competitive_pricing TEXT,
  budget_constraints TEXT,
  multi_year_commitment_option BOOLEAN DEFAULT false,
  
  vendor_eagerness VARCHAR(20) CHECK (vendor_eagerness IN ('desperate', 'willing', 'inflexible', 'unknown')),
  vendor_quarter_end DATE,
  vendor_recent_losses TEXT[],
  vendor_pressure_points TEXT[],
  
  negotiation_notes TEXT,
  offers_received JSONB DEFAULT '[]'::jsonb,
  counteroffers_made JSONB DEFAULT '[]'::jsonb,
  negotiation_started_date DATE,
  
  final_annual_cost DECIMAL(12,2) CHECK (final_annual_cost >= 0),
  savings_achieved DECIMAL(12,2),
  savings_percentage DECIMAL(5,2), -- Changed from GENERATED
  new_contract_terms TEXT,
  new_contract_length_years INTEGER,
  negotiation_completed_date DATE,
  
  lead_negotiator VARCHAR(200),
  stakeholders TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_renewal_software ON renewal_negotiations(software_id);
CREATE INDEX idx_renewal_date ON renewal_negotiations(renewal_date);
CREATE INDEX idx_renewal_status ON renewal_negotiations(negotiation_status);
CREATE INDEX idx_renewal_savings ON renewal_negotiations(savings_achieved);

-- ============================================================================
-- TABLE 7: REPLACEMENT_PROJECTS
-- ============================================================================
CREATE TABLE replacement_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  project_name VARCHAR(200) NOT NULL,
  project_code VARCHAR(50) UNIQUE NOT NULL,
  old_software_id UUID REFERENCES software_assets(id) ON DELETE RESTRICT,
  new_solution_id UUID REFERENCES alternative_solutions(id) ON DELETE RESTRICT,
  
  project_status VARCHAR(50) CHECK (project_status IN ('planning', 'pilot', 'migration', 'completed', 'cancelled', 'on-hold')) NOT NULL,
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  total_projected_savings DECIMAL(12,2) CHECK (total_projected_savings >= 0),
  implementation_cost DECIMAL(12,2) CHECK (implementation_cost >= 0),
  roi_months INTEGER CHECK (roi_months > 0),
  annual_recurring_savings DECIMAL(12,2) CHECK (annual_recurring_savings >= 0),
  
  project_sponsor VARCHAR(200),
  project_manager VARCHAR(200),
  technical_lead VARCHAR(200),
  business_lead VARCHAR(200),
  team_members TEXT[],
  
  discovery_complete BOOLEAN DEFAULT false,
  discovery_completion_date DATE,
  pilot_complete BOOLEAN DEFAULT false,
  pilot_completion_date DATE,
  migration_plan_approved BOOLEAN DEFAULT false,
  migration_plan_approval_date DATE,
  user_training_complete BOOLEAN DEFAULT false,
  user_training_completion_date DATE,
  go_live_complete BOOLEAN DEFAULT false,
  go_live_date DATE,
  
  current_risks TEXT[],
  current_issues TEXT[],
  mitigation_plans TEXT,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  user_adoption_rate DECIMAL(5,2) CHECK (user_adoption_rate BETWEEN 0 AND 100),
  performance_vs_baseline TEXT,
  user_satisfaction_score DECIMAL(3,1) CHECK (user_satisfaction_score BETWEEN 1 AND 5),
  issue_count INTEGER CHECK (issue_count >= 0),
  critical_issue_count INTEGER CHECK (critical_issue_count >= 0),
  
  what_went_well TEXT,
  what_went_wrong TEXT,
  recommendations TEXT,
  would_do_again BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_project_dates CHECK (start_date <= target_completion_date)
);

CREATE INDEX idx_project_status ON replacement_projects(project_status);
CREATE INDEX idx_project_old_software ON replacement_projects(old_software_id);
CREATE INDEX idx_project_completion_date ON replacement_projects(target_completion_date);
CREATE INDEX idx_project_roi ON replacement_projects(roi_months);

-- ============================================================================
-- TABLE 8: AI_AGENT_ANALYSES
-- ============================================================================
CREATE TABLE ai_agent_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  software_id UUID REFERENCES software_assets(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL,
  analysis_type VARCHAR(100) NOT NULL,
  
  analysis_date TIMESTAMPTZ DEFAULT NOW(),
  raw_findings TEXT NOT NULL,
  structured_findings JSONB DEFAULT '{}'::jsonb,
  
  key_insights TEXT[],
  recommendations TEXT[],
  risk_flags TEXT[],
  opportunities TEXT[],
  
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  sources_cited TEXT[],
  requires_human_review BOOLEAN DEFAULT true,
  
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  priority_level VARCHAR(20) CHECK (priority_level IN ('critical', 'high', 'medium', 'low')),
  
  reviewed_by VARCHAR(200),
  reviewed_at TIMESTAMPTZ,
  review_status VARCHAR(50) CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs-revision')) DEFAULT 'pending',
  human_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tokens_used INTEGER,
  processing_time_seconds DECIMAL(6,2)
);

CREATE INDEX idx_analysis_software ON ai_agent_analyses(software_id);
CREATE INDEX idx_analysis_agent ON ai_agent_analyses(agent_name);
CREATE INDEX idx_analysis_type ON ai_agent_analyses(analysis_type);
CREATE INDEX idx_analysis_status ON ai_agent_analyses(review_status);
CREATE INDEX idx_analysis_date ON ai_agent_analyses(analysis_date);

-- ============================================================================
-- TABLE 9: WORKFLOW_AUTOMATIONS
-- ============================================================================
CREATE TABLE workflow_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  workflow_name VARCHAR(200) NOT NULL,
  workflow_code VARCHAR(50) UNIQUE NOT NULL,
  replaces_software_id UUID REFERENCES software_assets(id) ON DELETE SET NULL,
  workflow_category VARCHAR(100),
  workflow_description TEXT,
  
  implementation_type VARCHAR(50) CHECK (implementation_type IN ('claude-api', 'n8n', 'zapier', 'custom-code', 'python', 'nodejs', 'hybrid')),
  workflow_status VARCHAR(50) CHECK (workflow_status IN ('development', 'testing', 'production', 'retired', 'failed')) NOT NULL,
  code_repository_url TEXT,
  deployment_url TEXT,
  
  trigger_type VARCHAR(100),
  trigger_schedule VARCHAR(100),
  input_sources TEXT[],
  output_destinations TEXT[],
  error_handling TEXT,
  
  executions_per_day INTEGER CHECK (executions_per_day >= 0),
  success_rate DECIMAL(5,2) CHECK (success_rate BETWEEN 0 AND 100),
  average_execution_time_seconds INTEGER CHECK (average_execution_time_seconds >= 0),
  cost_per_execution DECIMAL(8,4) CHECK (cost_per_execution >= 0),
  monthly_execution_cost DECIMAL(10,2),
  
  manual_effort_hours_saved DECIMAL(10,2) CHECK (manual_effort_hours_saved >= 0),
  annual_cost_savings DECIMAL(12,2) CHECK (annual_cost_savings >= 0),
  error_reduction_percentage DECIMAL(5,2) CHECK (error_reduction_percentage BETWEEN 0 AND 100),
  time_savings_percentage DECIMAL(5,2),
  
  last_execution_date TIMESTAMPTZ,
  last_success_date TIMESTAMPTZ,
  last_failure_date TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  alert_email TEXT,
  alert_threshold INTEGER DEFAULT 3,
  
  last_updated_date DATE,
  next_review_date DATE,
  maintainer VARCHAR(200),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(200)
);

CREATE INDEX idx_workflow_status ON workflow_automations(workflow_status);
CREATE INDEX idx_workflow_replaces ON workflow_automations(replaces_software_id);
CREATE INDEX idx_workflow_savings ON workflow_automations(annual_cost_savings);
CREATE INDEX idx_workflow_last_execution
