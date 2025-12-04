-- Create agent_analyses table for tracking AI agent analysis runs
CREATE TABLE IF NOT EXISTS agent_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  software_id UUID REFERENCES software(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  agent_version TEXT DEFAULT 'v1.0',
  confidence_score DECIMAL(3, 2) DEFAULT 0.85,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agent_analyses_company_id ON agent_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_analyses_software_id ON agent_analyses(software_id);
CREATE INDEX IF NOT EXISTS idx_agent_analyses_analysis_type ON agent_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_agent_analyses_status ON agent_analyses(status);
CREATE INDEX IF NOT EXISTS idx_agent_analyses_created_at ON agent_analyses(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_agent_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_analyses_updated_at
  BEFORE UPDATE ON agent_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_analyses_updated_at();
