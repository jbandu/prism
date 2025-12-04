/**
 * Script to load Bio-Rad software data into the database
 * Run with: node load_software_data.js
 */

const fs = require('fs');
const path = require('path');

// Software name to vendor mapping
const vendorMapping = {
  'AWS': 'Amazon Web Services',
  'Microsoft': 'Microsoft Corporation',
  'SAP': 'SAP SE',
  'Veeva': 'Veeva Systems',
  'Snowflake': 'Snowflake Inc',
  'SuccessFactors': 'SAP SE',
  'Oracle': 'Oracle Corporation',
  'Concur': 'SAP Concur',
  'Vertex': 'Vertex Inc',
  'Paymetric': 'Worldline',
  'Sovos': 'Sovos Compliance',
  'Cisco': 'Cisco Systems',
  'Qlik': 'Qlik Technologies',
  'Veritas': 'Veritas Technologies',
  'Docusign': 'DocuSign Inc',
  'Gartner': 'Gartner Inc',
  'Qualys': 'Qualys Inc',
  'Jira': 'Atlassian',
  'Matillion': 'Matillion Ltd',
  'Innovit': 'Innovit AG',
  'ETQ': 'ETQ LLC',
  'Acquia': 'Acquia Inc',
  'Taulia': 'Taulia Inc',
  'BMC': 'BMC Software',
  'Ariba': 'SAP Ariba',
  'Worksoft': 'Worksoft Inc',
  'Okta': 'Okta Inc',
  'Siemens': 'Siemens AG',
  'Cadency': 'Trintech',
  'Sparta': 'Honeywell',
  'Commvault': 'Commvault Systems',
  'Thycotic': 'Delinea Inc',
  'LRS': 'Levi Ray & Shoup',
  'Adobe': 'Adobe Inc',
  'Accuity': 'LexisNexis',
  'SUSE': 'SUSE Linux',
  'Avepoint': 'AvePoint Inc',
  'Open Text': 'OpenText Corporation',
  'SHARP': 'Sharp Corporation',
  'Bitsight': 'BitSight Technologies',
  'Patch My PC': 'Patch My PC',
  'Ivanti': 'Ivanti Inc',
  'TeamViewer': 'TeamViewer AG',
  'Vertiv': 'Vertiv Holdings',
  'Lexmark': 'Lexmark International',
  'Veracode': 'Veracode Inc',
  'Iron Mountain': 'Iron Mountain Inc',
  'Salesforce': 'Salesforce Inc',
  'Contact Monkey': 'ContactMonkey',
  'Atrify': 'Atrify GmbH',
  'Google': 'Google Cloud',
  'FLOSUM': 'Flosum LLC',
  'Nirad': 'Nirad',
  'Seeburger': 'Seeburger AG',
  'Klearcom': 'Klearcom',
  'DNN': 'DNN Corp',
  'Audiocodes': 'AudioCodes Ltd',
  'Orbit': 'Ion Group',
  'Sage': 'Sage Group',
  'Minitab': 'Minitab LLC',
  'Diligent': 'Diligent Corporation',
  'PowerBI': 'Microsoft Corporation',
  'Quest': 'Quest Software',
  'EDICOM': 'EDICOM Group',
  'Valimail': 'Valimail Inc',
  'IBM': 'IBM Corporation',
  'Winshuttle': 'Precisely Inc',
  'Zoom': 'Zoom Video',
  'Tungsten': 'Tungsten Automation',
  'UiPath': 'UiPath Inc',
  'Riskonnect': 'Riskonnect Inc',
  'Active Control': 'Basis Technologies',
  'Cloudability': 'Apptio',
  'NeoLoad': 'Tricentis',
  'DESCARTES': 'Descartes Systems',
  'Hackerone': 'HackerOne Inc',
  'BluJay': 'E2open',
  'Bigcommerce': 'BigCommerce',
  'CSC': 'CSC Global',
  'SNI': 'SNI',
  'Refinitiv': 'LSEG',
  'Onetrust': 'OneTrust LLC',
  'Leverx': 'Leverx Group',
  'Smartsheet': 'Smartsheet Inc',
  'Specops': 'Specops Software',
  'REQUORDIT': 'Requordit',
  'Dotcom-Monitor': 'Dotcom-Monitor',
  'Cobalt Strike': 'Fortra',
  'Validity': 'Validity Inc',
  'Visio': 'Microsoft Corporation',
};

// Category mapping based on software type
const categoryMapping = {
  'AWS': 'Cloud Infrastructure',
  'Microsoft EA': 'Productivity',
  'SAP CRM': 'CRM',
  'Veeva': 'Quality Management',
  'Snowflake': 'Data Analytics',
  'SuccessFactors': 'HCM',
  'Oracle EPM': 'Financial Planning',
  'Oracle CPQ': 'Sales',
  'Concur': 'Travel & Expense',
  'SAP GTS': 'Trade Compliance',
  'Vertex': 'Tax Management',
  'SAP Blackline': 'Financial Close',
  'Blackline': 'Financial Close',
  'Paymetric': 'Payment Processing',
  'Sovos': 'Tax Compliance',
  'Cisco': 'Network Security',
  'Qlik': 'Data Integration',
  'Veritas': 'Storage',
  'Docusign': 'Document Management',
  'Gartner': 'Research',
  'Qualys': 'Security',
  'Jira': 'Project Management',
  'Matillion': 'ETL',
  'Innovit': 'Regulatory Data',
  'ETQ': 'Quality Management',
  'Acquia': 'Content Management',
  'Taulia': 'Invoice Management',
  'BMC': 'Workflow Automation',
  'Ariba': 'Procurement',
  'Worksoft': 'Test Automation',
  'Okta': 'Identity Management',
  'Siemens': 'PLM Integration',
  'Cadency': 'Account Reconciliation',
  'Sparta': 'Product Registration',
  'Commvault': 'Backup & Recovery',
  'Thycotic': 'Privileged Access',
  'LRS': 'Print Management',
  'Adobe': 'Analytics',
  'Accuity': 'Banking Data',
  'SUSE': 'Operating System',
  'Avepoint': 'SharePoint',
  'Open Text': 'EDI',
  'SHARP': 'Print Management',
  'Bitsight': 'Cyber Risk',
  'Patch My PC': 'Patch Management',
  'Ivanti': 'Asset Management',
  'TeamViewer': 'Remote Access',
  'Vertiv': 'UPS',
  'Lexmark': 'Print Services',
  'Veracode': 'Security Testing',
  'Iron Mountain': 'Storage Services',
  'Salesforce': 'Analytics',
  'Contact Monkey': 'Email Platform',
  'Atrify': 'Product Data',
  'Google': 'Cloud Services',
  'FLOSUM': 'Salesforce DevOps',
  'Flosum': 'Salesforce DevOps',
  'Nirad': 'Network Management',
  'Seeburger': 'EDI',
  'Klearcom': 'Risk Management',
  'DNN': 'CMS',
  'Audiocodes': 'Voice Infrastructure',
  'Orbit': 'Treasury',
  'Sage': 'ERP',
  'Minitab': 'Statistical Analysis',
  'Diligent': 'Governance',
  'PowerBI': 'Business Intelligence',
  'Quest': 'Active Directory',
  'EDICOM': 'Tax Reporting',
  'Valimail': 'Email Security',
  'IBM': 'EDI',
  'Sterling': 'EDI',
  'Winshuttle': 'SAP Automation',
  'Zoom': 'Video Conferencing',
  'Tungsten': 'Invoice Workflow',
  'UiPath': 'RPA',
  'Riskonnect': 'GRC',
  'Active Control': 'SAP Transport',
  'Cloudability': 'Cloud FinOps',
  'NeoLoad': 'Load Testing',
  'DESCARTES': 'Logistics',
  'Hackerone': 'Security',
  'BluJay': 'Supply Chain',
  'Bigcommerce': 'eCommerce',
  'CSC': 'Domain Management',
  'SNI': 'Tax Compliance',
  'Refinitiv': 'Financial Data',
  'Onetrust': 'Privacy',
  'Leverx': 'SAP PLM',
  'Smartsheet': 'Collaboration',
  'Specops': 'Password Security',
  'REQUORDIT': 'Document Management',
  'Dotcom-Monitor': 'Website Monitoring',
  'Cobalt Strike': 'Penetration Testing',
  'Validity': 'Data Quality',
  'Visio': 'Diagramming',
};

function getVendor(softwareName) {
  // Check for exact or partial match in vendor mapping
  for (const [key, vendor] of Object.entries(vendorMapping)) {
    if (softwareName.toLowerCase().includes(key.toLowerCase())) {
      return vendor;
    }
  }
  // Default: extract first word as vendor
  const firstWord = softwareName.split(' ')[0];
  return firstWord || 'Unknown Vendor';
}

function getCategory(softwareName) {
  // Check for exact or partial match in category mapping
  for (const [key, category] of Object.entries(categoryMapping)) {
    if (softwareName.toLowerCase().includes(key.toLowerCase())) {
      return category;
    }
  }
  return 'Software';
}

function parseCSV(content) {
  const lines = content.trim().split('\n');

  return lines.slice(1).map(line => {
    // Handle quoted values
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    return {
      software_name: values[0] || '',
      description: values[1] || '',
    };
  }).filter(row => row.software_name);
}

function transformData(rows) {
  // Default renewal date: 1 year from now
  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  const renewalDateStr = renewalDate.toISOString().split('T')[0];

  return rows.map(row => ({
    software_name: row.software_name,
    vendor_name: getVendor(row.software_name),
    category: getCategory(row.software_name),
    product_description: row.description,
    total_annual_cost: 10000, // Default placeholder
    total_licenses: 50,       // Default placeholder
    active_users: 40,         // Default placeholder
    license_type: 'per_user',
    renewal_date: renewalDateStr,
  }));
}

function main() {
  const csvPath = path.join(__dirname, 'biorad_software_final_processed.csv');
  const outputPath = path.join(__dirname, 'biorad_software_import_ready.json');

  console.log('Reading CSV file...');
  const content = fs.readFileSync(csvPath, 'utf-8');

  console.log('Parsing CSV...');
  const rows = parseCSV(content);
  console.log(`Found ${rows.length} software entries`);

  console.log('Transforming data...');
  const importData = transformData(rows);

  // Write to JSON for review
  fs.writeFileSync(outputPath, JSON.stringify(importData, null, 2));
  console.log(`\nData prepared and saved to: ${outputPath}`);

  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Total entries: ${importData.length}`);
  console.log('\nCategories found:');
  const categories = [...new Set(importData.map(d => d.category))];
  categories.forEach(cat => {
    const count = importData.filter(d => d.category === cat).length;
    console.log(`  - ${cat}: ${count}`);
  });

  console.log('\nVendors found:');
  const vendors = [...new Set(importData.map(d => d.vendor_name))];
  vendors.slice(0, 10).forEach(v => console.log(`  - ${v}`));
  if (vendors.length > 10) {
    console.log(`  ... and ${vendors.length - 10} more`);
  }

  console.log('\n=== Sample Entries ===');
  importData.slice(0, 3).forEach((entry, i) => {
    console.log(`\n${i + 1}. ${entry.software_name}`);
    console.log(`   Vendor: ${entry.vendor_name}`);
    console.log(`   Category: ${entry.category}`);
    console.log(`   Description: ${entry.product_description.substring(0, 80)}...`);
  });

  return importData;
}

main();
