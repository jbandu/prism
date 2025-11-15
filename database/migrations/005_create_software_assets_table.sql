-- ============================================
-- PRISM SOFTWARE ASSETS TABLE
-- Migration 005: Create software_assets table
-- ============================================
--
-- This migration creates the software_assets table which is used
-- for detailed software asset tracking and redundancy analysis.
--
-- Note: This table is separate from the 'software' table and provides
-- more comprehensive tracking of software licenses, costs, and usage.
--
-- ============================================

BEGIN;

-- Create software_assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS software_assets (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    asset_code VARCHAR(50) NOT NULL,
    software_name VARCHAR(200) NOT NULL,
    vendor_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    license_type VARCHAR(50) NOT NULL,
    total_annual_cost NUMERIC NOT NULL,
    cost_per_user NUMERIC,
    total_licenses INTEGER,
    active_users INTEGER,
    utilization_rate NUMERIC,
    vendor_contact_name VARCHAR(200),
    vendor_contact_email VARCHAR(200),
    contract_start_date DATE,
    contract_end_date DATE,
    renewal_date DATE NOT NULL,
    days_to_renewal INTEGER,
    auto_renewal BOOLEAN DEFAULT false,
    notice_period_days INTEGER DEFAULT 30,
    payment_frequency VARCHAR(20) DEFAULT 'annual',
    deployment_type VARCHAR(50),
    primary_use_case TEXT,
    business_owner VARCHAR(200),
    technical_owner VARCHAR(200),
    integration_complexity VARCHAR(20),
    api_available BOOLEAN DEFAULT false,
    replacement_priority VARCHAR(20),
    replacement_feasibility_score NUMERIC,
    business_criticality VARCHAR(20),
    regulatory_requirement BOOLEAN DEFAULT false,
    last_used_date DATE,
    usage_trend VARCHAR(20),
    ai_replacement_candidate BOOLEAN DEFAULT false,
    ai_augmentation_candidate BOOLEAN DEFAULT false,
    workflow_automation_potential VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by VARCHAR(200),
    company_id UUID,
    contract_status VARCHAR(50) DEFAULT 'active',
    waste_amount NUMERIC,
    potential_savings NUMERIC,
    PRIMARY KEY (id)
);

-- Add constraints
ALTER TABLE software_assets ADD CONSTRAINT software_assets_business_criticality_check
    CHECK (business_criticality IN ('mission-critical', 'high', 'medium', 'low'));

ALTER TABLE software_assets ADD CONSTRAINT software_assets_integration_complexity_check
    CHECK (integration_complexity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE software_assets ADD CONSTRAINT software_assets_replacement_feasibility_score_check
    CHECK (replacement_feasibility_score >= 0 AND replacement_feasibility_score <= 1);

ALTER TABLE software_assets ADD CONSTRAINT software_assets_replacement_priority_check
    CHECK (replacement_priority IN ('immediate', 'high', 'medium', 'low', 'never'));

ALTER TABLE software_assets ADD CONSTRAINT software_assets_usage_trend_check
    CHECK (usage_trend IN ('increasing', 'stable', 'declining', 'unknown'));

ALTER TABLE software_assets ADD CONSTRAINT software_assets_workflow_automation_potential_check
    CHECK (workflow_automation_potential IN ('high', 'medium', 'low', 'none'));

ALTER TABLE software_assets ADD CONSTRAINT valid_cost
    CHECK (total_annual_cost >= 0);

ALTER TABLE software_assets ADD CONSTRAINT valid_dates
    CHECK (contract_start_date <= contract_end_date);

ALTER TABLE software_assets ADD CONSTRAINT valid_licenses
    CHECK (total_licenses >= 0);

-- Add unique constraints
ALTER TABLE software_assets ADD CONSTRAINT software_assets_asset_code_key
    UNIQUE (asset_code);

ALTER TABLE software_assets ADD CONSTRAINT unique_software_per_company
    UNIQUE (company_id, software_name, vendor_name);

-- Add foreign key to companies table
ALTER TABLE software_assets ADD CONSTRAINT software_assets_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_software_assets_company_id ON software_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_software_assets_category ON software_assets(category);
CREATE INDEX IF NOT EXISTS idx_software_assets_vendor ON software_assets(vendor_name);
CREATE INDEX IF NOT EXISTS idx_software_assets_renewal_date ON software_assets(renewal_date);
CREATE INDEX IF NOT EXISTS idx_software_assets_contract_status ON software_assets(contract_status);
CREATE INDEX IF NOT EXISTS idx_software_assets_company_status ON software_assets(company_id, contract_status);

-- Add trigger to automatically calculate utilization_rate
CREATE OR REPLACE FUNCTION update_software_assets_utilization_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_licenses > 0 AND NEW.active_users IS NOT NULL THEN
    NEW.utilization_rate := (NEW.active_users::DECIMAL / NEW.total_licenses::DECIMAL) * 100;
  ELSE
    NEW.utilization_rate := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_software_assets_utilization_rate
  BEFORE INSERT OR UPDATE ON software_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_software_assets_utilization_rate();

-- Add trigger to automatically calculate days_to_renewal
CREATE OR REPLACE FUNCTION update_software_assets_days_to_renewal()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_to_renewal := (NEW.renewal_date - CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_software_assets_days_to_renewal
  BEFORE INSERT OR UPDATE ON software_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_software_assets_days_to_renewal();

COMMIT;

-- ============================================
-- END OF SOFTWARE_ASSETS TABLE MIGRATION
-- ============================================
