-- AI Provider Configuration Table
-- Configure which AI provider to use for each task type

CREATE TABLE IF NOT EXISTS ai_provider_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(100) NOT NULL UNIQUE,

  -- Provider Configuration
  provider VARCHAR(50) CHECK (provider IN ('claude', 'grok', 'gemini')),
  model VARCHAR(100), -- e.g., 'claude-sonnet-4-20250514', 'grok-2-1212', 'gemini-2.0-flash-exp'

  -- Generation Parameters
  temperature DECIMAL(3,2) DEFAULT 0.0 CHECK (temperature BETWEEN 0 AND 2),
  max_tokens INTEGER DEFAULT 4096,

  -- Status
  enabled BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default configurations for different task types
INSERT INTO ai_provider_config (task_type, provider, model, temperature, max_tokens)
VALUES
  -- High-quality analysis tasks (use Claude)
  ('feature_extraction', 'claude', 'claude-sonnet-4-20250514', 0, 4096),
  ('vendor_risk_analysis', 'claude', 'claude-sonnet-4-20250514', 0, 4096),
  ('consolidation_recommendations', 'claude', 'claude-sonnet-4-20250514', 0, 2048),
  ('savings_simulation', 'claude', 'claude-sonnet-4-20250514', 0, 2048),

  -- Bulk/simple tasks (use Gemini - free tier)
  ('alternative_discovery', 'gemini', 'gemini-2.0-flash-exp', 0, 2048),
  ('bulk_feature_enrichment', 'gemini', 'gemini-2.0-flash-exp', 0, 4096),
  ('simple_extraction', 'gemini', 'gemini-2.0-flash-exp', 0, 1024),

  -- Real-time/conversational tasks (use Grok)
  ('chat_assistant', 'grok', 'grok-2-1212', 0.7, 2048),
  ('quick_response', 'grok', 'grok-2-1212', 0.5, 1024)

ON CONFLICT (task_type) DO NOTHING;

CREATE INDEX idx_ai_config_task ON ai_provider_config(task_type);
CREATE INDEX idx_ai_config_provider ON ai_provider_config(provider);
CREATE INDEX idx_ai_config_enabled ON ai_provider_config(enabled);

-- AI Usage Tracking Table
-- Track API calls, tokens, and costs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request Details
  task_type VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,

  -- Token Usage
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,

  -- Cost
  estimated_cost DECIMAL(10,6), -- In dollars

  -- Performance
  latency_ms INTEGER, -- Response time in milliseconds

  -- Status
  status VARCHAR(50) DEFAULT 'success', -- success, error, timeout
  error_message TEXT,

  -- Context
  company_id UUID,
  user_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_task ON ai_usage_logs(task_type);
CREATE INDEX idx_ai_logs_provider ON ai_usage_logs(provider);
CREATE INDEX idx_ai_logs_company ON ai_usage_logs(company_id);
CREATE INDEX idx_ai_logs_created ON ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_logs_cost ON ai_usage_logs(estimated_cost DESC);

COMMENT ON TABLE ai_provider_config IS 'Configure which AI provider (Claude/Grok/Gemini) to use for each task type';
COMMENT ON TABLE ai_usage_logs IS 'Track AI API usage, tokens, costs, and performance metrics';
COMMENT ON COLUMN ai_usage_logs.estimated_cost IS 'Estimated cost in dollars based on token usage and provider pricing';
