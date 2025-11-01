-- ============================================================================
-- PRISM - Complete Database Schema with Authentication
-- Includes: Companies, Users, Software Assets
-- Compatible with: Neon (Serverless PostgreSQL)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: companies
-- Core table for client organizations
-- ============================================================================
CREATE TABLE IF NOT EXISTS companies (
  company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(200) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  employee_count INTEGER CHECK (employee_count > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(company_name);

-- ============================================================================
-- TABLE: users
-- Authentication and authorization
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'company_manager', 'viewer')),
  company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,

  -- Admin users don't need a company_id
  CONSTRAINT user_company_check CHECK (
    (role = 'admin' AND company_id IS NULL) OR
    (role IN ('company_manager', 'viewer') AND company_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);

-- ============================================================================
-- TABLE: software_assets
-- Software inventory for each company
-- ============================================================================
CREATE TABLE IF NOT EXISTS software_assets (
  software_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  software_name VARCHAR(200) NOT NULL,
  vendor_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  total_annual_cost DECIMAL(12,2) NOT NULL CHECK (total_annual_cost >= 0),
  total_licenses INTEGER CHECK (total_licenses >= 0),
  active_users INTEGER CHECK (active_users >= 0),
  utilization_rate DECIMAL(5,2),
  license_type VARCHAR(50) NOT NULL,
  renewal_date DATE NOT NULL,
  days_to_renewal INTEGER,
  contract_status VARCHAR(50) DEFAULT 'active',
  waste_amount DECIMAL(12,2) DEFAULT 0,
  potential_savings DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_licenses CHECK (active_users <= total_licenses OR total_licenses IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_software_company ON software_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_software_renewal ON software_assets(renewal_date);
CREATE INDEX IF NOT EXISTS idx_software_category ON software_assets(category);

-- ============================================================================
-- TABLE: ai_agent_analyses
-- AI analysis results
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_agent_analyses (
  analysis_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  software_id UUID REFERENCES software_assets(software_id) ON DELETE CASCADE,
  analysis_type VARCHAR(100) NOT NULL,
  analysis_data JSONB NOT NULL,
  agent_version VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_company ON ai_agent_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_analyses_software ON ai_agent_analyses(software_id);

-- ============================================================================
-- TABLE: client_reports
-- Generated reports for clients
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_reports (
  report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  report_data JSONB NOT NULL,
  generated_by VARCHAR(200) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_savings_identified DECIMAL(12,2) DEFAULT 0,
  action_items_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_reports_company ON client_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated ON client_reports(generated_at);

-- ============================================================================
-- FUNCTION: Update days_to_renewal automatically
-- ============================================================================
CREATE OR REPLACE FUNCTION update_days_to_renewal()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_to_renewal := (NEW.renewal_date - CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_days_to_renewal
  BEFORE INSERT OR UPDATE ON software_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_days_to_renewal();

-- ============================================================================
-- FUNCTION: Update utilization_rate automatically
-- ============================================================================
CREATE OR REPLACE FUNCTION update_utilization_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_licenses > 0 THEN
    NEW.utilization_rate := (NEW.active_users::DECIMAL / NEW.total_licenses::DECIMAL) * 100;
  ELSE
    NEW.utilization_rate := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_utilization_rate
  BEFORE INSERT OR UPDATE ON software_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_utilization_rate();

-- ============================================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_software_updated_at
  BEFORE UPDATE ON software_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
