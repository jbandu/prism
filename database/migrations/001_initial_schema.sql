-- ============================================
-- PRISM INITIAL SCHEMA
-- Migration 001: Core SaaS Portfolio Management
-- ============================================

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
    company_id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    employee_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(company_name);
CREATE INDEX idx_companies_industry ON companies(industry);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role);

-- 3. SOFTWARE TABLE
CREATE TABLE IF NOT EXISTS software (
    software_id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    software_name VARCHAR(200) NOT NULL,
    vendor_name VARCHAR(200),
    category VARCHAR(100),
    annual_cost DECIMAL(15,2),
    contract_start_date DATE,
    contract_end_date DATE,
    license_count INTEGER,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_software_company ON software(company_id);
CREATE INDEX idx_software_vendor ON software(vendor_name);
CREATE INDEX idx_software_category ON software(category);
CREATE INDEX idx_software_status ON software(status);

-- 4. USAGE ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS usage_analytics (
    usage_id VARCHAR(50) PRIMARY KEY,
    software_id VARCHAR(50) NOT NULL REFERENCES software(software_id) ON DELETE CASCADE,
    reporting_period DATE NOT NULL,
    active_users INTEGER,
    total_licenses INTEGER,
    utilization_percentage DECIMAL(5,2),
    wasted_licenses INTEGER,
    waste_cost DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_software ON usage_analytics(software_id);
CREATE INDEX idx_usage_period ON usage_analytics(reporting_period);

-- 5. ALTERNATIVES TABLE
CREATE TABLE IF NOT EXISTS alternatives (
    alternative_id VARCHAR(50) PRIMARY KEY,
    software_id VARCHAR(50) NOT NULL REFERENCES software(software_id) ON DELETE CASCADE,
    alternative_name VARCHAR(200) NOT NULL,
    alternative_vendor VARCHAR(200),
    annual_cost DECIMAL(15,2),
    potential_savings DECIMAL(15,2),
    match_score DECIMAL(3,2),
    features_comparison TEXT,
    recommendation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alternatives_software ON alternatives(software_id);
CREATE INDEX idx_alternatives_savings ON alternatives(potential_savings DESC);

-- 6. VENDOR INTELLIGENCE TABLE
CREATE TABLE IF NOT EXISTS vendor_intelligence (
    vendor_id VARCHAR(50) PRIMARY KEY,
    vendor_name VARCHAR(200) UNIQUE NOT NULL,
    financial_health_score DECIMAL(3,2),
    market_position VARCHAR(100),
    risk_level VARCHAR(50),
    risk_factors TEXT[],
    employee_count INTEGER,
    founded_year INTEGER,
    headquarters VARCHAR(200),
    website VARCHAR(500),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_name ON vendor_intelligence(vendor_name);
CREATE INDEX idx_vendor_risk ON vendor_intelligence(risk_level);

-- ============================================
-- END OF INITIAL SCHEMA MIGRATION
-- ============================================
