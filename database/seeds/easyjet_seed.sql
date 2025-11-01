-- ============================================
-- EASYJET SEED DATA FOR PRISM PROJECT
-- ============================================

-- 1. COMPANY/CLIENT TABLE
INSERT INTO companies (
    company_id, name, industry, headquarters, country,
    description, website, total_revenue, net_profit,
    employee_count, founded_year, is_client
) VALUES (
    'easyjet_001',
    'easyJet',
    'Aviation',
    'Luton, United Kingdom',
    'United Kingdom',
    'Short-haul airline serving 38 countries with focus on affordable and reliable air travel',
    'https://www.easyjet.com',
    9300000000, -- £9.3 billion
    452000000,  -- £452 million
    NULL,
    1995,
    true
);

-- 2. COMPANY METRICS
INSERT INTO company_metrics (
    metric_id, company_id, metric_category, metric_name,
    metric_value, unit, fiscal_year, target_value
) VALUES
    ('metric_001', 'easyjet_001', 'Financial', 'Total Revenue', 9.3, 'billion GBP', 2024, NULL),
    ('metric_002', 'easyjet_001', 'Financial', 'Net Profit', 452, 'million GBP', 2024, NULL),
    ('metric_003', 'easyjet_001', 'Financial', 'Operating Profit', 597, 'million GBP', 2024, NULL),
    ('metric_004', 'easyjet_001', 'Financial', 'ROCE', 16.3, 'percent', 2024, NULL),
    ('metric_005', 'easyjet_001', 'Financial', 'Dividend', 12.1, 'pence per share', 2024, NULL),
    ('metric_006', 'easyjet_001', 'Financial', 'ICT Spend', 415.8, 'million USD', 2024, NULL),
    ('metric_007', 'easyjet_001', 'Operational', 'Annual Passengers', 89.7, 'million', 2024, NULL),
    ('metric_008', 'easyjet_001', 'Operational', 'Load Factor', 89.3, 'percent', 2024, NULL),
    ('metric_009', 'easyjet_001', 'Operational', 'Routes', 1207, 'count', 2024, NULL),
    ('metric_010', 'easyjet_001', 'Operational', 'Airports Served', 164, 'count', 2024, NULL),
    ('metric_011', 'easyjet_001', 'Operational', 'Fleet Size', 355, 'aircraft', 2024, NULL),
    ('metric_012', 'easyjet_001', 'Operational', 'Countries Served', 38, 'count', 2024, NULL),
    ('metric_013', 'easyjet_001', 'Operational', 'Daily Flights', 2000, 'flights', 2024, NULL),
    ('metric_014', 'easyjet_001', 'Baggage KPI', 'Arrival Baggage Delivery Rate', 82.5, 'percent', 2024, 90.0),
    ('metric_015', 'easyjet_001', 'Baggage KPI', 'Departure Load Time', 96.6, 'percent', 2024, 100.0),
    ('metric_016', 'easyjet_001', 'Baggage KPI', 'On-time Load', 98.2, 'percent', 2024, NULL),
    ('metric_017', 'easyjet_001', 'Baggage KPI', 'Mishandled Bag Rate', 4.4, 'per 1000 pax', 2024, 5.0),
    ('metric_018', 'easyjet_001', 'Baggage KPI', 'Transfer SLA', 99.2, 'percent', 2024, 99.5),
    ('metric_019', 'easyjet_001', 'Baggage KPI', 'Load Team Efficiency', 94.1, 'percent', 2024, 90.0),
    ('metric_020', 'easyjet_001', 'System Performance', 'Belt Availability', 99.1, 'percent', 2024, NULL),
    ('metric_021', 'easyjet_001', 'System Performance', 'BHS Uptime', 98.7, 'percent', 2024, NULL),
    ('metric_022', 'easyjet_001', 'System Performance', 'Incident Response Time', 8.3, 'minutes', 2024, NULL),
    ('metric_023', 'easyjet_001', 'AI Performance', 'ML Delay Prediction Accuracy', 94.2, 'percent', 2024, NULL),
    ('metric_024', 'easyjet_001', 'AI Performance', 'Time Saved by Early Interventions', 2.4, 'hours per day', 2024, NULL);

-- 3. EXECUTIVES/CONTACTS
INSERT INTO contacts (
    contact_id, company_id, first_name, last_name,
    title, department, email_pattern, linkedin_url,
    is_decision_maker, seniority_level
) VALUES
    ('exec_001', 'easyjet_001', 'Kenton', 'Jarvis', 'CEO', 'Executive', 'kenton.jarvis@easyjet.com', NULL, true, 'C-Level'),
    ('exec_002', 'easyjet_001', 'Jan', 'De Raeymaker', 'CFO', 'Finance', 'jan.deraeymaker@easyjet.com', NULL, true, 'C-Level'),
    ('exec_003', 'easyjet_001', 'David', 'Morgan', 'COO', 'Operations', 'david.morgan@easyjet.com', NULL, true, 'C-Level'),
    ('exec_004', 'easyjet_001', 'Opal', 'Perry', 'Chief Data and Technology Officer', 'Technology', 'opal.perry@easyjet.com', NULL, true, 'C-Level'),
    ('exec_005', 'easyjet_001', 'Sophie', 'Dekkers', 'Chief Commercial Officer', 'Commercial', 'sophie.dekkers@easyjet.com', NULL, true, 'C-Level'),
    ('exec_006', 'easyjet_001', 'Robert', 'Birge', 'Chief Customer and Marketing Officer', 'Marketing', 'robert.birge@easyjet.com', NULL, true, 'C-Level'),
    ('exec_007', 'easyjet_001', 'Elly', 'Tomlins', 'Chief People Officer', 'HR', 'elly.tomlins@easyjet.com', NULL, true, 'C-Level'),
    ('exec_008', 'easyjet_001', 'Rebecca', 'Mills', 'General Counsel', 'Legal', 'rebecca.mills@easyjet.com', NULL, true, 'C-Level'),
    ('exec_009', 'easyjet_001', 'Garry', 'Wilson', 'CEO – easyJet Holidays', 'Holidays Division', 'garry.wilson@easyjet.com', NULL, true, 'C-Level'),
    ('exec_010', 'easyjet_001', 'Thomas', 'Haagensen', 'Group Market Director', 'Commercial', 'thomas.haagensen@easyjet.com', NULL, true, 'VP'),
    ('exec_011', 'easyjet_001', 'Donna', 'Collins', 'Executive Assistant', 'Executive', 'donna.collins@easyjet.com', NULL, false, 'Manager');

-- 4. TECHNOLOGY STACK
INSERT INTO technologies (
    tech_id, company_id, technology_name, category,
    vendor, description, implementation_year, status
) VALUES
    -- Cloud & Data Infrastructure
    ('tech_001', 'easyjet_001', 'AWS', 'Cloud Infrastructure', 'Amazon Web Services', 'Primary cloud infrastructure platform', NULL, 'Active'),
    ('tech_002', 'easyjet_001', 'Databricks', 'Data Platform', 'Databricks', 'Lakehouse architecture for data engineering, warehousing, analytics', NULL, 'Active'),
    ('tech_003', 'easyjet_001', 'Databricks MLflow', 'ML Platform', 'Databricks', 'ML model management and experimentation', NULL, 'Active'),

    -- AI & Machine Learning
    ('tech_004', 'easyjet_001', 'Jetstream', 'Generative AI', 'Internal Development', 'In-house generative AI assistant for pilots and crew', NULL, 'Active'),
    ('tech_005', 'easyjet_001', 'LLM Natural Language Query Tools', 'AI/ML', 'Internal Development', 'Natural language query tools for non-technical users', NULL, 'Active'),
    ('tech_006', 'easyjet_001', 'AI Baggage Delay Prediction', 'AI/ML', 'Internal Development', 'Predictive analytics for baggage operations', NULL, 'Active'),
    ('tech_007', 'easyjet_001', 'AI Predictive Maintenance', 'AI/ML', 'Internal Development', 'Aircraft maintenance forecasting', NULL, 'Active'),

    -- Aviation Operations
    ('tech_008', 'easyjet_001', 'easyRes', 'Reservation System', 'Internal/Sopra', 'Core reservation system', NULL, 'Active'),
    ('tech_009', 'easyjet_001', 'Integrated Control Centre (ICC)', 'Operations Management', 'Internal Development', 'Flight operations management system', NULL, 'Active'),
    ('tech_010', 'easyjet_001', 'BHS', 'Baggage Handling', 'Multiple Vendors', 'Baggage Handling System', NULL, 'Active'),
    ('tech_011', 'easyjet_001', 'FLYdocs', 'Document Management', 'FLYdocs', 'Aviation record digitization', NULL, 'Active'),
    ('tech_012', 'easyjet_001', 'Aerogility', 'Planning & Forecasting', 'Aerogility', 'Demand forecasting and planning', NULL, 'Active'),
    ('tech_013', 'easyjet_001', 'OpenAirlines SkyBreathe', 'Fuel Optimization', 'OpenAirlines', 'Fuel optimization and CO2 reduction', NULL, 'Active'),
    ('tech_014', 'easyjet_001', 'SITA', 'Aviation IT', 'SITA', 'Aviation communications and IT', NULL, 'Active'),

    -- Enterprise Systems
    ('tech_015', 'easyjet_001', 'Workday', 'ERP', 'Workday', 'HR and Finance management', NULL, 'Active'),
    ('tech_016', 'easyjet_001', 'SiteMinder', 'Hotel Distribution', 'SiteMinder', 'Hotel distribution platform for easyJet Holidays', NULL, 'Active'),
    ('tech_017', 'easyjet_001', 'Digital Voucher System', 'Customer Service', 'Thoughtworks', 'Customer service platform', NULL, 'Active'),

    -- Automation
    ('tech_018', 'easyjet_001', 'RPA', 'Process Automation', 'NTT Data', 'Robotic Process Automation', NULL, 'Active'),
    ('tech_019', 'easyjet_001', 'Chatbots', 'Customer Service', 'Internal Development', 'Customer service chatbots', NULL, 'Active');

-- 5. VENDORS/PARTNERS
INSERT INTO vendors (
    vendor_id, vendor_name, vendor_type, industry,
    headquarters, website, relationship_type
) VALUES
    ('vendor_001', 'TCS (Tata Consultancy Services)', 'System Integrator', 'IT Services', 'India', 'https://www.tcs.com', 'Strategic Partner'),
    ('vendor_002', 'NTT Data', 'System Integrator', 'IT Services', 'Japan', 'https://www.nttdata.com', 'Contractor'),
    ('vendor_003', 'Accenture', 'Consulting', 'IT Services', 'Ireland', 'https://www.accenture.com', 'Consultant'),
    ('vendor_004', 'Sopra', 'Software/Integration', 'IT Services', 'France', 'https://www.soprasteria.com', 'Technology Partner'),
    ('vendor_005', 'Thoughtworks', 'Software/Integration', 'IT Services', 'USA', 'https://www.thoughtworks.com', 'Technology Partner'),
    ('vendor_006', 'Databricks', 'Software Vendor', 'Data & AI', 'USA', 'https://www.databricks.com', 'Technology Partner'),
    ('vendor_007', 'SprintReply', 'BPS', 'IT Services', 'Italy', 'https://www.reply.com', 'Service Provider'),
    ('vendor_008', 'Capacitas', 'Cloud Services', 'IT Services', 'UK', NULL, 'Technology Partner'),
    ('vendor_009', 'CloudRock', 'Digital Transformation', 'IT Services', 'UK', NULL, 'Consultant'),
    ('vendor_010', 'TransPerfect', 'Translation Services', 'Language Services', 'USA', 'https://www.transperfect.com', 'Service Provider'),
    ('vendor_011', 'Aerogility', 'Aviation Software', 'Aviation Tech', 'UK', 'https://www.aerogility.com', 'Technology Partner'),
    ('vendor_012', 'OpenAirlines', 'Aviation Software', 'Aviation Tech', 'France', 'https://www.openairlines.com', 'Technology Partner'),
    ('vendor_013', 'FLYdocs', 'Aviation Software', 'Aviation Tech', 'UK', 'https://www.flydocs.aero', 'Technology Partner'),
    ('vendor_014', 'SITA', 'Aviation IT', 'Aviation Tech', 'Switzerland', 'https://www.sita.aero', 'Technology Partner'),
    ('vendor_015', 'SiteMinder', 'Hotel Tech', 'Hospitality Tech', 'Australia', 'https://www.siteminder.com', 'Technology Partner'),
    ('vendor_016', 'Workday', 'Enterprise Software', 'ERP', 'USA', 'https://www.workday.com', 'Technology Partner'),
    ('vendor_017', 'Amazon Web Services', 'Cloud Platform', 'Cloud Services', 'USA', 'https://aws.amazon.com', 'Strategic Partner');

-- 6. CONTRACTS
INSERT INTO contracts (
    contract_id, company_id, vendor_id, contract_name,
    contract_type, start_date, end_date, contract_value,
    currency, status, description
) VALUES
    ('contract_001', 'easyjet_001', 'vendor_001', 'TCS Data Transformation', 'Multi-year Transformation', '2023-01-01', NULL, NULL, 'GBP', 'Active',
     'Data-driven transformation, centralized data hub, infrastructure services, cloud migration, new operating models'),
    ('contract_002', 'easyjet_001', 'vendor_002', 'NTT Data Testing & RPA', 'Service Contract', '2024-01-01', '2027-12-31', 15800000, 'USD', 'Active',
     'Testing services and Robotic Process Automation'),
    ('contract_003', 'easyjet_001', 'vendor_003', 'Accenture Data Consulting', 'Consulting', NULL, NULL, NULL, 'GBP', 'Active',
     'Data consulting services'),
    ('contract_004', 'easyjet_001', 'vendor_004', 'Sopra easyRes System', 'Software License', NULL, NULL, NULL, 'GBP', 'Active',
     'easyRes reservation system development and maintenance'),
    ('contract_005', 'easyjet_001', 'vendor_005', 'Thoughtworks Digital Voucher', 'Software Development', NULL, NULL, NULL, 'GBP', 'Active',
     'Digital voucher system and integration services'),
    ('contract_006', 'easyjet_001', 'vendor_006', 'Databricks Platform', 'Software License', NULL, NULL, NULL, 'USD', 'Active',
     'Databricks lakehouse architecture and analytics platform'),
    ('contract_007', 'easyjet_001', 'vendor_009', 'CloudRock Digital Transformation', 'Consulting', NULL, NULL, NULL, 'GBP', 'Active',
     'HR/Finance digital transformation'),
    ('contract_008', 'easyjet_001', 'vendor_017', 'AWS Cloud Infrastructure', 'Cloud Services', NULL, NULL, NULL, 'USD', 'Active',
     'Primary cloud infrastructure migration and services');

-- 7. STRATEGIC INITIATIVES
INSERT INTO initiatives (
    initiative_id, company_id, initiative_name, category,
    status, start_date, target_completion, budget, description
) VALUES
    ('init_001', 'easyjet_001', 'AI-Powered Baggage Analytics', 'AI/Digital Transformation', 'Active', '2023-01-01', NULL, NULL,
     'AI-powered baggage delay prediction and KPI monitoring system with 94.2% ML accuracy'),
    ('init_002', 'easyjet_001', 'Jetstream AI Assistant', 'AI/Operational Efficiency', 'Active', '2023-01-01', NULL, NULL,
     'Generative AI assistant for pilots and crew, indexing operational manuals'),
    ('init_003', 'easyjet_001', 'Cloud Migration to AWS', 'Cloud Transformation', 'Active', '2022-01-01', NULL, NULL,
     'Migration of IT infrastructure to AWS with TCS support'),
    ('init_004', 'easyjet_001', 'Databricks Lakehouse Implementation', 'Data Platform', 'Active', '2022-01-01', NULL, NULL,
     'Centralized data hub with real-time processing capabilities'),
    ('init_005', 'easyjet_001', 'Integrated Control Centre Optimization', 'Operational Excellence', 'Active', NULL, NULL, NULL,
     'AI-powered predictive maintenance, crew and aircraft planning for 2,000 daily flights'),
    ('init_006', 'easyjet_001', 'easyJet Holidays Growth', 'Business Expansion', 'Active', NULL, '2028-12-31', NULL,
     'Target 25% customer growth, £190M profit before tax (56% increase)'),
    ('init_007', 'easyjet_001', '£1 Billion Profit Target', 'Financial Goal', 'Active', '2025-01-01', '2028-12-31', NULL,
     'Annual profit target for 2026-2028 period');

-- 8. BUSINESS OPPORTUNITIES
INSERT INTO opportunities (
    opportunity_id, company_id, opportunity_name, category,
    priority, estimated_value, probability, status, description
) VALUES
    ('opp_001', 'easyjet_001', 'Baggage Automation Enhancement', 'AI/ML', 'High', NULL, 'High', 'Qualified',
     'Improve arrival baggage delivery rate from 82.5% to 90% target using advanced AI'),
    ('opp_002', 'easyjet_001', 'Departure Load Time Optimization', 'Operations', 'High', NULL, 'High', 'Qualified',
     'Close gap from 96.6% to 100% target for departure load time'),
    ('opp_003', 'easyjet_001', 'Transfer SLA Improvement', 'Operations', 'Medium', NULL, 'Medium', 'Qualified',
     'Improve transfer SLA from 99.2% to 99.5% target'),
    ('opp_004', 'easyjet_001', 'AI Platform Expansion', 'AI/ML', 'High', NULL, 'Medium', 'Discovery',
     'Expand Jetstream AI capabilities and additional AI use cases'),
    ('opp_005', 'easyjet_001', 'Real-time Analytics Enhancement', 'Data & Analytics', 'Medium', NULL, 'Medium', 'Discovery',
     'Enhance real-time data processing and predictive analytics capabilities');

-- 9. PAIN POINTS / CHALLENGES
INSERT INTO pain_points (
    pain_point_id, company_id, category, severity,
    description, impact, identified_date
) VALUES
    ('pain_001', 'easyjet_001', 'Baggage Operations', 'High',
     'Arrival baggage delivery rate at 82.5%, below 90% target',
     'Customer satisfaction and operational efficiency', '2024-01-01'),
    ('pain_002', 'easyjet_001', 'Baggage Operations', 'Medium',
     'Departure load time at 96.6%, below 100% target',
     'On-time performance and operational efficiency', '2024-01-01'),
    ('pain_003', 'easyjet_001', 'Transfer Operations', 'Medium',
     'Transfer SLA at 99.2%, below 99.5% target',
     'Customer experience for connecting passengers', '2024-01-01'),
    ('pain_004', 'easyjet_001', 'Daily Operations', 'Medium',
     'Managing 2,000 flights daily requires continuous optimization',
     'Operational complexity and resource allocation', '2024-01-01');

-- 10. NOTES / INTELLIGENCE
INSERT INTO intelligence_notes (
    note_id, company_id, category, note_date,
    source, content, tags
) VALUES
    ('note_001', 'easyjet_001', 'Technology Strategy', '2024-01-01', 'Annual Report',
     'Migrated IT infrastructure to AWS and adopted Databricks lakehouse architecture for real-time data processing',
     ARRAY['Cloud', 'Data Platform', 'AWS', 'Databricks']),
    ('note_002', 'easyjet_001', 'AI Strategy', '2024-01-01', 'Annual Report',
     'Developed Jetstream, in-house generative AI assistant for pilots and crew. Achieved 94.2% ML accuracy in baggage delay prediction',
     ARRAY['AI', 'GenAI', 'Predictive Analytics', 'Operational AI']),
    ('note_003', 'easyjet_001', 'Vendor Strategy', '2024-01-01', 'Annual Report',
     'TCS is strategic partner for data transformation and cloud migration. NTT Data handles testing and RPA ($15.8M contract 2024-2027)',
     ARRAY['Vendors', 'Outsourcing', 'TCS', 'NTT Data']),
    ('note_004', 'easyjet_001', 'Financial Performance', '2024-01-01', 'Annual Report',
     'Strong financial performance: £9.3B revenue (+14%), £452M net profit (+40%), targeting £1B annual profit by 2026-2028',
     ARRAY['Financial', 'Growth', 'Performance']),
    ('note_005', 'easyjet_001', 'Growth Strategy', '2024-01-01', 'Annual Report',
     'easyJet Holidays division showing strong growth: £190M PBT (+56%), customer numbers +36%, targeting 25% growth',
     ARRAY['Strategy', 'Holidays', 'Growth']);

-- ============================================
-- END OF EASYJET SEED DATA
-- ============================================
