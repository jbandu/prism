-- ============================================
-- PRISM FEATURE OVERLAP ANALYSIS SYSTEM
-- Migration 003: Redundancy Detection Schema
-- ============================================

-- 1. SOFTWARE CATALOG (Master list of all software in the world)
CREATE TABLE IF NOT EXISTS software_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    software_name VARCHAR(255) NOT NULL UNIQUE,
    vendor_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    website_url TEXT,
    pricing_model VARCHAR(50), -- per_user, per_month, usage_based, flat_fee
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    logo_url TEXT,
    g2_rating DECIMAL(3,2),
    capterra_rating DECIMAL(3,2),
    total_features_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_software_catalog_name ON software_catalog(software_name);
CREATE INDEX idx_software_catalog_vendor ON software_catalog(vendor_name);
CREATE INDEX idx_software_catalog_category ON software_catalog(category);

-- 2. FEATURE CATEGORIES (Standardized taxonomy)
CREATE TABLE IF NOT EXISTS feature_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    parent_category_id UUID REFERENCES feature_categories(id),
    description TEXT,
    icon VARCHAR(50), -- lucide-react icon name
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_categories_parent ON feature_categories(parent_category_id);

-- 3. SOFTWARE FEATURES (Individual features per software)
CREATE TABLE IF NOT EXISTS software_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    software_catalog_id UUID REFERENCES software_catalog(id) ON DELETE CASCADE,
    feature_category_id UUID REFERENCES feature_categories(id),
    feature_name VARCHAR(255) NOT NULL,
    feature_description TEXT,
    is_core_feature BOOLEAN DEFAULT true, -- core vs add-on
    requires_premium BOOLEAN DEFAULT false, -- included in base or needs upgrade
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(software_catalog_id, feature_name)
);

CREATE INDEX idx_software_features_catalog ON software_features(software_catalog_id);
CREATE INDEX idx_software_features_category ON software_features(feature_category_id);
CREATE INDEX idx_software_features_name ON software_features(feature_name);

-- 4. FEATURE OVERLAPS (Detected overlaps in client's portfolio)
CREATE TABLE IF NOT EXISTS feature_overlaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    feature_category_id UUID REFERENCES feature_categories(id),
    software_ids UUID[], -- array of software_assets.id that have this feature
    overlap_count INTEGER, -- how many products have this feature
    redundancy_cost DECIMAL(12,2), -- wasted spend on duplicate capability
    consolidation_opportunity TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    status VARCHAR(20) DEFAULT 'active', -- active, dismissed, resolved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_overlaps_company ON feature_overlaps(company_id);
CREATE INDEX idx_feature_overlaps_category ON feature_overlaps(feature_category_id);
CREATE INDEX idx_feature_overlaps_status ON feature_overlaps(status);

-- 5. FEATURE COMPARISON MATRIX (For visualization)
CREATE TABLE IF NOT EXISTS feature_comparison_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    software_id_1 UUID REFERENCES software(id) ON DELETE CASCADE,
    software_id_2 UUID REFERENCES software(id) ON DELETE CASCADE,
    overlap_percentage DECIMAL(5,2), -- 0-100%
    shared_features_count INTEGER,
    total_features_compared INTEGER,
    shared_features JSONB, -- array of shared feature names
    cost_implication DECIMAL(12,2), -- annual cost of overlap
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, software_id_1, software_id_2)
);

CREATE INDEX idx_comparison_matrix_company ON feature_comparison_matrix(company_id);
CREATE INDEX idx_comparison_matrix_sw1 ON feature_comparison_matrix(software_id_1);
CREATE INDEX idx_comparison_matrix_sw2 ON feature_comparison_matrix(software_id_2);

-- 6. CONSOLIDATION RECOMMENDATIONS (AI-generated)
CREATE TABLE IF NOT EXISTS consolidation_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    software_to_keep_id UUID REFERENCES software(id),
    software_to_remove_ids UUID[], -- array of software that can be replaced
    annual_savings DECIMAL(12,2),
    features_covered JSONB, -- which features are covered by keeper
    features_at_risk JSONB, -- features that might be lost
    migration_effort VARCHAR(20), -- low, medium, high
    business_risk VARCHAR(20), -- low, medium, high
    recommendation_text TEXT,
    confidence_score DECIMAL(3,2), -- 0-1
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consolidation_company ON consolidation_recommendations(company_id);
CREATE INDEX idx_consolidation_status ON consolidation_recommendations(status);
CREATE INDEX idx_consolidation_savings ON consolidation_recommendations(annual_savings DESC);

-- 7. AI ANALYSIS CACHE (To avoid re-analyzing)
CREATE TABLE IF NOT EXISTS feature_analysis_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    software_name VARCHAR(255) NOT NULL UNIQUE,
    extracted_features JSONB, -- AI-extracted features
    feature_count INTEGER,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(50), -- 'ai_extraction', 'manual', 'web_scraping'
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_cache_software ON feature_analysis_cache(software_name);
CREATE INDEX idx_analysis_cache_date ON feature_analysis_cache(analysis_date DESC);

-- 8. SEED FEATURE CATEGORIES

-- Main categories
INSERT INTO feature_categories (category_name, parent_category_id, description, icon) VALUES
('Task Management', NULL, 'Creating, assigning, and tracking tasks', 'CheckSquare'),
('Calendar & Scheduling', NULL, 'Calendar views, meeting scheduling, availability', 'Calendar'),
('Communication', NULL, 'Chat, messaging, video calls, comments', 'MessageSquare'),
('Document Management', NULL, 'File storage, sharing, version control', 'FileText'),
('Reporting & Analytics', NULL, 'Dashboards, reports, data visualization', 'BarChart'),
('Collaboration', NULL, 'Real-time editing, commenting, mentions', 'Users'),
('Workflow Automation', NULL, 'Triggers, actions, custom workflows', 'Zap'),
('Time Tracking', NULL, 'Time logging, timesheets, billing', 'Clock'),
('Resource Management', NULL, 'Resource allocation, capacity planning', 'Layers'),
('Budget & Finance', NULL, 'Budget tracking, expense management', 'DollarSign'),
('CRM Features', NULL, 'Contact management, pipeline, deals', 'UserCheck'),
('Project Planning', NULL, 'Gantt charts, roadmaps, milestones', 'GitBranch'),
('Integration Hub', NULL, 'Third-party integrations, APIs, webhooks', 'Link'),
('Mobile Access', NULL, 'iOS/Android apps, mobile-optimized', 'Smartphone'),
('Security & Permissions', NULL, 'Access control, SSO, audit logs', 'Shield'),
('Customization', NULL, 'Custom fields, workflows, branding', 'Settings'),
('Data Import/Export', NULL, 'CSV import, API export, backups', 'Download'),
('Search & Filter', NULL, 'Advanced search, filtering, saved views', 'Search'),
('Notifications', NULL, 'Email alerts, push notifications, digests', 'Bell'),
('Templates', NULL, 'Pre-built templates, project templates', 'Copy')
ON CONFLICT (category_name) DO NOTHING;

-- Sub-categories for Task Management
INSERT INTO feature_categories (category_name, parent_category_id, description, icon)
SELECT 'Subtasks', id, 'Break tasks into smaller subtasks', 'List'
FROM feature_categories WHERE category_name = 'Task Management'
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO feature_categories (category_name, parent_category_id, description, icon)
SELECT 'Task Dependencies', id, 'Link tasks with dependencies', 'GitBranch'
FROM feature_categories WHERE category_name = 'Task Management'
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO feature_categories (category_name, parent_category_id, description, icon)
SELECT 'Task Comments', id, 'Add comments and discussions to tasks', 'MessageCircle'
FROM feature_categories WHERE category_name = 'Task Management'
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO feature_categories (category_name, parent_category_id, description, icon)
SELECT 'Task Assignments', id, 'Assign tasks to team members', 'UserPlus'
FROM feature_categories WHERE category_name = 'Task Management'
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO feature_categories (category_name, parent_category_id, description, icon)
SELECT 'Due Dates', id, 'Set due dates and reminders', 'Calendar'
FROM feature_categories WHERE category_name = 'Task Management'
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO feature_categories (category_name, parent_category_id, description, icon)
SELECT 'Priority Levels', id, 'Set task priority (high/medium/low)', 'Flag'
FROM feature_categories WHERE category_name = 'Task Management'
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO feature_categories (category_name, parent_category_id, description, icon)
SELECT 'Custom Statuses', id, 'Define custom task statuses', 'Tags'
FROM feature_categories WHERE category_name = 'Task Management'
ON CONFLICT (category_name) DO NOTHING;

-- Comments
COMMENT ON TABLE software_catalog IS 'Master catalog of all software products with their metadata';
COMMENT ON TABLE feature_categories IS 'Standardized taxonomy of software features';
COMMENT ON TABLE software_features IS 'Individual features mapped to software products';
COMMENT ON TABLE feature_overlaps IS 'Detected feature overlaps across company portfolios';
COMMENT ON TABLE feature_comparison_matrix IS 'Pairwise comparison matrix for visualization';
COMMENT ON TABLE consolidation_recommendations IS 'AI-generated consolidation opportunities';
COMMENT ON TABLE feature_analysis_cache IS 'Cached AI feature extraction results';
