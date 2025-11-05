/**
 * Test Data Constants
 * Static test data that can be imported without database connection
 */

export const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test-admin@prism.test',
    password: 'TestAdmin123!',
    full_name: 'Test Admin',
    role: 'admin',
  },
  companyManager: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'test-manager@acmecorp.test',
    password: 'TestManager123!',
    full_name: 'John Manager',
    role: 'client',
    company_id: '00000000-0000-0000-0000-000000000099',
  },
  viewer: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'test-viewer@acmecorp.test',
    password: 'TestViewer123!',
    full_name: 'Jane Viewer',
    role: 'viewer',
    company_id: '00000000-0000-0000-0000-000000000099',
  },
};

export const TEST_COMPANIES = [
  {
    id: '00000000-0000-0000-0000-000000000099',
    slug: 'acme-corp',
    company_name: 'Acme Corporation (TEST)',
    industry: 'Technology',
    employee_count: 500,
    primary_contact_name: 'John Manager',
    primary_contact_email: 'test-manager@acmecorp.test',
    contract_status: 'active',
  },
  {
    id: '00000000-0000-0000-0000-000000000098',
    slug: 'techstart',
    company_name: 'TechStart Inc',
    industry: 'SaaS',
    employee_count: 150,
    primary_contact_name: 'Sarah Johnson',
    primary_contact_email: 'sarah@techstart.test',
    contract_status: 'active',
  },
  {
    id: '00000000-0000-0000-0000-000000000097',
    slug: 'prospect-co',
    company_name: 'Prospect Company',
    industry: 'Finance',
    employee_count: 1000,
    primary_contact_name: 'Bob Smith',
    primary_contact_email: 'bob@prospect.test',
    contract_status: 'prospect',
  },
];

export const TEST_SOFTWARE = [
  {
    id: '00000000-0000-0000-0000-000000000201',
    company_id: '00000000-0000-0000-0000-000000000099',
    software_name: 'Salesforce',
    vendor_name: 'Salesforce Inc',
    category: 'CRM',
    annual_cost: 120000,
    license_count: 100,
    active_users: 75,
    status: 'Active',
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    company_id: '00000000-0000-0000-0000-000000000099',
    software_name: 'Slack',
    vendor_name: 'Slack Technologies',
    category: 'Communication',
    annual_cost: 24000,
    license_count: 200,
    active_users: 180,
    status: 'Active',
  },
  {
    id: '00000000-0000-0000-0000-000000000203',
    company_id: '00000000-0000-0000-0000-000000000099',
    software_name: 'Zoom',
    vendor_name: 'Zoom Video Communications',
    category: 'Video Conferencing',
    annual_cost: 18000,
    license_count: 150,
    active_users: 60,
    status: 'Active',
  },
];
