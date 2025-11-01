-- ============================================
-- PRISM SCHEMA EXPANSION FOR EASYJET DATA
-- Migration 002: Add support for comprehensive company intelligence
-- ============================================

-- 1. COMPANY METRICS TABLE
CREATE TABLE IF NOT EXISTS company_metrics (
    metric_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_category VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    metric_value DECIMAL(15,2),
    unit VARCHAR(50),
    fiscal_year INTEGER,
    target_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_metrics_company ON company_metrics(company_id);
CREATE INDEX idx_company_metrics_category ON company_metrics(metric_category);
CREATE INDEX idx_company_metrics_year ON company_metrics(fiscal_year);

-- 2. CONTACTS/EXECUTIVES TABLE
CREATE TABLE IF NOT EXISTS contacts (
    contact_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    department VARCHAR(100),
    email_pattern VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    is_decision_maker BOOLEAN DEFAULT FALSE,
    seniority_level VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_seniority ON contacts(seniority_level);
CREATE INDEX idx_contacts_decision_maker ON contacts(is_decision_maker);

-- 3. TECHNOLOGIES TABLE
CREATE TABLE IF NOT EXISTS technologies (
    tech_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    technology_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    vendor VARCHAR(200),
    description TEXT,
    implementation_year INTEGER,
    status VARCHAR(50),
    annual_cost DECIMAL(15,2),
    users_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_technologies_company ON technologies(company_id);
CREATE INDEX idx_technologies_category ON technologies(category);
CREATE INDEX idx_technologies_vendor ON technologies(vendor);
CREATE INDEX idx_technologies_status ON technologies(status);

-- 4. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id VARCHAR(50) PRIMARY KEY,
    vendor_name VARCHAR(200) NOT NULL,
    vendor_type VARCHAR(100),
    industry VARCHAR(100),
    headquarters VARCHAR(200),
    country VARCHAR(100),
    website VARCHAR(500),
    relationship_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_relationship ON vendors(relationship_type);

-- 5. CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS contracts (
    contract_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id VARCHAR(50) REFERENCES vendors(vendor_id),
    contract_name VARCHAR(300) NOT NULL,
    contract_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    contract_value DECIMAL(15,2),
    currency VARCHAR(10),
    status VARCHAR(50),
    description TEXT,
    renewal_notice_days INTEGER,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_company ON contracts(company_id);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);

-- 6. STRATEGIC INITIATIVES TABLE
CREATE TABLE IF NOT EXISTS initiatives (
    initiative_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    initiative_name VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50),
    start_date DATE,
    target_completion DATE,
    budget DECIMAL(15,2),
    description TEXT,
    owner_contact_id VARCHAR(50) REFERENCES contacts(contact_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_initiatives_company ON initiatives(company_id);
CREATE INDEX idx_initiatives_category ON initiatives(category);
CREATE INDEX idx_initiatives_status ON initiatives(status);

-- 7. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS opportunities (
    opportunity_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    opportunity_name VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(50),
    estimated_value DECIMAL(15,2),
    probability VARCHAR(50),
    status VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_opportunities_company ON opportunities(company_id);
CREATE INDEX idx_opportunities_priority ON opportunities(priority);
CREATE INDEX idx_opportunities_status ON opportunities(status);

-- 8. PAIN POINTS TABLE
CREATE TABLE IF NOT EXISTS pain_points (
    pain_point_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(100),
    severity VARCHAR(50),
    description TEXT NOT NULL,
    impact TEXT,
    identified_date DATE,
    resolved_date DATE,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pain_points_company ON pain_points(company_id);
CREATE INDEX idx_pain_points_severity ON pain_points(severity);
CREATE INDEX idx_pain_points_category ON pain_points(category);

-- 9. INTELLIGENCE NOTES TABLE
CREATE TABLE IF NOT EXISTS intelligence_notes (
    note_id VARCHAR(50) PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(100),
    note_date DATE,
    source VARCHAR(200),
    content TEXT NOT NULL,
    tags TEXT[],
    author_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intelligence_notes_company ON intelligence_notes(company_id);
CREATE INDEX idx_intelligence_notes_category ON intelligence_notes(category);
CREATE INDEX idx_intelligence_notes_date ON intelligence_notes(note_date);
CREATE INDEX idx_intelligence_notes_tags ON intelligence_notes USING GIN(tags);

-- 10. ADD NEW FIELDS TO EXISTING COMPANIES TABLE (if not exists)
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='headquarters') THEN
        ALTER TABLE companies ADD COLUMN headquarters VARCHAR(200);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='country') THEN
        ALTER TABLE companies ADD COLUMN country VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='description') THEN
        ALTER TABLE companies ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='website') THEN
        ALTER TABLE companies ADD COLUMN website VARCHAR(500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='total_revenue') THEN
        ALTER TABLE companies ADD COLUMN total_revenue DECIMAL(18,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='net_profit') THEN
        ALTER TABLE companies ADD COLUMN net_profit DECIMAL(18,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='founded_year') THEN
        ALTER TABLE companies ADD COLUMN founded_year INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='companies' AND column_name='is_client') THEN
        ALTER TABLE companies ADD COLUMN is_client BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 11. CREATE VIEWS FOR COMMON QUERIES

-- View: Company Overview with Key Metrics
CREATE OR REPLACE VIEW v_company_overview AS
SELECT
    c.id as company_id,
    c.company_name,
    c.industry,
    c.employee_count,
    c.country,
    c.total_revenue,
    c.net_profit,
    COUNT(DISTINCT t.tech_id) as tech_count,
    COUNT(DISTINCT co.contact_id) as contact_count,
    COUNT(DISTINCT i.initiative_id) as active_initiatives,
    COUNT(DISTINCT o.opportunity_id) as open_opportunities
FROM companies c
LEFT JOIN technologies t ON c.id = t.company_id AND t.status = 'Active'
LEFT JOIN contacts co ON c.id = co.company_id
LEFT JOIN initiatives i ON c.id = i.company_id AND i.status = 'Active'
LEFT JOIN opportunities o ON c.id = o.company_id AND o.status != 'Closed'
GROUP BY c.id, c.company_name, c.industry, c.employee_count, c.country, c.total_revenue, c.net_profit;

-- View: Contract Renewals (Next 90 Days)
CREATE OR REPLACE VIEW v_upcoming_renewals AS
SELECT
    c.contract_id,
    c.company_id,
    co.company_name,
    c.contract_name,
    c.vendor_id,
    v.vendor_name,
    c.end_date,
    c.contract_value,
    c.currency,
    (c.end_date - CURRENT_DATE) as days_until_renewal
FROM contracts c
JOIN companies co ON c.company_id = co.id
LEFT JOIN vendors v ON c.vendor_id = v.vendor_id
WHERE c.end_date IS NOT NULL
  AND c.end_date >= CURRENT_DATE
  AND c.end_date <= CURRENT_DATE + INTERVAL '90 days'
  AND c.status = 'Active'
ORDER BY c.end_date ASC;

-- View: High Priority Pain Points
CREATE OR REPLACE VIEW v_high_priority_pain_points AS
SELECT
    pp.pain_point_id,
    pp.company_id,
    c.company_name,
    pp.category,
    pp.severity,
    pp.description,
    pp.impact,
    pp.identified_date,
    (CURRENT_DATE - pp.identified_date) as days_open
FROM pain_points pp
JOIN companies c ON pp.company_id = c.id
WHERE pp.resolved_date IS NULL
  AND pp.severity IN ('High', 'Critical')
ORDER BY
    CASE pp.severity
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        ELSE 3
    END,
    pp.identified_date ASC;

-- ============================================
-- END OF SCHEMA EXPANSION MIGRATION
-- ============================================
