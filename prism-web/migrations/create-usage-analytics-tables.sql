-- ================================================================
-- USAGE HEATMAP ANALYTICS - DATABASE MIGRATION
-- Run this SQL in your Neon SQL editor
-- ================================================================

-- ================================================================
-- 1. SOFTWARE USAGE LOGS
-- Daily/hourly usage tracking per software
-- ================================================================
CREATE TABLE IF NOT EXISTS software_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Time Period
  log_date DATE NOT NULL,
  log_hour INTEGER, -- 0-23, null for daily aggregates

  -- Usage Metrics
  active_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  features_used JSONB, -- Array of feature names used

  -- Activity Intensity (0-100)
  activity_score INTEGER CHECK (activity_score BETWEEN 0 AND 100),

  -- Cost Attribution
  cost_allocation DECIMAL(10,2), -- Portion of daily cost

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data_source VARCHAR(100), -- manual, api, integration, estimated

  UNIQUE(software_id, log_date, log_hour)
);

CREATE INDEX idx_usage_logs_software ON software_usage_logs(software_id);
CREATE INDEX idx_usage_logs_company ON software_usage_logs(company_id);
CREATE INDEX idx_usage_logs_date ON software_usage_logs(log_date DESC);
CREATE INDEX idx_usage_logs_activity ON software_usage_logs(activity_score DESC);

-- ================================================================
-- 2. USER ACTIVITY
-- Individual user activity per software
-- ================================================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- User Info (if not in users table)
  user_email VARCHAR(255),
  user_name VARCHAR(255),

  -- Activity Period
  activity_date DATE NOT NULL,

  -- Usage Metrics
  login_count INTEGER DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0,
  features_accessed JSONB, -- Array of feature names

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(software_id, user_email, activity_date)
);

CREATE INDEX idx_user_activity_software ON user_activity(software_id);
CREATE INDEX idx_user_activity_company ON user_activity(company_id);
CREATE INDEX idx_user_activity_date ON user_activity(activity_date DESC);
CREATE INDEX idx_user_activity_user ON user_activity(user_email);

-- ================================================================
-- 3. USAGE INSIGHTS
-- Pre-computed insights and trends
-- ================================================================
CREATE TABLE IF NOT EXISTS usage_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, quarterly

  -- Aggregated Metrics
  avg_daily_users DECIMAL(10,2),
  peak_users INTEGER,
  peak_date DATE,
  total_sessions INTEGER,
  avg_session_duration_minutes DECIMAL(10,2),

  -- Utilization Insights
  license_utilization_rate DECIMAL(5,2),
  unused_licenses INTEGER,
  wasted_cost DECIMAL(15,2),

  -- Trend Analysis
  usage_trend VARCHAR(50), -- increasing, decreasing, stable, volatile
  trend_percentage DECIMAL(5,2), -- % change vs previous period

  -- Activity Patterns
  most_active_day VARCHAR(20), -- monday, tuesday, etc.
  most_active_hour INTEGER, -- 0-23
  least_active_day VARCHAR(20),
  activity_distribution JSONB, -- { day: count } for each day of week

  -- Feature Usage
  most_used_features JSONB, -- Array of {feature, usage_count}
  least_used_features JSONB,

  -- Cost Efficiency
  cost_per_active_user DECIMAL(10,2),
  cost_per_session DECIMAL(10,2),

  -- AI Insights
  ai_recommendations JSONB, -- Array of recommendation strings
  waste_opportunities JSONB, -- Array of {type, potential_savings}

  -- Metadata
  computed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(software_id, period_start, period_type)
);

CREATE INDEX idx_insights_software ON usage_insights(software_id);
CREATE INDEX idx_insights_company ON usage_insights(company_id);
CREATE INDEX idx_insights_period ON usage_insights(period_start DESC);

-- ================================================================
-- 4. SUPPORT TICKETS
-- Track support usage per software
-- ================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Ticket Info
  ticket_id VARCHAR(255), -- External ticket ID
  ticket_type VARCHAR(100), -- bug, feature_request, question, incident
  severity VARCHAR(50), -- critical, high, medium, low
  status VARCHAR(50), -- open, in_progress, resolved, closed

  -- Content
  subject VARCHAR(500),
  description TEXT,

  -- People
  requester_email VARCHAR(255),
  requester_name VARCHAR(255),
  assigned_to VARCHAR(255),

  -- Timeline
  created_at TIMESTAMPTZ NOT NULL,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Metrics
  response_time_minutes INTEGER,
  resolution_time_minutes INTEGER,

  -- Tags
  tags JSONB, -- Array of tags

  -- Metadata
  data_source VARCHAR(100) -- zendesk, jira, manual, etc.
);

CREATE INDEX idx_support_tickets_software ON support_tickets(software_id);
CREATE INDEX idx_support_tickets_company ON support_tickets(company_id);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_severity ON support_tickets(severity);

-- ================================================================
-- 5. USAGE ANOMALIES
-- Detect unusual usage patterns
-- ================================================================
CREATE TABLE IF NOT EXISTS usage_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Anomaly Details
  anomaly_type VARCHAR(100) NOT NULL, -- spike, drop, unusual_pattern, ghost_user
  severity VARCHAR(50) NOT NULL, -- critical, high, medium, low

  -- Detection
  detected_date DATE NOT NULL,
  affected_period_start DATE,
  affected_period_end DATE,

  -- Metrics
  expected_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  deviation_percentage DECIMAL(5,2),

  -- Description
  title VARCHAR(255),
  description TEXT,
  potential_cause TEXT,
  recommended_action TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'new', -- new, investigating, resolved, false_positive
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anomalies_software ON usage_anomalies(software_id);
CREATE INDEX idx_anomalies_company ON usage_anomalies(company_id);
CREATE INDEX idx_anomalies_date ON usage_anomalies(detected_date DESC);
CREATE INDEX idx_anomalies_severity ON usage_anomalies(severity);

-- ================================================================
-- VERIFICATION
-- ================================================================
SELECT 'software_usage_logs' as table_name, COUNT(*) as rows FROM software_usage_logs
UNION ALL
SELECT 'user_activity', COUNT(*) FROM user_activity
UNION ALL
SELECT 'usage_insights', COUNT(*) FROM usage_insights
UNION ALL
SELECT 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL
SELECT 'usage_anomalies', COUNT(*) FROM usage_anomalies;

-- ✅ Migration Complete!
