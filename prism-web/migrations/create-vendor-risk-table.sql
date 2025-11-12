-- Vendor Risk Assessments Table
-- AI-powered vendor health and risk analysis

CREATE TABLE IF NOT EXISTS vendor_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vendor Details
  vendor_name VARCHAR(255) NOT NULL,
  software_name VARCHAR(255) NOT NULL,

  -- Overall Risk Score
  overall_risk_score INTEGER CHECK (overall_risk_score BETWEEN 0 AND 100),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

  -- Detailed Analysis (stored as JSONB)
  analysis_data JSONB NOT NULL,
  -- Structure:
  -- {
  --   risk_factors: {
  --     financial_health: { score, rating, indicators },
  --     acquisition_risk: { score, likelihood, potential_acquirers, impact },
  --     market_position: { score, position, market_share_trend, competitors },
  --     pricing_volatility: { score, trend, recent_changes },
  --     support_quality: { score, rating, indicators },
  --     security_track_record: { score, rating, recent_incidents }
  --   },
  --   recommendations: [],
  --   mitigation_strategies: [],
  --   monitoring_priorities: []
  -- }

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',

  -- Index for finding recent analyses
  UNIQUE(vendor_name, created_at)
);

CREATE INDEX idx_vendor_risk_vendor ON vendor_risk_assessments(vendor_name);
CREATE INDEX idx_vendor_risk_score ON vendor_risk_assessments(overall_risk_score DESC);
CREATE INDEX idx_vendor_risk_level ON vendor_risk_assessments(risk_level);
CREATE INDEX idx_vendor_risk_created ON vendor_risk_assessments(created_at DESC);

-- Vendor Risk Alerts Table
-- Track when vendor risk changes significantly
CREATE TABLE IF NOT EXISTS vendor_risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name VARCHAR(255) NOT NULL,

  -- Alert Details
  alert_type VARCHAR(50), -- risk_increase, acquisition_rumor, security_incident, financial_trouble
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Risk Change
  previous_risk_score INTEGER,
  new_risk_score INTEGER,
  risk_change INTEGER, -- Positive = increased risk

  -- Alert Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source_url TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'new', -- new, acknowledged, resolved, dismissed
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_alerts_vendor ON vendor_risk_alerts(vendor_name);
CREATE INDEX idx_risk_alerts_severity ON vendor_risk_alerts(severity);
CREATE INDEX idx_risk_alerts_status ON vendor_risk_alerts(status);
CREATE INDEX idx_risk_alerts_created ON vendor_risk_alerts(created_at DESC);

COMMENT ON TABLE vendor_risk_assessments IS 'AI-powered vendor health and risk analysis with 30-day caching';
COMMENT ON TABLE vendor_risk_alerts IS 'Alerts for significant changes in vendor risk profile';
COMMENT ON COLUMN vendor_risk_assessments.analysis_data IS 'Full AI analysis including risk factors, recommendations, and mitigation strategies';
