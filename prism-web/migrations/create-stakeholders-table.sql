-- Create software_stakeholders table
CREATE TABLE IF NOT EXISTS software_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  software_asset_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role_type VARCHAR(100) NOT NULL,
  role_level VARCHAR(50),
  responsibilities TEXT[],
  decision_weight INTEGER CHECK (decision_weight >= 0 AND decision_weight <= 100),
  engagement_frequency VARCHAR(50),
  last_contacted TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure a person can only have one role per software
  UNIQUE(software_asset_id, person_id, role_type)
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_software_stakeholders_software ON software_stakeholders(software_asset_id);
CREATE INDEX IF NOT EXISTS idx_software_stakeholders_person ON software_stakeholders(person_id);
CREATE INDEX IF NOT EXISTS idx_software_stakeholders_role ON software_stakeholders(role_type);

-- Create role_definitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_definitions (
  role_type VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(200) NOT NULL,
  role_category VARCHAR(50) NOT NULL,
  description TEXT,
  default_decision_weight INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default role definitions
INSERT INTO role_definitions (role_type, display_name, role_category, description, default_decision_weight)
VALUES
  ('executive_sponsor', 'Executive Sponsor', 'leadership', 'Executive-level sponsor providing strategic direction and budget approval', 100),
  ('business_owner', 'Business Owner', 'business', 'Primary business stakeholder responsible for requirements and outcomes', 90),
  ('it_owner', 'IT Owner', 'technical', 'IT lead responsible for technical implementation and maintenance', 80),
  ('procurement_lead', 'Procurement Lead', 'operations', 'Procurement specialist managing vendor relationships and contracts', 70),
  ('finance_approver', 'Finance Approver', 'finance', 'Finance representative approving budget and spend', 75),
  ('security_reviewer', 'Security Reviewer', 'security', 'Security specialist ensuring compliance and risk management', 85),
  ('end_user', 'End User', 'user', 'Regular user of the software application', 30),
  ('administrator', 'Administrator', 'technical', 'System administrator with configuration and management rights', 60),
  ('champion', 'Champion', 'advocacy', 'Internal advocate promoting adoption and best practices', 50)
ON CONFLICT (role_type) DO NOTHING;

-- Add comment
COMMENT ON TABLE software_stakeholders IS 'Maps people to software assets with their roles and responsibilities';
