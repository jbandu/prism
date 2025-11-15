-- Software Relationships Table
-- Stores pre-computed relationships between software to avoid brute-force analysis

CREATE TABLE IF NOT EXISTS software_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The two software being compared (always store alphabetically by ID to avoid duplicates)
  software_a_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,
  software_b_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,

  -- Company context
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Category for faster filtering
  category VARCHAR(100) NOT NULL,

  -- Relationship metadata
  relationship_type VARCHAR(50) NOT NULL, -- 'redundant', 'complementary', 'unrelated', 'alternative'
  similarity_score DECIMAL(5,4) CHECK (similarity_score >= 0 AND similarity_score <= 1), -- 0.0 to 1.0
  overlap_percentage INTEGER CHECK (overlap_percentage >= 0 AND overlap_percentage <= 100),

  -- Analysis details
  overlapping_features TEXT[], -- Array of shared features
  unique_to_a TEXT[], -- Features unique to software A
  unique_to_b TEXT[], -- Features unique to software B

  -- Recommendation data
  recommended_action VARCHAR(50), -- 'consolidate_to_a', 'consolidate_to_b', 'keep_both', 'investigate'
  potential_savings DECIMAL(15,2),
  confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- Analysis metadata
  analysis_method VARCHAR(50) DEFAULT 'feature_overlap', -- 'feature_overlap', 'ai_analysis', 'usage_pattern'
  last_analyzed_at TIMESTAMP DEFAULT NOW(),
  analyzed_by_user_id UUID REFERENCES users(id),

  -- Status tracking
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'acted_upon'

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure we don't duplicate relationships (A-B is same as B-A)
  CONSTRAINT unique_software_pair UNIQUE(software_a_id, software_b_id),
  CONSTRAINT different_software CHECK (software_a_id < software_b_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_software_relationships_company ON software_relationships(company_id);
CREATE INDEX IF NOT EXISTS idx_software_relationships_category ON software_relationships(category);
CREATE INDEX IF NOT EXISTS idx_software_relationships_type ON software_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_software_relationships_software_a ON software_relationships(software_a_id);
CREATE INDEX IF NOT EXISTS idx_software_relationships_software_b ON software_relationships(software_b_id);
CREATE INDEX IF NOT EXISTS idx_software_relationships_score ON software_relationships(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_software_relationships_status ON software_relationships(status) WHERE status = 'active';

-- Composite index for category-level queries
CREATE INDEX IF NOT EXISTS idx_software_relationships_company_category
  ON software_relationships(company_id, category, similarity_score DESC);

-- Function to ensure alphabetical ordering of software IDs
CREATE OR REPLACE FUNCTION normalize_software_relationship()
RETURNS TRIGGER AS $$
BEGIN
  -- Swap IDs if they're not in alphabetical order
  IF NEW.software_a_id > NEW.software_b_id THEN
    DECLARE
      temp_id UUID;
      temp_features TEXT[];
    BEGIN
      -- Swap IDs
      temp_id := NEW.software_a_id;
      NEW.software_a_id := NEW.software_b_id;
      NEW.software_b_id := temp_id;

      -- Swap unique features arrays
      temp_features := NEW.unique_to_a;
      NEW.unique_to_a := NEW.unique_to_b;
      NEW.unique_to_b := temp_features;

      -- Swap recommended action
      IF NEW.recommended_action = 'consolidate_to_a' THEN
        NEW.recommended_action := 'consolidate_to_b';
      ELSIF NEW.recommended_action = 'consolidate_to_b' THEN
        NEW.recommended_action := 'consolidate_to_a';
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to normalize software relationships before insert
CREATE TRIGGER trg_normalize_software_relationship
  BEFORE INSERT OR UPDATE ON software_relationships
  FOR EACH ROW
  EXECUTE FUNCTION normalize_software_relationship();

-- Category Analysis Summary Table
-- Stores aggregate stats per category for quick dashboard views
CREATE TABLE IF NOT EXISTS category_redundancy_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,

  -- Stats
  total_software_count INTEGER NOT NULL DEFAULT 0,
  redundant_pairs_count INTEGER NOT NULL DEFAULT 0,
  total_potential_savings DECIMAL(15,2) DEFAULT 0,

  -- Top recommendation
  top_consolidation_opportunity JSONB, -- {software_a, software_b, savings, confidence}

  -- Analysis metadata
  last_analyzed_at TIMESTAMP DEFAULT NOW(),
  analysis_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'error'

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_company_category UNIQUE(company_id, category)
);

CREATE INDEX IF NOT EXISTS idx_category_summary_company ON category_redundancy_summary(company_id);
CREATE INDEX IF NOT EXISTS idx_category_summary_savings ON category_redundancy_summary(total_potential_savings DESC);

-- Insert initial summaries for existing categories
INSERT INTO category_redundancy_summary (company_id, category, total_software_count, analysis_status)
SELECT
  company_id,
  category,
  COUNT(*) as total_software_count,
  'pending' as analysis_status
FROM software
WHERE deleted_at IS NULL AND contract_status = 'active'
GROUP BY company_id, category
ON CONFLICT (company_id, category) DO NOTHING;

-- View for easy relationship lookups (handles both directions)
CREATE OR REPLACE VIEW software_relationship_pairs AS
SELECT
  id,
  software_a_id as software_id,
  software_b_id as related_software_id,
  company_id,
  category,
  relationship_type,
  similarity_score,
  overlap_percentage,
  overlapping_features,
  unique_to_a as unique_features,
  unique_to_b as related_unique_features,
  recommended_action,
  potential_savings,
  confidence_score,
  last_analyzed_at
FROM software_relationships
WHERE status = 'active'

UNION ALL

SELECT
  id,
  software_b_id as software_id,
  software_a_id as related_software_id,
  company_id,
  category,
  relationship_type,
  similarity_score,
  overlap_percentage,
  overlapping_features,
  unique_to_b as unique_features,
  unique_to_a as related_unique_features,
  CASE
    WHEN recommended_action = 'consolidate_to_a' THEN 'consolidate_to_b'
    WHEN recommended_action = 'consolidate_to_b' THEN 'consolidate_to_a'
    ELSE recommended_action
  END as recommended_action,
  potential_savings,
  confidence_score,
  last_analyzed_at
FROM software_relationships
WHERE status = 'active';

COMMENT ON TABLE software_relationships IS 'Stores pre-computed relationships between software to optimize redundancy analysis';
COMMENT ON TABLE category_redundancy_summary IS 'Aggregate statistics for category-level redundancy analysis';
COMMENT ON VIEW software_relationship_pairs IS 'Bidirectional view of software relationships for easy lookups';
