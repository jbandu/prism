-- Create PRISM savings log table to track cost savings attributed to PRISM
CREATE TABLE IF NOT EXISTS prism_savings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID,
  software_name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  annual_savings NUMERIC(15,2) NOT NULL,
  savings_type VARCHAR(50) NOT NULL, -- 'retirement', 'license_optimization', 'tier_change', 'alternative_switch', 'negotiation'
  identified_by VARCHAR(50) NOT NULL DEFAULT 'prism', -- 'prism', 'client', 'both'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create index for faster company queries
CREATE INDEX IF NOT EXISTS idx_prism_savings_company ON prism_savings_log(company_id);
CREATE INDEX IF NOT EXISTS idx_prism_savings_created ON prism_savings_log(created_at DESC);

-- Add unique constraint for software imports (prevent duplicate software per company)
ALTER TABLE software_assets
ADD CONSTRAINT unique_software_per_company
UNIQUE (company_id, software_name, vendor_name);
