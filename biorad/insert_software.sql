-- Bio-Rad Software Data Insert Script
-- Generated from biorad_software_final_processed.csv
--
-- Instructions:
-- 1. First, ensure you have a Bio-Rad company in the database:
--    Run the first INSERT or get the existing company_id
-- 2. Replace {{COMPANY_ID}} with the actual Bio-Rad company UUID
-- 3. Run this script against your database

-- Step 1: Create Bio-Rad company if it doesn't exist
-- (You can skip this if Bio-Rad already exists)
INSERT INTO companies (company_name, slug, industry, employee_count)
VALUES ('Bio-Rad Laboratories', 'bio-rad', 'Life Sciences', 8000)
ON CONFLICT (slug) DO NOTHING;

-- Get the company ID (run this query separately to get the ID):
-- SELECT id FROM companies WHERE slug = 'bio-rad';

-- Step 2: Insert software data
-- Replace {{COMPANY_ID}} with the actual UUID from the query above

-- Use a DO block for the inserts with conflict handling
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Get company ID
  SELECT id INTO v_company_id FROM companies WHERE slug = 'bio-rad';

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Bio-Rad company not found. Please create it first.';
  END IF;

  -- Insert all software records
  INSERT INTO software (company_id, software_name, vendor_name, category, product_description, total_annual_cost, total_licenses, active_users, utilization_rate, license_type, renewal_date, contract_status)
  VALUES
    (v_company_id, 'AWS Cloud Services', 'Amazon Web Services', 'Cloud Infrastructure', 'Various AWS cloud services subscribed by Bio-Rad under Enterprise Account agreement.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Microsoft EA and Unified Phone Shared Services', 'Microsoft Corporation', 'Productivity', 'Enterprise global licenses from Microsoft including unified and phone shared services contracts.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SAP CRM', 'SAP SE', 'CRM', 'Customer Relationship Management application for Sales, Service, Marketing, Compliance, Legal, Supply Chain, Product Development, etc.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Veeva Systems', 'Veeva Systems', 'Quality Management', 'ERP system for sales, supply chain, and finance transactions.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Snowflake', 'Snowflake Inc', 'Data Analytics', 'Cloud-based data storage and analytics service, Enterprise edition for US-West region.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SuccessFactors', 'SAP SE', 'HCM', 'Cloud-based human capital management software using SaaS model.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Oracle EPM', 'Oracle Corporation', 'Financial Planning', 'Demand and Supply planning system with consolidation and close support.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Oracle CPQ', 'Oracle Corporation', 'Sales', 'Streamlines opportunity-to-quote-to-order process with Oracle CPQ Enterprise Edition Cloud Service.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Concur', 'SAP Concur', 'Travel & Expense', 'Travel and expense management solutions with online booking tools, mobile expense tracking, and automated policy enforcement.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SAP GTS', 'SAP SE', 'Trade Compliance', 'Automates and streamlines global trade processes including import/export compliance.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Vertex', 'Vertex Inc', 'Tax Management', 'Automates tax processes, integrates with SAP ECC for compliance.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SAP Blackline', 'SAP SE', 'Financial Close', 'Cloud-based service to automate and control financial close process.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Paymetric', 'Worldline', 'Payment Processing', 'Integrated cloud solution to secure and streamline credit card payment acceptance.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Sovos Brazil', 'Sovos Compliance', 'Tax Compliance', 'Tax compliance and regulatory solutions for Brazilian market.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Cisco', 'Cisco Systems', 'Network Security', 'Network Access Control solution for Zero Trust Architecture.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Qlik', 'Qlik Technologies', 'Data Integration', 'Data integration products for operational data and management reports.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Veritas', 'Veritas Technologies', 'Storage', 'Storage for Network file share drive, execution management, and process mining software.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Docusign', 'DocuSign Inc', 'Document Management', 'Document signing software services, eSignature Enterprise Pro Edition.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Gartner', 'Gartner Inc', 'Research', 'Research and consulting services, executive program licenses.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Qualys', 'Qualys Inc', 'Security', 'Cybersecurity and compliance tools including VMDR Bundle and policy compliance.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Jira', 'Atlassian', 'Project Management', 'Issue Project Tracking Software.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Matillion', 'Matillion Ltd', 'ETL', 'ETL - Operational data and management reports, Enterprise contract subscription.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Innovit', 'Innovit AG', 'Regulatory Data', 'Software to capture and enhance data sent to regulatory agencies.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'ETQ', 'ETQ LLC', 'Quality Management', 'Cloud-based eQMS used in NorCal, to be decommissioned soon.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Acquia', 'Acquia Inc', 'Content Management', 'Content Management System and site search platform with cloud subscriptions.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Taulia', 'Taulia Inc', 'Invoice Management', 'Invoice management solution for streamlining invoicing process.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'BMC control M', 'BMC Software', 'Workflow Automation', 'Integrates and automates cross-platform IT and business processes.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Ariba', 'SAP Ariba', 'Procurement', 'Procurement platform for B2B business.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Worksoft', 'Worksoft Inc', 'Test Automation', 'Automated testing tool for SAP.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Okta', 'Okta Inc', 'Identity Management', 'Used for authentication, phasing out during 2024.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SiemensECTR', 'Siemens AG', 'PLM Integration', 'SAP Engineering Control Center integration platform.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Cadency', 'Trintech', 'Account Reconciliation', 'Account Reconciliation and Journal Management system.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Sparta Systems', 'Honeywell', 'Product Registration', 'Salesforce based system for product registration and documentation for regulated markets.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Commvault', 'Commvault Systems', 'Backup & Recovery', 'Data protection and management software, backup recovery services.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Thycotic Delinea', 'Delinea Inc', 'Privileged Access', 'Cybersecurity for privileged access management.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'LRS', 'Levi Ray & Shoup', 'Print Management', 'Output and Print Management software including VPSXWORKPLACE.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Adobe Analytics', 'Adobe Inc', 'Analytics', 'Analytics tool for measuring Bio-Rad usage, including Adobe target premium.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Accuity', 'LexisNexis', 'Banking Data', 'Services and integration for banking fraud reduction.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SUSE Linux Enterprise Server', 'SUSE Linux', 'Operating System', 'Datacenter deployment, lifecycle management licenses.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Avepoint', 'AvePoint Inc', 'SharePoint', 'Cloud archiving for SharePoint storage.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Vertex Versa', 'Vertex Inc', 'Tax Management', 'Tax automation and compliance integration with SAP ECC.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Open Text', 'OpenText Corporation', 'EDI', 'Used to receive Credit card orders from Customers via EDI into SAP. Monthly Message Delivery and Managed Integration Services Fees.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SHARP BUSINESS - Papercut MFCs', 'Sharp Corporation', 'Print Management', 'Papercut licenses and print management subscription with 1 year ProServices Support.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Bitsight', 'BitSight Technologies', 'Cyber Risk', 'Cyber Risk Management Solution; subscription to SPM Standard E for External Attack Surface Management.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Patch My PC', 'Patch My PC', 'Patch Management', 'Enterprise plus license for automated third-party updates and base install applications in Configuration Manager and Microsoft Intune.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Ivanti Velocity', 'Ivanti Inc', 'Asset Management', 'Web and MDM subscriptions for asset management and remote inventory.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'TeamViewer', 'TeamViewer AG', 'Remote Access', 'Remote desktop and collaboration software for accessing and controlling computers remotely.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Vertiv', 'Vertiv Holdings', 'UPS', 'UPS provider services.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Lexmark', 'Lexmark International', 'Print Services', 'Managed Print Services for specified locations under government contractual requirement.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Veracode EMEA', 'Veracode Inc', 'Security Testing', 'Veracode EMEA software solution', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Iron Mountain', 'Iron Mountain Inc', 'Storage Services', 'Outsourcing storage media, backups, standard, premium, and custom storage services.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Salesforce Analytics', 'Salesforce Inc', 'Analytics', 'Additional analytics capabilities and contracts ending in 2025.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Contact Monkey', 'ContactMonkey', 'Email Platform', 'Email communications platform.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Atrify', 'Atrify GmbH', 'Product Data', 'Platform to manage and exchange product information, automated M2M connection for suppliers.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Google Cloud Liaison', 'Google Cloud', 'Cloud Services', 'Used for translation via API to Google for non-English information.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'FLOSUM', 'Flosum LLC', 'Salesforce DevOps', 'Salesforce administration utility for change management and deployment.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Nirad', 'Nirad', 'Network Management', 'Network management, cloud management, out of band management subscriptions.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Seeburger', 'Seeburger AG', 'EDI', 'B2B EDI integration and cloud subscription.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Klearcom', 'Klearcom', 'Risk Management', 'Third-party risk management for security and privacy.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'DNN', 'DNN Corp', 'CMS', 'Open source CMS and application development framework providing Evoq Engage licenses.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Audiocodes', 'AudioCodes Ltd', 'Voice Infrastructure', 'Advanced voice networking and media processing hardware maintenance.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Orbit Treasury', 'Ion Group', 'Treasury', 'Cash management, liquidity management, financial risk management tools.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Sage 1000', 'Sage Group', 'ERP', 'ERP solution for medium to large businesses with end-of-life status.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Minitab', 'Minitab LLC', 'Statistical Analysis', 'Data analysis and statistical process improvement software licenses.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Diligent Corp', 'Diligent Corporation', 'Governance', 'Governance software for executive board meetings.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Microsoft PowerBI', 'Microsoft Corporation', 'Business Intelligence', 'Business intelligence software cross charged across teams.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Quest', 'Quest Software', 'Active Directory', 'Active Directory tool for backup recovery and monitoring.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'EDICOM', 'EDICOM Group', 'Tax Reporting', 'Tax reporting software in various countries.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Valimail', 'Valimail Inc', 'Email Security', 'Email authentication and third-party email management.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'IBM Sterling', 'IBM Corporation', 'EDI', 'Integrator used for complex EDI processes for thousands of customers.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Winshuttle', 'Precisely Inc', 'SAP Automation', 'Data management and automation software for SAP.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Zoom', 'Zoom Video', 'Video Conferencing', 'Video conferencing platform for online meetings and webinars.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Tungsten Automation', 'Tungsten Automation', 'Invoice Workflow', 'Vendor invoice workflow process maintenance services.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'UiPath', 'UiPath Inc', 'RPA', 'Robotic process automation software for automating repetitive tasks.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Riskonnect', 'Riskonnect Inc', 'GRC', 'Salesforce platform application for third-party compliance tracking.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Active Control', 'Basis Technologies', 'SAP Transport', 'Management system licenses covering ECCERI, APOSCM, GTS, EWM, PI systems.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Cloudability', 'Apptio', 'Cloud FinOps', 'Cloud financial management platform for AWS and Azure.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'NeoLoad', 'Tricentis', 'Load Testing', 'Load test tool replacement for LoadNinja.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'DESCARTES', 'Descartes Systems', 'Logistics', 'Logistics and supply chain management software.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Hackerone', 'HackerOne Inc', 'Security', 'Cybersecurity hacker-powered platform subscription.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'BluJay', 'E2open', 'Supply Chain', 'Supply chain software and services.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Bigcommerce', 'BigCommerce', 'eCommerce', 'Vendor for BRC shopping cart with Enterprise plan.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'CSC', 'CSC Global', 'Domain Management', 'Domain management services for Bio-Rad.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SNI', 'SNI', 'Tax Compliance', 'Maintenance cloud services with yearly renewal for tax authority updates.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Refinitiv', 'LSEG', 'Financial Data', 'Financial market data, analytics, and trading solutions for Treasury team.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Onetrust', 'OneTrust LLC', 'Privacy', 'Third-party risk management for security privacy standard cloud license.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Leverx', 'Leverx Group', 'SAP PLM', 'SAP PLM software maintenance contract.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Smartsheet', 'Smartsheet Inc', 'Collaboration', 'Collaboration and work management SaaS platform used by different departments.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Specops', 'Specops Software', 'Password Security', 'Password security subscription for Active Directory.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'REQUORDIT', 'Requordit', 'Document Management', 'Document management system for legal department and process documents.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Dotcom-Monitor', 'Dotcom-Monitor', 'Website Monitoring', 'Real-time website and application monitoring services.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Cobalt Strike', 'Fortra', 'Penetration Testing', 'Penetration testing software with licenses used by Infosec team.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Validity', 'Validity Inc', 'Data Quality', 'Data validation and quality software.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'Visio', 'Microsoft Corporation', 'Diagramming', 'Diagramming and vector graphics software.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active'),
    (v_company_id, 'SHARP BUSINESS - Papercut', 'Sharp Corporation', 'Print Management', 'Print management cloud-native subscription with ProServices Support.', 10000, 50, 40, 80, 'per_user', '2026-12-04', 'active')
  ON CONFLICT (company_id, software_name, vendor_name)
  DO UPDATE SET
    category = EXCLUDED.category,
    product_description = COALESCE(EXCLUDED.product_description, software.product_description),
    updated_at = NOW();

  RAISE NOTICE 'Successfully loaded software data for Bio-Rad';
END $$;

-- Verify the data loaded
SELECT COUNT(*) as total_software
FROM software s
JOIN companies c ON s.company_id = c.id
WHERE c.slug = 'bio-rad' AND s.deleted_at IS NULL;
