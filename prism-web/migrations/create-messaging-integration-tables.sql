-- Messaging Integration Tables (Slack/Teams Bot)
-- Feature #5: Slack/Teams Integration
-- Created: January 2025

-- Bot Configuration (per company)
CREATE TABLE IF NOT EXISTS bot_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Bot Settings
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('slack', 'teams', 'both')),
  enabled BOOLEAN DEFAULT true,

  -- Slack Configuration
  slack_workspace_id VARCHAR(255),
  slack_bot_token TEXT, -- Encrypted in production
  slack_webhook_url TEXT,
  slack_channel_alerts VARCHAR(255), -- Channel for alerts
  slack_channel_approvals VARCHAR(255), -- Channel for approvals

  -- Teams Configuration
  teams_tenant_id VARCHAR(255),
  teams_bot_token TEXT, -- Encrypted in production
  teams_webhook_url TEXT,
  teams_channel_alerts VARCHAR(255),
  teams_channel_approvals VARCHAR(255),

  -- Notification Preferences
  notify_renewals BOOLEAN DEFAULT true,
  notify_budget_alerts BOOLEAN DEFAULT true,
  notify_new_software BOOLEAN DEFAULT true,
  notify_contract_risks BOOLEAN DEFAULT true,
  notify_waste_detection BOOLEAN DEFAULT true,
  notify_redundancy BOOLEAN DEFAULT true,

  -- Alert Thresholds
  budget_alert_threshold DECIMAL(10,2) DEFAULT 1000.00,
  waste_alert_threshold DECIMAL(10,2) DEFAULT 500.00,
  renewal_alert_days INTEGER DEFAULT 60,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(company_id)
);

-- Software Request/Approval Workflow
CREATE TABLE IF NOT EXISTS software_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Request Details
  requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requested_by_name VARCHAR(255) NOT NULL,
  requested_by_email VARCHAR(255),

  software_name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255),
  category VARCHAR(100),

  -- Cost Information
  estimated_annual_cost DECIMAL(15,2),
  license_count_needed INTEGER,

  -- Request Context
  business_justification TEXT,
  urgency VARCHAR(50) CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  department VARCHAR(100),
  use_case TEXT,

  -- Approval Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by_name VARCHAR(255),
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Bot Integration
  slack_message_ts VARCHAR(255), -- Slack message timestamp for updates
  slack_thread_ts VARCHAR(255),
  teams_message_id VARCHAR(255),
  notification_sent BOOLEAN DEFAULT false,

  -- Alternative Suggestions
  suggested_alternatives JSONB, -- [{name, cost, reason}]
  redundancy_detected BOOLEAN DEFAULT false,
  redundant_with_software_ids UUID[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_software_requests_company ON software_requests(company_id);
CREATE INDEX idx_software_requests_status ON software_requests(status);

-- Budget Alerts
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Alert Details
  alert_type VARCHAR(100) NOT NULL CHECK (alert_type IN (
    'budget_exceeded',
    'budget_threshold',
    'unexpected_increase',
    'renewal_spike',
    'new_software_cost'
  )),

  severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Financial Impact
  current_amount DECIMAL(15,2),
  threshold_amount DECIMAL(15,2),
  overage_amount DECIMAL(15,2),

  -- Related Entities
  software_id UUID REFERENCES software(id) ON DELETE SET NULL,
  software_name VARCHAR(255),

  -- Notification Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,

  -- Bot Integration
  slack_message_ts VARCHAR(255),
  teams_message_id VARCHAR(255),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_budget_alerts_company ON budget_alerts(company_id);
CREATE INDEX idx_budget_alerts_status ON budget_alerts(status);

-- Shadow IT Detection
CREATE TABLE IF NOT EXISTS shadow_it_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Detection Details
  software_name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255),

  detection_method VARCHAR(100) CHECK (detection_method IN (
    'expense_scan',
    'user_report',
    'api_integration',
    'manual_entry'
  )),

  -- Evidence
  detected_from VARCHAR(255), -- e.g., "Credit card statement", "User request"
  detection_confidence VARCHAR(50) CHECK (detection_confidence IN ('low', 'medium', 'high')),

  -- Cost & Risk
  estimated_monthly_cost DECIMAL(10,2),
  estimated_user_count INTEGER,
  risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB, -- ["No contract", "Security concern", "Duplicate functionality"]

  -- Status
  status VARCHAR(50) DEFAULT 'detected' CHECK (status IN (
    'detected',
    'investigating',
    'approved_retroactive',
    'consolidating',
    'removed',
    'false_positive'
  )),

  -- Actions Taken
  action_taken TEXT,
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- Duplicate Check
  duplicate_of_software_id UUID REFERENCES software(id) ON DELETE SET NULL,

  -- Bot Integration
  slack_message_ts VARCHAR(255),
  teams_message_id VARCHAR(255),
  notification_sent BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shadow_it_company ON shadow_it_detections(company_id);
CREATE INDEX idx_shadow_it_status ON shadow_it_detections(status);

-- Notification History (for audit trail)
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Notification Details
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('slack', 'teams', 'email', 'in_app')),
  notification_type VARCHAR(100) NOT NULL,

  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Target
  channel VARCHAR(255),
  recipient_user_ids UUID[],

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  error_message TEXT,

  -- Platform-specific IDs
  slack_message_ts VARCHAR(255),
  slack_thread_ts VARCHAR(255),
  teams_message_id VARCHAR(255),

  -- Related Entities
  related_entity_type VARCHAR(100), -- 'software_request', 'budget_alert', 'shadow_it'
  related_entity_id UUID,

  -- Metadata
  metadata JSONB, -- Additional data (buttons, attachments, etc.)

  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_history_company ON notification_history(company_id);
CREATE INDEX idx_notification_history_type ON notification_history(notification_type);
CREATE INDEX idx_notification_history_status ON notification_history(status);

-- Approval Actions (button clicks from Slack/Teams)
CREATE TABLE IF NOT EXISTS approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Request Reference
  software_request_id UUID REFERENCES software_requests(id) ON DELETE CASCADE,

  -- Action Details
  action VARCHAR(50) NOT NULL CHECK (action IN ('approve', 'reject', 'request_info', 'suggest_alternative')),

  -- Actor
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_email VARCHAR(255),
  actor_platform VARCHAR(50), -- 'slack' or 'teams'

  -- Action Data
  comment TEXT,
  suggested_alternative VARCHAR(255),

  -- Metadata
  slack_user_id VARCHAR(255),
  teams_user_id VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approval_actions_request ON approval_actions(software_request_id);

-- Comments/Discussion Thread
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  software_request_id UUID NOT NULL REFERENCES software_requests(id) ON DELETE CASCADE,

  -- Comment
  comment_text TEXT NOT NULL,

  -- Author
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),

  -- Platform
  platform VARCHAR(50) CHECK (platform IN ('slack', 'teams', 'web')),
  slack_user_id VARCHAR(255),
  teams_user_id VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_request_comments_request ON request_comments(software_request_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_bot_configurations_updated_at BEFORE UPDATE ON bot_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_software_requests_updated_at BEFORE UPDATE ON software_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_alerts_updated_at BEFORE UPDATE ON budget_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shadow_it_detections_updated_at BEFORE UPDATE ON shadow_it_detections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
