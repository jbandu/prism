-- ============================================================================
-- OFFICE LOCATIONS TABLE FOR GLOBAL PRESENCE FEATURE
-- Migration: 003_office_locations.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS office_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    office_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    employee_count INTEGER DEFAULT 0,
    is_headquarters BOOLEAN DEFAULT false,
    timezone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND
        longitude BETWEEN -180 AND 180
    ),
    CONSTRAINT valid_employee_count CHECK (employee_count >= 0)
);

CREATE INDEX idx_office_locations_company_id ON office_locations(company_id);
CREATE INDEX idx_office_locations_is_headquarters ON office_locations(is_headquarters);
CREATE INDEX idx_office_locations_city ON office_locations(city);
CREATE INDEX idx_office_locations_country ON office_locations(country);

-- ============================================================================
-- SAMPLE DATA FOR EXISTING COMPANIES
-- ============================================================================

-- Insert sample office locations for EasyJet (if exists)
INSERT INTO office_locations (
    company_id, office_name, city, country,
    latitude, longitude, employee_count, is_headquarters, timezone
)
SELECT
    id,
    'London Headquarters',
    'London',
    'United Kingdom',
    51.5074,
    -0.1278,
    1200,
    true,
    'Europe/London'
FROM companies
WHERE company_name = 'EasyJet'
ON CONFLICT DO NOTHING;

INSERT INTO office_locations (
    company_id, office_name, city, country,
    latitude, longitude, employee_count, is_headquarters, timezone
)
SELECT
    id,
    'Berlin Operations',
    'Berlin',
    'Germany',
    52.5200,
    13.4050,
    450,
    false,
    'Europe/Berlin'
FROM companies
WHERE company_name = 'EasyJet'
ON CONFLICT DO NOTHING;

-- Insert sample office locations for BioRad (if exists)
INSERT INTO office_locations (
    company_id, office_name, city, country,
    latitude, longitude, employee_count, is_headquarters, timezone
)
SELECT
    id,
    'Global Headquarters',
    'Hercules, CA',
    'United States',
    37.9784,
    -122.2868,
    2500,
    true,
    'America/Los_Angeles'
FROM companies
WHERE company_name LIKE '%BioRad%' OR company_name LIKE '%Bio-Rad%'
ON CONFLICT DO NOTHING;

INSERT INTO office_locations (
    company_id, office_name, city, country,
    latitude, longitude, employee_count, is_headquarters, timezone
)
SELECT
    id,
    office_name,
    city,
    country,
    latitude,
    longitude,
    employee_count,
    is_headquarters,
    timezone
FROM (VALUES
    ('European Office', 'Munich', 'Germany', 48.1351, 11.5820, 800, false, 'Europe/Berlin'),
    ('Asia Pacific HQ', 'Singapore', 'Singapore', 1.3521, 103.8198, 1200, false, 'Asia/Singapore'),
    ('Manufacturing Plant', 'Shanghai', 'China', 31.2304, 121.4737, 1800, false, 'Asia/Shanghai'),
    ('R&D Center', 'Boston, MA', 'United States', 42.3601, -71.0589, 450, false, 'America/New_York'),
    ('Sales Office', 'Tokyo', 'Japan', 35.6762, 139.6503, 280, false, 'Asia/Tokyo'),
    ('Distribution Center', 'Sydney', 'Australia', -33.8688, 151.2093, 150, false, 'Australia/Sydney'),
    ('Regional Office', 'London', 'United Kingdom', 51.5074, -0.1278, 350, false, 'Europe/London'),
    ('Sales Office', 'São Paulo', 'Brazil', -23.5505, -46.6333, 220, false, 'America/Sao_Paulo'),
    ('Manufacturing Plant', 'Bangalore', 'India', 12.9716, 77.5946, 950, false, 'Asia/Kolkata')
) AS sample(office_name, city, country, latitude, longitude, employee_count, is_headquarters, timezone)
CROSS JOIN (
    SELECT id FROM companies WHERE company_name LIKE '%BioRad%' OR company_name LIKE '%Bio-Rad%' LIMIT 1
) AS company
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE office_locations IS 'Stores physical office locations for companies with geolocation data for the Global Presence feature';
COMMENT ON COLUMN office_locations.latitude IS 'Latitude coordinate (-90 to 90)';
COMMENT ON COLUMN office_locations.longitude IS 'Longitude coordinate (-180 to 180)';
COMMENT ON COLUMN office_locations.timezone IS 'IANA timezone identifier (e.g., America/Los_Angeles)';
COMMENT ON COLUMN office_locations.is_headquarters IS 'Marks the primary headquarters location';
