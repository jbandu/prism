/**
 * PRISM Dashboard Sample Data
 * Realistic mock data for BioRad Laboratories demo
 */

export interface DashboardMetrics {
  totalSpend: number;
  activeSubscriptions: number;
  savingsIdentified: number;
  utilizationRate: number;
  renewalAlerts: number;
  complianceScore: number;
}

export interface Vendor {
  id: string;
  name: string;
  annualCost: number;
  monthlyAvg: number;
  renewalDays: number;
  renewalDate: string;
  health: "good" | "warning" | "critical";
  utilization: number;
  savingsOpportunity: number;
  contracts: number;
  category: string;
}

export interface SoftwareTool {
  id: string;
  name: string;
  vendor: string;
  category: string;
  users: number;
  licenses: number;
  costPerUser: number;
  monthlyCost: number;
  annualCost: number;
  utilization: number;
  department: string;
  renewalDate: string;
  contractLength: number;
}

// BioRad Laboratories - Company Data
export const COMPANY_INFO = {
  name: "BioRad Laboratories",
  industry: "Life Sciences & Biotechnology",
  employees: 8500,
  locations: 45,
  revenue: 2800000000, // $2.8B
  softwareBudget: 12400000, // $12.4M
  color: "#68BC00", // BioRad Green
};

// Executive Dashboard Metrics
export const EXECUTIVE_METRICS: DashboardMetrics = {
  totalSpend: 12400000,
  activeSubscriptions: 127,
  savingsIdentified: 524000,
  utilizationRate: 67,
  renewalAlerts: 23,
  complianceScore: 94,
};

// Top Vendors
export const TOP_VENDORS: Vendor[] = [
  {
    id: "sfdc",
    name: "Salesforce",
    category: "CRM",
    annualCost: 2100000,
    monthlyAvg: 175000,
    renewalDays: 45,
    renewalDate: "2025-12-30",
    health: "warning",
    utilization: 67,
    savingsOpportunity: 245000,
    contracts: 3,
  },
  {
    id: "msft",
    name: "Microsoft 365",
    category: "Productivity",
    annualCost: 1800000,
    monthlyAvg: 150000,
    renewalDays: 240,
    renewalDate: "2026-08-15",
    health: "good",
    utilization: 95,
    savingsOpportunity: 0,
    contracts: 2,
  },
  {
    id: "aws",
    name: "AWS",
    category: "Cloud Infrastructure",
    annualCost: 1500000,
    monthlyAvg: 125000,
    renewalDays: 30,
    renewalDate: "2025-12-15",
    health: "warning",
    utilization: 73,
    savingsOpportunity: 510000,
    contracts: 5,
  },
  {
    id: "snow",
    name: "ServiceNow",
    category: "ITSM",
    annualCost: 980000,
    monthlyAvg: 81667,
    renewalDays: 120,
    renewalDate: "2026-03-25",
    health: "good",
    utilization: 88,
    savingsOpportunity: 0,
    contracts: 2,
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    annualCost: 720000,
    monthlyAvg: 60000,
    renewalDays: 180,
    renewalDate: "2026-06-13",
    health: "critical",
    utilization: 78,
    savingsOpportunity: 720000,
    contracts: 1,
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Communication",
    annualCost: 650000,
    monthlyAvg: 54167,
    renewalDays: 90,
    renewalDate: "2026-02-22",
    health: "good",
    utilization: 92,
    savingsOpportunity: 0,
    contracts: 1,
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    category: "Design",
    annualCost: 540000,
    monthlyAvg: 45000,
    renewalDays: 60,
    renewalDate: "2026-01-14",
    health: "critical",
    utilization: 45,
    savingsOpportunity: 232000,
    contracts: 1,
  },
  {
    id: "atlassian",
    name: "Atlassian Suite",
    category: "DevOps",
    annualCost: 480000,
    monthlyAvg: 40000,
    renewalDays: 150,
    renewalDate: "2026-05-04",
    health: "good",
    utilization: 85,
    savingsOpportunity: 0,
    contracts: 4,
  },
];

// Software Tools
export const SOFTWARE_TOOLS: SoftwareTool[] = [
  {
    id: "sfdc-sales",
    name: "Salesforce Sales Cloud",
    vendor: "Salesforce",
    category: "CRM",
    users: 850,
    licenses: 920,
    costPerUser: 1500,
    monthlyCost: 115000,
    annualCost: 1380000,
    utilization: 92,
    department: "Sales",
    renewalDate: "2025-12-30",
    contractLength: 36,
  },
  {
    id: "sfdc-service",
    name: "Salesforce Service Cloud",
    vendor: "Salesforce",
    category: "Customer Service",
    users: 320,
    licenses: 380,
    costPerUser: 1200,
    monthlyCost: 38000,
    annualCost: 456000,
    utilization: 84,
    department: "Customer Support",
    renewalDate: "2025-12-30",
    contractLength: 36,
  },
  {
    id: "m365",
    name: "Microsoft 365 E5",
    vendor: "Microsoft",
    category: "Productivity",
    users: 8200,
    licenses: 8500,
    costPerUser: 57,
    monthlyCost: 150000,
    annualCost: 1800000,
    utilization: 96,
    department: "All",
    renewalDate: "2026-08-15",
    contractLength: 36,
  },
  {
    id: "aws-prod",
    name: "AWS Production",
    vendor: "AWS",
    category: "Cloud Infrastructure",
    users: 450,
    licenses: 450,
    costPerUser: 2778,
    monthlyCost: 125000,
    annualCost: 1500000,
    utilization: 73,
    department: "Engineering",
    renewalDate: "2025-12-15",
    contractLength: 12,
  },
  {
    id: "servicenow",
    name: "ServiceNow ITSM",
    vendor: "ServiceNow",
    category: "IT Service Management",
    users: 480,
    licenses: 550,
    costPerUser: 1483,
    monthlyCost: 81667,
    annualCost: 980000,
    utilization: 87,
    department: "IT",
    renewalDate: "2026-03-25",
    contractLength: 36,
  },
  {
    id: "slack-ent",
    name: "Slack Enterprise Grid",
    vendor: "Slack",
    category: "Communication",
    users: 6800,
    licenses: 8500,
    costPerUser: 85,
    monthlyCost: 60000,
    annualCost: 720000,
    utilization: 80,
    department: "All",
    renewalDate: "2026-06-13",
    contractLength: 24,
  },
];

// Spend by Category
export const SPEND_BY_CATEGORY = [
  { category: "CRM & Sales", amount: 2890000, percentage: 23.3, count: 8 },
  { category: "Cloud Infrastructure", amount: 2420000, percentage: 19.5, count: 12 },
  { category: "Productivity", amount: 1980000, percentage: 16.0, count: 6 },
  { category: "DevOps & Engineering", amount: 1560000, percentage: 12.6, count: 15 },
  { category: "HR & Finance", amount: 1230000, percentage: 9.9, count: 7 },
  { category: "Marketing", amount: 1100000, percentage: 8.9, count: 9 },
  { category: "Security & Compliance", amount: 820000, percentage: 6.6, count: 5 },
  { category: "Analytics & BI", amount: 400000, percentage: 3.2, count: 4 },
];

// Spend by Department
export const SPEND_BY_DEPARTMENT = [
  { department: "Engineering", amount: 3800000, percentage: 30.6, employees: 2100 },
  { department: "Sales", amount: 2900000, percentage: 23.4, employees: 1800 },
  { department: "IT/Operations", amount: 2200000, percentage: 17.7, employees: 520 },
  { department: "Marketing", amount: 1600000, percentage: 12.9, employees: 450 },
  { department: "HR", amount: 980000, percentage: 7.9, employees: 280 },
  { department: "Finance", amount: 920000, percentage: 7.4, employees: 320 },
];

// Historical Spend Trend (12 months)
export const SPEND_TREND = [
  { month: "Jan", actual: 1050000, projected: 1050000, optimized: 1050000, budget: 1000000 },
  { month: "Feb", actual: 1080000, projected: 1080000, optimized: 1050000, budget: 1000000 },
  { month: "Mar", actual: 1120000, projected: 1100000, optimized: 1040000, budget: 1000000 },
  { month: "Apr", actual: 1090000, projected: 1110000, optimized: 1030000, budget: 1000000 },
  { month: "May", actual: 1150000, projected: 1130000, optimized: 1020000, budget: 1000000 },
  { month: "Jun", actual: 1100000, projected: 1140000, optimized: 1010000, budget: 1000000 },
  { month: "Jul", actual: 1060000, projected: 1150000, optimized: 1000000, budget: 1000000 },
  { month: "Aug", actual: 1040000, projected: 1160000, optimized: 990000, budget: 1000000 },
  { month: "Sep", actual: 1020000, projected: 1170000, optimized: 980000, budget: 1000000 },
  { month: "Oct", actual: null, projected: 1180000, optimized: 970000, budget: 1000000 },
  { month: "Nov", actual: null, projected: 1190000, optimized: 960000, budget: 1000000 },
  { month: "Dec", actual: null, projected: 1200000, optimized: 950000, budget: 1000000 },
];

// Savings Opportunities
export const SAVINGS_OPPORTUNITIES = [
  {
    id: "1",
    title: "Consolidate Communication Tools",
    description: "Migrate from Slack to Microsoft Teams (included in M365)",
    annualSavings: 720000,
    effort: "medium" as const,
    priority: "high" as const,
    category: "Consolidation",
    daysToImplement: 90,
  },
  {
    id: "2",
    title: "Right-Size AWS Infrastructure",
    description: "Optimize EC2 instances and move to reserved instances",
    annualSavings: 510000,
    effort: "high" as const,
    priority: "high" as const,
    category: "Optimization",
    daysToImplement: 120,
  },
  {
    id: "3",
    title: "Optimize Salesforce Licenses",
    description: "Remove 23% unused licenses and negotiate volume discount",
    annualSavings: 245000,
    effort: "low" as const,
    priority: "critical" as const,
    category: "License Optimization",
    daysToImplement: 30,
  },
  {
    id: "4",
    title: "Reclaim Adobe Licenses",
    description: "Reduce from 280 to 156 active users",
    annualSavings: 232000,
    effort: "low" as const,
    priority: "high" as const,
    category: "License Optimization",
    daysToImplement: 15,
  },
];

// Mock API Functions
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return EXECUTIVE_METRICS;
}

export async function fetchVendors(): Promise<Vendor[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return TOP_VENDORS;
}

export async function fetchSoftwareTools(): Promise<SoftwareTool[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return SOFTWARE_TOOLS;
}

export async function fetchSpendTrend(): Promise<typeof SPEND_TREND> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return SPEND_TREND;
}

export async function fetchSavingsOpportunities(): Promise<typeof SAVINGS_OPPORTUNITIES> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return SAVINGS_OPPORTUNITIES;
}
