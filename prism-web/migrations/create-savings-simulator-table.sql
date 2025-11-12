-- Savings Simulator Table
-- Tracks "what-if" scenarios for software consolidation

CREATE TABLE IF NOT EXISTS savings_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Scenario Details
  scenario_type VARCHAR(50) CHECK (scenario_type IN ('consolidate', 'switch', 'eliminate')),
  software_ids JSONB NOT NULL, -- Array of software IDs involved
  target_software_id UUID, -- Target software (for consolidate/switch)
  description TEXT,

  -- Financial Analysis
  current_annual_cost DECIMAL(15,2) NOT NULL,
  estimated_new_cost DECIMAL(15,2),
  annual_savings DECIMAL(15,2),
  implementation_cost DECIMAL(15,2),
  break_even_months INTEGER,

  -- AI Analysis
  feasibility_score DECIMAL(5,2), -- 0-100
  recommendation VARCHAR(50), -- proceed, consider, not_recommended
  analysis_data JSONB, -- Full AI analysis including risks, benefits, steps

  -- Status Tracking
  status VARCHAR(50) DEFAULT 'simulated', -- simulated, approved, in_progress, completed, rejected
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_simulations_company ON savings_simulations(company_id);
CREATE INDEX idx_simulations_scenario ON savings_simulations(scenario_type);
CREATE INDEX idx_simulations_savings ON savings_simulations(annual_savings DESC);
CREATE INDEX idx_simulations_created ON savings_simulations(created_at DESC);

COMMENT ON TABLE savings_simulations IS 'AI-powered what-if scenarios for software consolidation and optimization';
COMMENT ON COLUMN savings_simulations.feasibility_score IS 'AI-generated feasibility score (0-100)';
COMMENT ON COLUMN savings_simulations.analysis_data IS 'Full AI analysis including risks, benefits, migration steps';
