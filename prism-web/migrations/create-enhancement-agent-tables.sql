-- ================================================================
-- WEEKLY DATA ENHANCEMENT AGENT
-- Automated software data enrichment system
-- ================================================================

-- ================================================================
-- 1. ENHANCEMENT SCHEDULES
-- Per-company configuration for automated enhancement
-- ================================================================
CREATE TABLE IF NOT EXISTS enhancement_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,

  -- Configuration
  enabled BOOLEAN DEFAULT true,
  fields_to_enhance JSONB DEFAULT '["description", "category", "key_features", "use_cases", "integration_capabilities"]'::jsonb,
  ai_provider VARCHAR(50) DEFAULT 'gemini', -- claude, grok, gemini

  -- Schedule (weekly by default)
  run_day_of_week INTEGER DEFAULT 1 CHECK (run_day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday, etc.
  run_hour INTEGER DEFAULT 2 CHECK (run_hour BETWEEN 0 AND 23), -- Hour of day (0-23)

  -- Tracking
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  total_runs INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enhancement_schedules_company ON enhancement_schedules(company_id);
CREATE INDEX idx_enhancement_schedules_enabled ON enhancement_schedules(enabled);
CREATE INDEX idx_enhancement_schedules_next_run ON enhancement_schedules(next_run);

COMMENT ON TABLE enhancement_schedules IS 'Weekly automated data enhancement configuration per company';
COMMENT ON COLUMN enhancement_schedules.fields_to_enhance IS 'Array of field names to enhance: description, category, key_features, etc.';
COMMENT ON COLUMN enhancement_schedules.run_day_of_week IS '0 = Sunday, 1 = Monday, ..., 6 = Saturday';

-- ================================================================
-- 2. ENHANCEMENT RUNS
-- Log of all enhancement executions
-- ================================================================
CREATE TABLE IF NOT EXISTS enhancement_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Run Summary
  total_software INTEGER NOT NULL,
  enhanced_count INTEGER NOT NULL,
  failed_count INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,

  -- Detailed Results
  results JSONB NOT NULL,
  -- Structure:
  -- [{
  --   software_id, software_name,
  --   fields_enhanced: [],
  --   before: {}, after: {},
  --   confidence_score: 0.0-1.0,
  --   success: true/false,
  --   error: "..."
  -- }]

  -- Run Type
  run_type VARCHAR(50) DEFAULT 'scheduled', -- scheduled, manual, on_demand
  triggered_by UUID REFERENCES users(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enhancement_runs_company ON enhancement_runs(company_id);
CREATE INDEX idx_enhancement_runs_created ON enhancement_runs(created_at DESC);
CREATE INDEX idx_enhancement_runs_type ON enhancement_runs(run_type);

COMMENT ON TABLE enhancement_runs IS 'History of all data enhancement executions';
COMMENT ON COLUMN enhancement_runs.results IS 'Detailed JSON array of enhancement results per software';

-- ================================================================
-- 3. ENHANCEMENT AUDIT LOG
-- Track individual field changes for compliance/auditing
-- ================================================================
CREATE TABLE IF NOT EXISTS enhancement_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES enhancement_runs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Change Details
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  confidence_score DECIMAL(3,2), -- 0.00-1.00

  -- AI Metadata
  ai_provider VARCHAR(50),
  ai_model VARCHAR(100),
  tokens_used INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_run ON enhancement_audit_log(run_id);
CREATE INDEX idx_audit_log_company ON enhancement_audit_log(company_id);
CREATE INDEX idx_audit_log_software ON enhancement_audit_log(software_id);
CREATE INDEX idx_audit_log_field ON enhancement_audit_log(field_name);
CREATE INDEX idx_audit_log_created ON enhancement_audit_log(created_at DESC);

COMMENT ON TABLE enhancement_audit_log IS 'Detailed audit trail of every field enhancement';

-- ================================================================
-- 4. ENHANCEMENT QUALITY METRICS
-- Track accuracy and quality over time
-- ================================================================
CREATE TABLE IF NOT EXISTS enhancement_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Time Period
  date DATE NOT NULL,

  -- Quality Metrics
  total_enhancements INTEGER DEFAULT 0,
  high_confidence_count INTEGER DEFAULT 0, -- confidence >= 0.8
  medium_confidence_count INTEGER DEFAULT 0, -- 0.5 <= confidence < 0.8
  low_confidence_count INTEGER DEFAULT 0, -- confidence < 0.5

  -- User Feedback (if implemented)
  user_approved INTEGER DEFAULT 0,
  user_rejected INTEGER DEFAULT 0,
  user_modified INTEGER DEFAULT 0,

  -- Aggregate Stats
  avg_confidence_score DECIMAL(3,2),
  fields_enhanced JSONB, -- Count per field: {"description": 25, "category": 30, ...}

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, date)
);

CREATE INDEX idx_quality_metrics_company ON enhancement_quality_metrics(company_id);
CREATE INDEX idx_quality_metrics_date ON enhancement_quality_metrics(date DESC);

COMMENT ON TABLE enhancement_quality_metrics IS 'Daily/weekly quality metrics for data enhancement';

-- ================================================================
-- 5. ADD ENHANCEMENT TRACKING TO SOFTWARE TABLE
-- ================================================================
ALTER TABLE software ADD COLUMN IF NOT EXISTS last_enhanced TIMESTAMPTZ;
ALTER TABLE software ADD COLUMN IF NOT EXISTS enhancement_count INTEGER DEFAULT 0;
ALTER TABLE software ADD COLUMN IF NOT EXISTS last_enhancement_confidence DECIMAL(3,2);

CREATE INDEX IF NOT EXISTS idx_software_last_enhanced ON software(last_enhanced DESC);

COMMENT ON COLUMN software.last_enhanced IS 'Timestamp of last automated data enhancement';
COMMENT ON COLUMN software.enhancement_count IS 'Total number of times this software has been enhanced';
COMMENT ON COLUMN software.last_enhancement_confidence IS 'Confidence score (0-1) of last enhancement';

-- ================================================================
-- DEFAULT SCHEDULES FOR EXISTING COMPANIES
-- Enable enhancement for all companies by default (opt-out model)
-- ================================================================
INSERT INTO enhancement_schedules (company_id, enabled, run_day_of_week, run_hour)
SELECT
  id as company_id,
  true as enabled,
  1 as run_day_of_week, -- Monday
  2 as run_hour -- 2 AM
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM enhancement_schedules WHERE company_id = companies.id
);

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
SELECT 'enhancement_schedules' as table_name, COUNT(*) as rows FROM enhancement_schedules
UNION ALL
SELECT 'enhancement_runs', COUNT(*) FROM enhancement_runs
UNION ALL
SELECT 'enhancement_audit_log', COUNT(*) FROM enhancement_audit_log
UNION ALL
SELECT 'enhancement_quality_metrics', COUNT(*) FROM enhancement_quality_metrics;

-- Show all scheduled companies
SELECT
  c.company_name,
  es.enabled,
  es.run_day_of_week,
  es.run_hour,
  es.last_run,
  es.next_run,
  es.total_runs
FROM enhancement_schedules es
JOIN companies c ON c.id = es.company_id
ORDER BY es.next_run;

-- ✅ Enhancement Agent Migration Complete!
