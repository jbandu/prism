import { z } from "zod";

// Company validation schemas
export const createCompanySchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(2, "Industry must be specified"),
  employee_count: z.number().int().positive("Employee count must be positive"),
});

export const updateCompanySchema = z.object({
  company_name: z.string().min(2).optional(),
  industry: z.string().min(2).optional(),
  employee_count: z.number().int().positive().optional(),
});

// Software validation schemas
export const createSoftwareSchema = z.object({
  company_id: z.string().uuid("Invalid company ID"),
  software_name: z.string().min(2, "Software name must be at least 2 characters"),
  vendor_name: z.string().min(2, "Vendor name must be specified"),
  category: z.string().min(2, "Category must be specified"),
  total_annual_cost: z.number().positive("Annual cost must be positive"),
  total_licenses: z.number().int().nonnegative("Licenses must be non-negative"),
  active_users: z.number().int().nonnegative("Active users must be non-negative"),
  license_type: z.enum(["per_user", "per_device", "site_license", "consumption_based"]),
  renewal_date: z.string().datetime("Invalid renewal date"),
});

export const updateSoftwareSchema = z.object({
  software_name: z.string().min(2).optional(),
  vendor_name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  total_annual_cost: z.number().positive().optional(),
  total_licenses: z.number().int().nonnegative().optional(),
  active_users: z.number().int().nonnegative().optional(),
  license_type: z.enum(["per_user", "per_device", "site_license", "consumption_based"]).optional(),
  renewal_date: z.string().datetime().optional(),
  contract_status: z.enum(["active", "expiring_soon", "expired", "renewed"]).optional(),
});

// Agent analysis validation schema
export const analyzeRequestSchema = z.object({
  company_id: z.string().uuid("Invalid company ID"),
  analysis_type: z.enum([
    "cost_optimization",
    "alternative_discovery",
    "vendor_intelligence",
    "full_portfolio",
  ]),
  software_id: z.string().uuid("Invalid software ID").optional(),
});

// Report generation validation schema
export const createReportSchema = z.object({
  company_id: z.string().uuid("Invalid company ID"),
  report_type: z.enum(["executive_summary", "detailed_analysis", "quarterly_review"]),
  period_start: z.string().datetime("Invalid start date"),
  period_end: z.string().datetime("Invalid end date"),
});

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["admin", "company_manager", "viewer"]),
  company_id: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const softwareQuerySchema = paginationSchema.extend({
  companyId: z.string().uuid("Invalid company ID"),
  category: z.string().optional(),
  search: z.string().optional(),
});
