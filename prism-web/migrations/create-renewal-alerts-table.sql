-- Renewal Alert Preferences Table
-- Configurable alerts for contract renewals

CREATE TABLE IF NOT EXISTS renewal_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,

  -- Alert Thresholds (days before renewal)
  critical_days INTEGER DEFAULT 30,  -- Red alert
  warning_days INTEGER DEFAULT 60,   -- Yellow alert
  info_days INTEGER DEFAULT 90,      -- Blue alert

  -- Notification Channels
  email_enabled BOOLEAN DEFAULT true,
  slack_enabled BOOLEAN DEFAULT false,
  slack_webhook_url TEXT,
  email_recipients JSONB, -- Array of email addresses

  -- Alert Schedule
  daily_summary_enabled BOOLEAN DEFAULT true,
  daily_summary_time TIME DEFAULT '09:00:00',
  weekly_summary_enabled BOOLEAN DEFAULT true,
  weekly_summary_day INTEGER DEFAULT 1, -- 1 = Monday

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_renewal_prefs_company ON renewal_alert_preferences(company_id);

-- Alert History Table (track sent alerts)
CREATE TABLE IF NOT EXISTS renewal_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,

  -- Alert Details
  alert_type VARCHAR(50), -- critical, warning, info
  days_until_renewal INTEGER,
  notification_channel VARCHAR(50), -- email, slack

  -- Recipients
  sent_to JSONB, -- Array of recipients

  -- Status
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, failed
  error_message TEXT
);

CREATE INDEX idx_alert_history_company ON renewal_alert_history(company_id);
CREATE INDEX idx_alert_history_contract ON renewal_alert_history(contract_id);
CREATE INDEX idx_alert_history_sent ON renewal_alert_history(sent_at DESC);

COMMENT ON TABLE renewal_alert_preferences IS 'Company-specific preferences for contract renewal notifications';
COMMENT ON TABLE renewal_alert_history IS 'History of all sent renewal alerts for auditing';
