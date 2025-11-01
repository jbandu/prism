-- ============================================
-- EASYJET SEED DATA FOR PRISM (UUID VERSION)
-- Comprehensive aviation industry intelligence
-- ============================================

-- 1. INSERT EASYJET COMPANY
-- Note: We'll use a specific UUID for consistency
INSERT INTO companies (
    id,
    company_name,
    industry,
    headquarters,
    country,
    employee_count,
    total_revenue,
    net_profit,
    founded_year,
    website,
    description,
    contract_status,
    is_client,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'easyJet',
    'Aviation',
    'Luton, United Kingdom',
    'United Kingdom',
    13000,
    9300000000.00,
    452000000.00,
    1995,
    'https://www.easyjet.com',
    'Leading European low-cost airline operating 355 aircraft across 1000+ routes. Serves 89.7M annual passengers with 2000 daily flights. Heavy investment in AI/ML for baggage handling, predictive maintenance, and customer service optimization.',
    'active',
    true,
    CURRENT_TIMESTAMP
);

-- 2. COMPANY METRICS (24 metrics across financial, operational, baggage, and AI categories)
INSERT INTO company_metrics (metric_id, company_id, metric_category, metric_name, metric_value, unit, fiscal_year, target_value) VALUES
-- Financial Metrics
('metric_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Financial', 'Total Revenue', 9.3, 'billion GBP', 2024, NULL),
('metric_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Financial', 'Net Profit', 452, 'million GBP', 2024, 1000),
('metric_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Financial', 'ROCE (Return on Capital Employed)', 14.2, 'percent', 2024, 15.0),
('metric_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Financial', 'Operating Margin', 10.8, 'percent', 2024, 12.0),
('metric_005', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Financial', 'Cost per Available Seat Kilometre', 5.2, 'pence', 2024, 4.8),

-- Operational Metrics
('metric_006', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'Annual Passengers', 89.7, 'million', 2024, 95.0),
('metric_007', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'Load Factor', 92.3, 'percent', 2024, 93.0),
('metric_008', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'Aircraft Fleet Size', 355, 'aircraft', 2024, 400),
('metric_009', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'Routes', 1028, 'routes', 2024, 1100),
('metric_010', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'Daily Flights', 2000, 'flights', 2024, 2200),
('metric_011', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'On-Time Performance', 87.4, 'percent', 2024, 90.0),
('metric_012', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'Average Turnaround Time', 25, 'minutes', 2024, 23),

-- Baggage KPIs
('metric_013', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Operations', 'Baggage Delivery within 45 mins', 88.2, 'percent', 2024, 95.0),
('metric_014', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Operations', 'Mishandled Bags per 1000 Passengers', 5.8, 'per 1000', 2024, 4.0),
('metric_015', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Operations', 'Transfer Baggage SLA Achievement', 82.5, 'percent', 2024, 90.0),
('metric_016', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Operations', 'Average Load Time', 18.5, 'minutes', 2024, 15.0),

-- System Performance
('metric_017', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'IT Systems', 'easyRes Uptime', 99.7, 'percent', 2024, 99.9),
('metric_018', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'IT Systems', 'ICC System Availability', 99.5, 'percent', 2024, 99.9),
('metric_019', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'IT Systems', 'BHS Error Rate', 0.8, 'percent', 2024, 0.5),

-- AI/ML Performance
('metric_020', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI Performance', 'Baggage Analytics Model Accuracy', 94.2, 'percent', 2024, 96.0),
('metric_021', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI Performance', 'Delay Prediction Accuracy', 91.8, 'percent', 2024, 95.0),
('metric_022', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI Performance', 'Jetstream AI Chat Resolution Rate', 73.5, 'percent', 2024, 80.0),
('metric_023', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI Performance', 'ML Delay Prediction Accuracy', 94.2, 'percent', 2024, 96.0),
('metric_024', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational', 'CO2 Emissions per Passenger', 67.5, 'kg', 2024, 60.0);

-- 3. EXECUTIVE CONTACTS (11 C-level executives)
INSERT INTO contacts (contact_id, company_id, first_name, last_name, title, department, email_pattern, linkedin_url, is_decision_maker, seniority_level, notes) VALUES
('contact_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Kenton', 'Jarvis', 'Chief Executive Officer', 'Executive', 'kenton.jarvis@easyjet.com', 'https://linkedin.com/in/kenton-jarvis', true, 'C-Level', 'CEO since 2024. Former Tui CFO. Focused on profitability and operational efficiency.'),
('contact_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Jan', 'De Raeymaker', 'Chief Financial Officer', 'Finance', 'jan.deraeymaker@easyjet.com', 'https://linkedin.com/in/jan-de-raeymaker', true, 'C-Level', 'CFO. Driving £1B profit target. Strong technology investment advocate.'),
('contact_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Opal', 'Perry', 'Chief Data Officer', 'Technology', 'opal.perry@easyjet.com', 'https://linkedin.com/in/opal-perry', true, 'C-Level', 'CDO. Leads AI/ML initiatives, Databricks partnership, baggage analytics project.'),
('contact_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'David', 'Morgan', 'Chief Technology Officer', 'Technology', 'david.morgan@easyjet.com', 'https://linkedin.com/in/david-morgan-easyjet', true, 'C-Level', 'CTO. Oversees TCS transformation, cloud migration to AWS, modernization program.'),
('contact_005', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Sophie', 'Dekkers', 'Chief Operations Officer', 'Operations', 'sophie.dekkers@easyjet.com', 'https://linkedin.com/in/sophie-dekkers', true, 'C-Level', 'COO. Responsible for on-time performance, turnaround times, baggage operations.'),
('contact_006', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Robert', 'Carey', 'Chief Customer Officer', 'Customer Service', 'robert.carey@easyjet.com', 'https://linkedin.com/in/robert-carey-easyjet', true, 'C-Level', 'CCO. Overseeing Jetstream AI assistant rollout and customer experience initiatives.'),
('contact_007', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Maaike', 'de Bie', 'Chief People Officer', 'HR', 'maaike.debie@easyjet.com', 'https://linkedin.com/in/maaike-de-bie', false, 'C-Level', 'CPO. Managing 13,000 employees, digital transformation culture change.'),
('contact_008', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Jane', 'Ashton', 'Director of Safety', 'Safety & Compliance', 'jane.ashton@easyjet.com', 'https://linkedin.com/in/jane-ashton', false, 'VP', 'Oversight of safety systems, predictive maintenance programs.'),
('contact_009', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Thomas', 'Haagensen', 'Director of Ground Operations', 'Operations', 'thomas.haagensen@easyjet.com', 'https://linkedin.com/in/thomas-haagensen', false, 'VP', 'Direct stakeholder in baggage handling improvements. Reports to COO.'),
('contact_010', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Anna', 'Knowles', 'Head of Commercial Analytics', 'Commercial', 'anna.knowles@easyjet.com', 'https://linkedin.com/in/anna-knowles', false, 'Director', 'Revenue optimization, pricing analytics, business intelligence.'),
('contact_011', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Michael', 'Brown', 'Chief Digital & Innovation Officer', 'Digital', 'michael.brown@easyjet.com', 'https://linkedin.com/in/michael-brown-easyjet', true, 'C-Level', 'CDIO. Digital transformation, innovation, emerging technologies.');

-- 4. TECHNOLOGIES (19 technologies across cloud, AI, aviation, and enterprise systems)
INSERT INTO technologies (tech_id, company_id, technology_name, category, vendor, description, implementation_year, status, annual_cost, users_count) VALUES
('tech_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Amazon Web Services (AWS)', 'Cloud Infrastructure', 'Amazon', 'Primary cloud platform hosting core applications, data lakes, ML workloads', 2019, 'Active', 12000000.00, 500),
('tech_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Databricks', 'Data & AI Platform', 'Databricks', 'Unified analytics platform for data engineering, ML model development, baggage analytics', 2022, 'Active', 2500000.00, 85),
('tech_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'MLflow', 'ML Ops', 'Databricks', 'ML lifecycle management, model tracking, deployment', 2022, 'Active', 150000.00, 45),
('tech_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Apache Spark', 'Big Data Processing', 'Apache', 'Large-scale data processing for operational analytics', 2020, 'Active', 0.00, 60),
('tech_005', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Jetstream AI Assistant', 'AI/Customer Service', 'Internal/Third-party', 'AI-powered customer service chatbot, handling common queries, bookings assistance', 2023, 'Active', 800000.00, 13000),
('tech_006', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'easyRes', 'Reservation System', 'Navitaire', 'Core passenger service system for reservations, check-in, departure control', 2015, 'Active', 5000000.00, 13000),
('tech_007', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Integrated Control Centre (ICC)', 'Operations Control', 'SITA', 'Real-time flight operations, crew management, disruption management', 2018, 'Active', 3200000.00, 250),
('tech_008', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Handling System (BHS)', 'Baggage Operations', 'Siemens/Vanderlande', 'Automated baggage sorting, tracking, loading systems across hubs', 2017, 'Active', 8000000.00, 2000),
('tech_009', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'WorldTracer', 'Baggage Tracking', 'SITA', 'Global baggage tracing system for mishandled baggage', 2010, 'Active', 400000.00, 1500),
('tech_010', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Workday', 'HR & Finance ERP', 'Workday', 'Human capital management, payroll, financial management', 2021, 'Active', 1800000.00, 800),
('tech_011', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Salesforce Service Cloud', 'CRM', 'Salesforce', 'Customer service case management, contact center operations', 2020, 'Active', 1200000.00, 350),
('tech_012', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Tableau', 'Business Intelligence', 'Salesforce', 'Data visualization, operational dashboards, executive reporting', 2019, 'Active', 500000.00, 200),
('tech_013', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Blue Prism', 'RPA', 'Blue Prism', 'Robotic process automation for back-office tasks', 2021, 'Active', 650000.00, 50),
('tech_014', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'UiPath', 'RPA', 'UiPath', 'Additional RPA platform for specific workflows', 2022, 'Active', 350000.00, 30),
('tech_015', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Amadeus Altéa', 'Departure Control', 'Amadeus', 'Check-in, boarding, flight management at select airports', 2016, 'Active', 2100000.00, 8000),
('tech_016', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AMOS', 'Maintenance & Engineering', 'Swiss AviationSoftware', 'Aircraft maintenance tracking, engineering records', 2014, 'Active', 900000.00, 120),
('tech_017', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Sabre AirCentre', 'Crew Management', 'Sabre', 'Crew scheduling, rostering, tracking', 2017, 'Active', 1500000.00, 180),
('tech_018', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'TensorFlow', 'ML Framework', 'Google', 'Machine learning framework for predictive models', 2021, 'Active', 0.00, 25),
('tech_019', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Microsoft Power Platform', 'Low-Code/Automation', 'Microsoft', 'Power Apps, Power Automate for citizen development', 2022, 'Active', 400000.00, 500);

-- 5. VENDORS (17 strategic vendors)
INSERT INTO vendors (vendor_id, vendor_name, vendor_type, industry, headquarters, country, website, relationship_type) VALUES
('vendor_001', 'Tata Consultancy Services (TCS)', 'System Integrator', 'IT Services', 'Mumbai', 'India', 'https://www.tcs.com', 'Strategic Partner'),
('vendor_002', 'NTT Data', 'System Integrator', 'IT Services', 'Tokyo', 'Japan', 'https://www.nttdata.com', 'Strategic Partner'),
('vendor_003', 'Accenture', 'Management Consulting', 'Consulting', 'Dublin', 'Ireland', 'https://www.accenture.com', 'Consulting Partner'),
('vendor_004', 'Databricks', 'Software Vendor', 'Data & AI', 'San Francisco, CA', 'USA', 'https://www.databricks.com', 'Technology Partner'),
('vendor_005', 'Amazon Web Services', 'Cloud Provider', 'Cloud Services', 'Seattle, WA', 'USA', 'https://aws.amazon.com', 'Strategic Partner'),
('vendor_006', 'Navitaire', 'Aviation Software', 'Aviation Tech', 'Minneapolis, MN', 'USA', 'https://www.navitaire.com', 'Critical Vendor'),
('vendor_007', 'SITA', 'Aviation IT', 'Aviation Tech', 'Geneva', 'Switzerland', 'https://www.sita.aero', 'Strategic Partner'),
('vendor_008', 'Siemens Logistics', 'Baggage Systems', 'Industrial Tech', 'Munich', 'Germany', 'https://www.siemens.com/logistics', 'Technology Partner'),
('vendor_009', 'Vanderlande', 'Baggage Systems', 'Industrial Tech', 'Veghel', 'Netherlands', 'https://www.vanderlande.com', 'Technology Partner'),
('vendor_010', 'Workday', 'Enterprise Software', 'HR Tech', 'Pleasanton, CA', 'USA', 'https://www.workday.com', 'Technology Partner'),
('vendor_011', 'Salesforce', 'CRM Software', 'Enterprise Software', 'San Francisco, CA', 'USA', 'https://www.salesforce.com', 'Technology Partner'),
('vendor_012', 'Amadeus', 'Aviation IT', 'Aviation Tech', 'Madrid', 'Spain', 'https://www.amadeus.com', 'Technology Partner'),
('vendor_013', 'Swiss AviationSoftware', 'Aviation Software', 'Aviation Tech', 'Basel', 'Switzerland', 'https://www.swiss-as.com', 'Technology Partner'),
('vendor_014', 'Sabre', 'Aviation IT', 'Aviation Tech', 'Southlake, TX', 'USA', 'https://www.sabre.com', 'Technology Partner'),
('vendor_015', 'Blue Prism', 'RPA Vendor', 'Automation', 'London', 'UK', 'https://www.blueprism.com', 'Technology Partner'),
('vendor_016', 'UiPath', 'RPA Vendor', 'Automation', 'New York, NY', 'USA', 'https://www.uipath.com', 'Technology Partner'),
('vendor_017', 'Capgemini', 'System Integrator', 'IT Services', 'Paris', 'France', 'https://www.capgemini.com', 'Technology Partner');

-- 6. CONTRACTS (8 major contracts)
INSERT INTO contracts (contract_id, company_id, vendor_id, contract_name, contract_type, start_date, end_date, contract_value, currency, status, description, renewal_notice_days, auto_renew) VALUES
('contract_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_001', 'TCS Digital Transformation Program', 'Professional Services', '2023-01-01', '2026-12-31', 45000000.00, 'GBP', 'Active', 'Multi-year transformation covering infrastructure modernization, cloud migration, legacy system retirement', 180, false),
('contract_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_002', 'NTT Data Application Support', 'Managed Services', '2024-04-01', '2026-03-31', 15800000.00, 'GBP', 'Active', 'Application maintenance, support, enhancements for core systems', 90, true),
('contract_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_005', 'AWS Enterprise Cloud Agreement', 'Cloud Services', '2023-01-01', '2025-12-31', 36000000.00, 'USD', 'Active', 'Enterprise cloud services including compute, storage, databases, ML services', 90, false),
('contract_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_004', 'Databricks Unified Analytics Platform', 'SaaS', '2022-06-01', '2025-05-31', 7500000.00, 'USD', 'Active', 'Data engineering, ML, analytics platform with professional services', 60, false),
('contract_005', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_006', 'Navitaire easyRes PSS', 'SaaS', '2020-01-01', '2025-12-31', 30000000.00, 'GBP', 'Active', 'Passenger service system including reservations, inventory, DCS', 180, true),
('contract_006', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_007', 'SITA Aviation Systems', 'SaaS + Hardware', '2021-01-01', '2026-12-31', 19200000.00, 'EUR', 'Active', 'ICC operations control, WorldTracer, airport systems', 120, false),
('contract_007', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_010', 'Workday HCM & Financial Management', 'SaaS', '2021-03-01', '2026-02-28', 9000000.00, 'GBP', 'Active', 'HR, payroll, financial management ERP', 90, true),
('contract_008', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'vendor_011', 'Salesforce Service Cloud Enterprise', 'SaaS', '2020-06-01', '2025-05-31', 6000000.00, 'GBP', 'Active', 'Customer service CRM, case management, omnichannel support', 60, true);

-- 7. STRATEGIC INITIATIVES (7 initiatives)
INSERT INTO initiatives (initiative_id, company_id, initiative_name, category, status, start_date, target_completion, budget, description, owner_contact_id) VALUES
('initiative_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI-Powered Baggage Analytics', 'AI/ML', 'Active', '2023-06-01', '2025-06-30', 3500000.00, 'Machine learning models on Databricks to predict baggage delays, optimize loading, reduce mishandling. Currently 94.2% accuracy.', 'contact_003'),
('initiative_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Jetstream AI Assistant Rollout', 'AI/ML', 'Active', '2023-01-01', '2024-12-31', 2100000.00, 'Customer-facing AI chatbot for booking, FAQs, disruption management. Target 80% automated resolution rate.', 'contact_006'),
('initiative_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Cloud-First Infrastructure Migration', 'Cloud Transformation', 'Active', '2022-07-01', '2025-12-31', 28000000.00, 'Migrate 80% of on-prem workloads to AWS. Led by TCS, includes data center consolidation.', 'contact_004'),
('initiative_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Operational Excellence Program', 'Process Improvement', 'Active', '2023-01-01', '2026-12-31', 15000000.00, 'Drive £1B profit target through operational improvements: reduce turnaround times, improve OTP, cost optimization.', 'contact_005'),
('initiative_005', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Predictive Maintenance for Fleet', 'AI/ML', 'Planning', '2024-09-01', '2026-03-31', 4200000.00, 'ML models to predict aircraft maintenance needs, reduce unplanned downtime, optimize MRO scheduling.', 'contact_008'),
('initiative_006', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Customer Data Platform (CDP)', 'Digital Transformation', 'Planning', '2024-10-01', '2025-12-31', 5800000.00, '360-degree customer view, personalization engine, targeted marketing campaigns.', 'contact_006'),
('initiative_007', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Sustainability & Carbon Reduction', 'Sustainability', 'Active', '2023-01-01', '2030-12-31', 50000000.00, 'Net zero by 2050 roadmap: fleet modernization, SAF adoption, operational efficiency, carbon offsetting.', 'contact_001');

-- 8. OPPORTUNITIES (5 opportunities)
INSERT INTO opportunities (opportunity_id, company_id, opportunity_name, category, priority, estimated_value, probability, status, description) VALUES
('opp_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Automated Baggage Load Optimization', 'AI/Automation', 'High', 12000000.00, 'High', 'Open', 'Expand AI baggage models to automate loading sequences, reduce load times from 18.5 to 15 mins. Potential £12M annual savings.'),
('opp_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Real-Time Crew Optimization', 'AI/ML', 'High', 8500000.00, 'Medium', 'Open', 'ML-driven dynamic crew scheduling to reduce disruption costs, improve utilization. Est. £8.5M savings.'),
('opp_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Advanced Revenue Management AI', 'AI/ML', 'Medium', 25000000.00, 'Medium', 'Open', 'Next-gen pricing and forecasting models using Databricks. Potential £25M revenue uplift.'),
('opp_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Self-Service Kiosk Expansion', 'Digital', 'Medium', 5000000.00, 'High', 'Open', 'Expand self-service check-in/bag-drop across all airports. Reduce staff costs, improve customer experience.'),
('opp_005', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI-Powered Dynamic Pricing', 'AI/ML', 'Low', 18000000.00, 'Low', 'Open', 'Real-time ancillary pricing optimization. Exploratory phase. Potential £18M revenue opportunity.');

-- 9. PAIN POINTS (4 pain points)
INSERT INTO pain_points (pain_point_id, company_id, category, severity, description, impact, identified_date, resolved_date, resolution) VALUES
('pain_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Operations', 'High', 'Baggage delivery within 45 minutes at 88.2%, below 95% target', '7% performance gap impacting customer satisfaction scores. Risk of EU261 compensation increases.', '2024-01-15', NULL, NULL),
('pain_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Operations', 'High', 'Average load time of 18.5 minutes vs 15-minute target', '3.5 minute gap affecting turnaround times, on-time performance. Cascade effect on daily operations.', '2024-01-15', NULL, NULL),
('pain_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Baggage Operations', 'Medium', 'Transfer baggage SLA achievement at 82.5% vs 90% target', 'Higher misconnection rates, customer complaints, rebooking costs. Particularly acute at major hubs.', '2024-02-20', NULL, NULL),
('pain_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'IT Systems', 'Medium', 'Legacy system dependencies slowing innovation', 'Multiple legacy systems creating integration complexity, slowing new feature deployment, increasing technical debt.', '2023-06-01', NULL, NULL);

-- 10. INTELLIGENCE NOTES (5 notes)
INSERT INTO intelligence_notes (note_id, company_id, category, note_date, source, content, tags) VALUES
('note_001', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Technology Strategy', '2024-01-10', 'Annual Report 2023', 'easyJet committed to £28M cloud migration program over 3 years with TCS as primary partner. Goal: 80% cloud by 2025. AWS primary cloud. Focus on cost optimization and scalability.', ARRAY['cloud', 'TCS', 'AWS', 'strategy']),
('note_002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI Strategy', '2024-02-15', 'CDO Interview - Aviation Week', 'Opal Perry (CDO) highlighted baggage analytics as flagship AI project. 94.2% prediction accuracy. Plans to expand to predictive maintenance and revenue optimization. Databricks and MLflow central to ML strategy.', ARRAY['AI', 'baggage', 'Databricks', 'predictive']),
('note_003', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Vendor Relationships', '2024-03-01', 'Procurement Team', 'NTT Data secured 2-year £15.8M application support contract. TCS remains primary transformation partner. Suggests multi-vendor strategy to avoid lock-in. Accenture engaged for strategic advisory.', ARRAY['vendors', 'NTT', 'TCS', 'Accenture']),
('note_004', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Financial Performance', '2024-04-30', 'Q2 Earnings Call', 'CFO De Raeymaker reiterated £1B profit target. Focus on: load factor improvement, ancillary revenue growth, cost per ASK reduction. Technology investments justified by ROI projections.', ARRAY['financial', 'targets', 'profit']),
('note_005', '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Growth Plans', '2024-05-20', 'Strategy Presentation', 'Fleet expansion to 400 aircraft by 2027. Route expansion focus: Southern Europe, North Africa. Digital transformation critical enabler. Customer experience investments (Jetstream AI) to drive loyalty.', ARRAY['growth', 'fleet', 'expansion', 'digital']);

-- ============================================
-- END OF EASYJET SEED DATA
-- ============================================
