-- ================================================================
-- CONTRACT INTELLIGENCE SCANNER - DATABASE MIGRATION
-- Run this SQL in your Neon SQL editor
-- ================================================================

-- ================================================================
-- 1. CONTRACTS
-- Stores uploaded contract metadata and AI-extracted terms
-- ================================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID REFERENCES software(id) ON DELETE SET NULL,

  -- Contract Identification
  contract_name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(100) DEFAULT 'subscription', -- subscription, perpetual, enterprise, etc.

  -- File Storage
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  file_type VARCHAR(50), -- pdf, docx, txt
  file_url TEXT, -- External storage URL or base64 data URI
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),

  -- AI Extraction Status
  analysis_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  analysis_completed_at TIMESTAMPTZ,
  analysis_error TEXT,

  -- Extracted Key Terms
  contract_start_date DATE,
  contract_end_date DATE,
  renewal_date DATE,
  notice_period_days INTEGER, -- Days before renewal to give notice
  auto_renewal BOOLEAN DEFAULT FALSE,
  cancellation_deadline DATE, -- Last date to cancel before auto-renewal

  -- Financial Terms
  contract_value DECIMAL(15,2),
  payment_frequency VARCHAR(50), -- monthly, quarterly, annually
  payment_terms VARCHAR(100), -- net-30, net-60, advance, etc.
  price_increase_clause TEXT,
  price_increase_percentage DECIMAL(5,2),

  -- Terms & Conditions
  termination_clause TEXT,
  early_termination_fee DECIMAL(15,2),
  refund_policy TEXT,
  liability_cap DECIMAL(15,2),
  data_retention_policy TEXT,

  -- Service Level Agreement
  sla_uptime_percentage DECIMAL(5,2),
  sla_response_time VARCHAR(100),
  sla_penalty_clause TEXT,

  -- Other Important Terms
  intellectual_property_clause TEXT,
  confidentiality_clause TEXT,
  warranty_clause TEXT,
  indemnification_clause TEXT,
  dispute_resolution TEXT, -- arbitration, litigation, mediation
  governing_law VARCHAR(100), -- jurisdiction

  -- Full Text (for search)
  full_text TEXT,

  -- AI Summary
  ai_summary TEXT,
  key_highlights JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_company ON contracts(company_id);
CREATE INDEX idx_contracts_software ON contracts(software_id);
CREATE INDEX idx_contracts_renewal_date ON contracts(renewal_date);
CREATE INDEX idx_contracts_cancellation_deadline ON contracts(cancellation_deadline);
CREATE INDEX idx_contracts_status ON contracts(analysis_status);

-- ================================================================
-- 2. CONTRACT RISK ALERTS
-- AI-identified risks and important dates
-- ================================================================
CREATE TABLE IF NOT EXISTS contract_risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Alert Details
  risk_type VARCHAR(100) NOT NULL, -- auto_renewal, price_increase, termination_deadline, liability, data_security, etc.
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Financial Impact
  potential_cost_impact DECIMAL(15,2),

  -- Actionable Items
  action_required BOOLEAN DEFAULT TRUE,
  action_deadline DATE,
  action_description TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, acknowledged, resolved, dismissed
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_alerts_contract ON contract_risk_alerts(contract_id);
CREATE INDEX idx_risk_alerts_company ON contract_risk_alerts(company_id);
CREATE INDEX idx_risk_alerts_severity ON contract_risk_alerts(severity);
CREATE INDEX idx_risk_alerts_status ON contract_risk_alerts(status);
CREATE INDEX idx_risk_alerts_deadline ON contract_risk_alerts(action_deadline);

-- ================================================================
-- 3. CONTRACT CLAUSES LIBRARY
-- Reusable clause database across all contracts
-- ================================================================
CREATE TABLE IF NOT EXISTS contract_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clause Identification
  clause_type VARCHAR(100) NOT NULL, -- termination, liability, sla, payment, renewal, etc.
  clause_name VARCHAR(255) NOT NULL,

  -- Clause Content
  clause_text TEXT NOT NULL,
  clause_summary TEXT,

  -- Assessment
  favorability VARCHAR(20), -- vendor_favorable, balanced, customer_favorable
  risk_level VARCHAR(20), -- low, medium, high, critical

  -- Metadata
  vendor_name VARCHAR(255),
  software_category VARCHAR(100),
  frequency_count INTEGER DEFAULT 1, -- How many contracts have this clause

  -- Analysis
  ai_analysis TEXT,
  red_flags JSONB, -- Array of potential issues
  negotiation_tips JSONB, -- Array of negotiation advice

  -- Source
  source_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clauses_type ON contract_clauses(clause_type);
CREATE INDEX idx_clauses_vendor ON contract_clauses(vendor_name);
CREATE INDEX idx_clauses_risk ON contract_clauses(risk_level);
CREATE INDEX idx_clauses_favorability ON contract_clauses(favorability);

-- ================================================================
-- 4. CONTRACT COMPARISONS
-- Compare contracts across vendors
-- ================================================================
CREATE TABLE IF NOT EXISTS contract_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Comparison Metadata
  comparison_name VARCHAR(255) NOT NULL,
  comparison_type VARCHAR(100), -- vendor_comparison, renewal_comparison, category_comparison

  -- Contracts Being Compared
  contract_ids JSONB NOT NULL, -- Array of contract IDs

  -- Comparison Results
  comparison_summary TEXT,
  key_differences JSONB,
  cost_comparison JSONB,
  terms_comparison JSONB,

  -- Recommendation
  recommended_contract_id UUID REFERENCES contracts(id),
  recommendation_reasoning TEXT,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comparisons_company ON contract_comparisons(company_id);
CREATE INDEX idx_comparisons_created_at ON contract_comparisons(created_at DESC);

-- ================================================================
-- 5. CONTRACT RENEWAL REMINDERS
-- Automated reminders for contract renewals
-- ================================================================
CREATE TABLE IF NOT EXISTS contract_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Reminder Details
  reminder_type VARCHAR(100) NOT NULL, -- renewal_approaching, cancellation_deadline, price_increase, term_ending
  reminder_date DATE NOT NULL,
  days_before INTEGER NOT NULL, -- Days before the event

  -- Message
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, acknowledged, dismissed
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),

  -- Notification Channels
  email_sent BOOLEAN DEFAULT FALSE,
  slack_sent BOOLEAN DEFAULT FALSE,
  in_app_notification_sent BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_contract ON contract_reminders(contract_id);
CREATE INDEX idx_reminders_company ON contract_reminders(company_id);
CREATE INDEX idx_reminders_date ON contract_reminders(reminder_date);
CREATE INDEX idx_reminders_status ON contract_reminders(status);

-- ================================================================
-- VERIFICATION
-- ================================================================
SELECT 'contracts' as table_name, COUNT(*) as rows FROM contracts
UNION ALL
SELECT 'contract_risk_alerts', COUNT(*) FROM contract_risk_alerts
UNION ALL
SELECT 'contract_clauses', COUNT(*) FROM contract_clauses
UNION ALL
SELECT 'contract_comparisons', COUNT(*) FROM contract_comparisons
UNION ALL
SELECT 'contract_reminders', COUNT(*) FROM contract_reminders;

-- ✅ Migration Complete!
