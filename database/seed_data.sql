-- ============================================================================
-- PRISM - Seed Data
-- Sample companies, users, and software assets for development/testing
-- ============================================================================

-- ============================================================================
-- SEED DATA: Companies
-- ============================================================================
INSERT INTO companies (company_id, company_name, industry, employee_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'BioRad Laboratories', 'Life Sciences', 4200),
  ('550e8400-e29b-41d4-a716-446655440002', 'CoorsTek', 'Manufacturing', 6000)
ON CONFLICT (company_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  employee_count = EXCLUDED.employee_count;

-- ============================================================================
-- SEED DATA: Users
-- Password for all users: "Password123!" (hashed with bcrypt, rounds=10)
-- ============================================================================

-- Admin User (jbandu@gmail.com)
INSERT INTO users (user_id, email, password_hash, full_name, role, company_id, is_active) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    'jbandu@gmail.com',
    '$2a$10$rJZhv0hs3M4QhH8xNxJw3.vYxKGHJjR9QhVKzF6qV6p3xN8rBZG0a',
    'Jayaprakash Bandu',
    'admin',
    NULL,
    true
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- BioRad Company Manager (mhanif@bio-rad.com)
INSERT INTO users (user_id, email, password_hash, full_name, role, company_id, is_active) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'mhanif@bio-rad.com',
    '$2a$10$rJZhv0hs3M4QhH8xNxJw3.vYxKGHJjR9QhVKzF6qV6p3xN8rBZG0a',
    'Muhammad Hanif',
    'company_manager',
    '550e8400-e29b-41d4-a716-446655440001',
    true
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id;

-- CoorsTek Company Manager (ryan.reed@coorstek.com)
INSERT INTO users (user_id, email, password_hash, full_name, role, company_id, is_active) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'ryan.reed@coorstek.com',
    '$2a$10$rJZhv0hs3M4QhH8xNxJw3.vYxKGHJjR9QhVKzF6qV6p3xN8rBZG0a',
    'Ryan Reed',
    'company_manager',
    '550e8400-e29b-41d4-a716-446655440002',
    true
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id;

-- ============================================================================
-- SEED DATA: Software Assets for BioRad
-- ============================================================================
INSERT INTO software_assets (
  software_id, company_id, software_name, vendor_name, category,
  total_annual_cost, total_licenses, active_users, license_type, renewal_date,
  contract_status, waste_amount, potential_savings
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440001',
    'SAP ERP',
    'SAP',
    'ERP',
    8500000.00,
    4200,
    3800,
    'per_user',
    CURRENT_DATE + INTERVAL '180 days',
    'active',
    400000.00,
    800000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440001',
    'Salesforce',
    'Salesforce',
    'CRM',
    1200000.00,
    800,
    650,
    'per_user',
    CURRENT_DATE + INTERVAL '45 days',
    'active',
    180000.00,
    240000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440001',
    'ServiceNow',
    'ServiceNow',
    'IT Service Management',
    950000.00,
    500,
    420,
    'per_user',
    CURRENT_DATE + INTERVAL '120 days',
    'active',
    80000.00,
    150000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440001',
    'Tableau',
    'Salesforce',
    'Analytics',
    650000.00,
    300,
    160,
    'per_user',
    CURRENT_DATE + INTERVAL '90 days',
    'active',
    168000.00,
    200000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440024',
    '550e8400-e29b-41d4-a716-446655440001',
    'Zoom',
    'Zoom Video Communications',
    'Collaboration',
    420000.00,
    4200,
    3500,
    'per_user',
    CURRENT_DATE + INTERVAL '200 days',
    'active',
    70000.00,
    350000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440025',
    '550e8400-e29b-41d4-a716-446655440001',
    'Slack',
    'Salesforce',
    'Collaboration',
    320000.00,
    3000,
    2600,
    'per_user',
    CURRENT_DATE + INTERVAL '150 days',
    'active',
    40000.00,
    60000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440026',
    '550e8400-e29b-41d4-a716-446655440001',
    'Asana',
    'Asana',
    'Project Management',
    95000.00,
    400,
    280,
    'per_user',
    CURRENT_DATE + INTERVAL '60 days',
    'active',
    30000.00,
    83000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440027',
    '550e8400-e29b-41d4-a716-446655440001',
    'DocuSign',
    'DocuSign',
    'Document Management',
    85000.00,
    200,
    140,
    'per_user',
    CURRENT_DATE + INTERVAL '100 days',
    'active',
    15000.00,
    42000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440028',
    '550e8400-e29b-41d4-a716-446655440001',
    'Adobe Creative Cloud',
    'Adobe',
    'Design',
    72000.00,
    80,
    65,
    'per_user',
    CURRENT_DATE + INTERVAL '220 days',
    'active',
    9000.00,
    15000.00
  ),
  (
    '550e8400-e29b-41d4-a716-446655440029',
    '550e8400-e29b-41d4-a716-446655440001',
    'Airtable',
    'Airtable',
    'Database',
    45000.00,
    150,
    95,
    'per_user',
    CURRENT_DATE + INTERVAL '75 days',
    'active',
    12000.00,
    38000.00
  )
ON CONFLICT (software_id) DO UPDATE SET
  software_name = EXCLUDED.software_name,
  total_annual_cost = EXCLUDED.total_annual_cost,
  total_licenses = EXCLUDED.total_licenses,
  active_users = EXCLUDED.active_users;

-- ============================================================================
-- SEED DATA: Software Assets for CoorsTek (minimal for now - prospect)
-- ============================================================================
INSERT INTO software_assets (
  software_id, company_id, software_name, vendor_name, category,
  total_annual_cost, total_licenses, active_users, license_type, renewal_date,
  contract_status
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440002',
    'Microsoft 365',
    'Microsoft',
    'Productivity',
    500000.00,
    6000,
    5800,
    'per_user',
    CURRENT_DATE + INTERVAL '90 days',
    'active'
  )
ON CONFLICT (software_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify the seed data was inserted correctly
-- ============================================================================

-- Count companies
-- SELECT COUNT(*) as company_count FROM companies;

-- Count users by role
-- SELECT role, COUNT(*) as user_count FROM users GROUP BY role;

-- Count software by company
-- SELECT c.company_name, COUNT(s.software_id) as software_count, SUM(s.total_annual_cost) as total_spend
-- FROM companies c
-- LEFT JOIN software_assets s ON c.company_id = s.company_id
-- GROUP BY c.company_name;

-- Show all users with their companies
-- SELECT u.email, u.full_name, u.role, c.company_name
-- FROM users u
-- LEFT JOIN companies c ON u.company_id = c.company_id
-- ORDER BY u.role, u.email;
