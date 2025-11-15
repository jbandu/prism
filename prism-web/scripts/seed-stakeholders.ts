// Script to seed test people and stakeholders
import { sql } from '../lib/db';

interface Person {
  full_name: string;
  email: string;
  title: string;
  department: string;
  level: string;
  decision_authority: string;
}

interface StakeholderRole {
  role_type: string;
  decision_weight: number;
}

async function seedStakeholders() {
  console.log('🌱 Starting stakeholder seeding...');

  // First, get the company_id
  const companyResult = await sql`SELECT id FROM companies LIMIT 1`;
  const companyId = companyResult[0]?.id;

  if (!companyId) {
    console.error('❌ No company found. Please create a company first.');
    return;
  }

  console.log(`✅ Using company ID: ${companyId}`);

  // Define diverse test people
  const people: Person[] = [
    // C-Level Executives
    { full_name: 'Sarah Chen', email: 'sarah.chen@company.com', title: 'Chief Executive Officer', department: 'Executive', level: 'C-Level', decision_authority: 'final' },
    { full_name: 'Marcus Rodriguez', email: 'marcus.rodriguez@company.com', title: 'Chief Technology Officer', department: 'Engineering', level: 'C-Level', decision_authority: 'final' },
    { full_name: 'Jennifer Park', email: 'jennifer.park@company.com', title: 'Chief Financial Officer', department: 'Finance', level: 'C-Level', decision_authority: 'final' },
    { full_name: 'David Thompson', email: 'david.thompson@company.com', title: 'Chief Operating Officer', department: 'Operations', level: 'C-Level', decision_authority: 'final' },
    { full_name: 'Lisa Wong', email: 'lisa.wong@company.com', title: 'Chief Marketing Officer', department: 'Marketing', level: 'C-Level', decision_authority: 'final' },

    // VPs
    { full_name: 'Robert Mitchell', email: 'robert.mitchell@company.com', title: 'VP of Engineering', department: 'Engineering', level: 'VP', decision_authority: 'high' },
    { full_name: 'Amanda Foster', email: 'amanda.foster@company.com', title: 'VP of Sales', department: 'Sales', level: 'VP', decision_authority: 'high' },
    { full_name: 'Kevin Patel', email: 'kevin.patel@company.com', title: 'VP of Product', department: 'Product', level: 'VP', decision_authority: 'high' },
    { full_name: 'Maria Garcia', email: 'maria.garcia@company.com', title: 'VP of Customer Success', department: 'Customer Success', level: 'VP', decision_authority: 'high' },
    { full_name: 'James Wilson', email: 'james.wilson@company.com', title: 'VP of IT', department: 'IT', level: 'VP', decision_authority: 'high' },

    // Directors
    { full_name: 'Emily Anderson', email: 'emily.anderson@company.com', title: 'Director of Engineering', department: 'Engineering', level: 'Director', decision_authority: 'medium' },
    { full_name: 'Michael Brown', email: 'michael.brown@company.com', title: 'Director of Finance', department: 'Finance', level: 'Director', decision_authority: 'medium' },
    { full_name: 'Rachel Green', email: 'rachel.green@company.com', title: 'Director of HR', department: 'HR', level: 'Director', decision_authority: 'medium' },
    { full_name: 'Thomas Lee', email: 'thomas.lee@company.com', title: 'Director of Marketing', department: 'Marketing', level: 'Director', decision_authority: 'medium' },
    { full_name: 'Jessica Taylor', email: 'jessica.taylor@company.com', title: 'Director of Sales Operations', department: 'Sales', level: 'Director', decision_authority: 'medium' },
    { full_name: 'Daniel Kim', email: 'daniel.kim@company.com', title: 'Director of Security', department: 'IT', level: 'Director', decision_authority: 'high' },
    { full_name: 'Michelle Santos', email: 'michelle.santos@company.com', title: 'Director of Legal', department: 'Legal', level: 'Director', decision_authority: 'high' },

    // Managers
    { full_name: 'Christopher Davis', email: 'christopher.davis@company.com', title: 'Engineering Manager', department: 'Engineering', level: 'Manager', decision_authority: 'low' },
    { full_name: 'Nicole Martinez', email: 'nicole.martinez@company.com', title: 'Product Manager', department: 'Product', level: 'Manager', decision_authority: 'low' },
    { full_name: 'Andrew Johnson', email: 'andrew.johnson@company.com', title: 'Finance Manager', department: 'Finance', level: 'Manager', decision_authority: 'low' },
    { full_name: 'Sophia White', email: 'sophia.white@company.com', title: 'Marketing Manager', department: 'Marketing', level: 'Manager', decision_authority: 'low' },
    { full_name: 'Brandon Clark', email: 'brandon.clark@company.com', title: 'IT Manager', department: 'IT', level: 'Manager', decision_authority: 'low' },
    { full_name: 'Olivia Robinson', email: 'olivia.robinson@company.com', title: 'Sales Manager', department: 'Sales', level: 'Manager', decision_authority: 'low' },
    { full_name: 'Ryan Adams', email: 'ryan.adams@company.com', title: 'Procurement Manager', department: 'Operations', level: 'Manager', decision_authority: 'medium' },

    // Senior Staff
    { full_name: 'Lauren Scott', email: 'lauren.scott@company.com', title: 'Senior Software Engineer', department: 'Engineering', level: 'Senior', decision_authority: 'low' },
    { full_name: 'Jason Turner', email: 'jason.turner@company.com', title: 'Senior Product Designer', department: 'Product', level: 'Senior', decision_authority: 'low' },
    { full_name: 'Melissa Harris', email: 'melissa.harris@company.com', title: 'Senior Financial Analyst', department: 'Finance', level: 'Senior', decision_authority: 'low' },
    { full_name: 'Eric Lopez', email: 'eric.lopez@company.com', title: 'Senior IT Administrator', department: 'IT', level: 'Senior', decision_authority: 'low' },
    { full_name: 'Ashley Moore', email: 'ashley.moore@company.com', title: 'Senior Marketing Specialist', department: 'Marketing', level: 'Senior', decision_authority: 'low' },

    // Junior/Regular Staff
    { full_name: 'Tyler Bennett', email: 'tyler.bennett@company.com', title: 'Software Engineer', department: 'Engineering', level: 'Junior', decision_authority: 'none' },
    { full_name: 'Hannah Cooper', email: 'hannah.cooper@company.com', title: 'Customer Success Specialist', department: 'Customer Success', level: 'Junior', decision_authority: 'none' },
    { full_name: 'Jordan Reed', email: 'jordan.reed@company.com', title: 'Sales Representative', department: 'Sales', level: 'Junior', decision_authority: 'none' },
    { full_name: 'Samantha Bell', email: 'samantha.bell@company.com', title: 'HR Coordinator', department: 'HR', level: 'Junior', decision_authority: 'none' },
    { full_name: 'Nathan Gray', email: 'nathan.gray@company.com', title: 'Marketing Coordinator', department: 'Marketing', level: 'Junior', decision_authority: 'none' },
  ];

  console.log(`📝 Creating ${people.length} test people...`);

  // Insert people
  const insertedPeople: any[] = [];
  for (const person of people) {
    const result = await sql`
      INSERT INTO people (
        full_name, email, title, department, level,
        decision_authority, company_id, is_active
      )
      VALUES (
        ${person.full_name}, ${person.email}, ${person.title},
        ${person.department}, ${person.level}, ${person.decision_authority},
        ${companyId}, true
      )
      RETURNING id, full_name, title, department, level
    `;
    insertedPeople.push(result[0]);
    console.log(`  ✅ Created: ${result[0].full_name} - ${result[0].title}`);
  }

  console.log(`\n✅ Created ${insertedPeople.length} people\n`);

  // Get all software
  const software = await sql`SELECT id, software_name FROM software`;
  console.log(`📦 Found ${software.length} software applications\n`);

  // Define stakeholder assignment strategy
  const roleAssignments = [
    { role_type: 'executive_sponsor', peopleFilter: (p: any) => ['C-Level'].includes(p.level) },
    { role_type: 'business_owner', peopleFilter: (p: any) => ['VP', 'Director'].includes(p.level) && ['Product', 'Operations', 'Sales'].includes(p.department) },
    { role_type: 'it_owner', peopleFilter: (p: any) => ['VP', 'Director', 'Manager'].includes(p.level) && ['IT', 'Engineering'].includes(p.department) },
    { role_type: 'procurement_lead', peopleFilter: (p: any) => p.title.toLowerCase().includes('procurement') || (['Director', 'Manager'].includes(p.level) && p.department === 'Operations') },
    { role_type: 'finance_approver', peopleFilter: (p: any) => p.department === 'Finance' && ['C-Level', 'VP', 'Director'].includes(p.level) },
    { role_type: 'security_reviewer', peopleFilter: (p: any) => p.title.toLowerCase().includes('security') || (p.department === 'IT' && ['Director'].includes(p.level)) },
    { role_type: 'administrator', peopleFilter: (p: any) => p.department === 'IT' && ['Manager', 'Senior'].includes(p.level) },
    { role_type: 'champion', peopleFilter: (p: any) => ['Senior'].includes(p.level) && !['HR', 'Legal', 'Finance'].includes(p.department) },
    { role_type: 'end_user', peopleFilter: (p: any) => ['Junior'].includes(p.level) },
  ];

  console.log('🔗 Assigning stakeholders to software...\n');

  let totalAssignments = 0;

  // For each software, assign 3-6 stakeholders with different roles
  for (const sw of software) {
    const numStakeholders = Math.floor(Math.random() * 4) + 3; // 3-6 stakeholders per software
    const assignedRoles: string[] = [];

    console.log(`  📦 ${sw.software_name}:`);

    for (let i = 0; i < numStakeholders && assignedRoles.length < roleAssignments.length; i++) {
      // Pick a random role that hasn't been assigned yet
      const availableRoles = roleAssignments.filter(r => !assignedRoles.includes(r.role_type));
      if (availableRoles.length === 0) break;

      const roleAssignment = availableRoles[Math.floor(Math.random() * availableRoles.length)];
      const eligiblePeople = insertedPeople.filter(roleAssignment.peopleFilter);

      if (eligiblePeople.length === 0) continue;

      // Pick a random eligible person
      const person = eligiblePeople[Math.floor(Math.random() * eligiblePeople.length)];

      // Get the default weight for this role
      const roleInfo = await sql`
        SELECT default_decision_weight
        FROM role_definitions
        WHERE role_type = ${roleAssignment.role_type}
      `;

      const decisionWeight = roleInfo[0]?.default_decision_weight || 50;

      // Create the stakeholder assignment
      try {
        await sql`
          INSERT INTO software_stakeholders (
            software_asset_id, person_id, role_type,
            role_level, decision_weight, engagement_frequency
          )
          VALUES (
            ${sw.id}, ${person.id}, ${roleAssignment.role_type},
            ${person.level}, ${decisionWeight}, 'weekly'
          )
          ON CONFLICT (software_asset_id, person_id, role_type) DO NOTHING
        `;

        console.log(`     → ${person.full_name} as ${roleAssignment.role_type}`);
        assignedRoles.push(roleAssignment.role_type);
        totalAssignments++;
      } catch (error) {
        // Skip if duplicate
      }
    }
  }

  console.log(`\n✅ Created ${totalAssignments} stakeholder assignments across ${software.length} software applications`);
  console.log(`\n🎉 Stakeholder seeding complete!\n`);
}

seedStakeholders()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
