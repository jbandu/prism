# PRISM API Documentation

Complete API reference for the PRISM software asset management platform.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API routes (except `/api/auth/*`) require authentication using NextAuth session cookies.

### Login
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Logout
```http
POST /api/auth/signout
```

## Companies

### List All Companies (Admin Only)
```http
GET /api/companies
Authorization: Required (Admin role)

Response:
{
  "success": true,
  "data": [
    {
      "company_id": "uuid",
      "company_name": "Acme Corp",
      "industry": "Technology",
      "employee_count": 500,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Company (Admin Only)
```http
POST /api/companies
Authorization: Required (Admin role)
Content-Type: application/json

{
  "company_name": "New Company",
  "industry": "Finance",
  "employee_count": 250
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Company created successfully"
}
```

### Get Company by ID
```http
GET /api/companies/{id}
Authorization: Required (Admin or Company Member)

Response:
{
  "success": true,
  "data": {
    "company_id": "uuid",
    "company_name": "Acme Corp",
    "industry": "Technology",
    "employee_count": 500
  }
}
```

### Update Company (Admin Only)
```http
PUT /api/companies/{id}
Authorization: Required (Admin role)
Content-Type: application/json

{
  "company_name": "Updated Name",
  "employee_count": 600
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Company updated successfully"
}
```

### Delete Company (Admin Only)
```http
DELETE /api/companies/{id}
Authorization: Required (Admin role)

Response:
{
  "success": true,
  "message": "Company deleted successfully"
}
```

### Get Company Dashboard Metrics
```http
GET /api/companies/{id}/dashboard
Authorization: Required (Admin or Company Member)

Response:
{
  "success": true,
  "data": {
    "company_id": "uuid",
    "company_name": "Acme Corp",
    "total_software_count": 45,
    "total_annual_spend": 320000,
    "total_waste": 48000,
    "total_potential_savings": 64000,
    "average_utilization": 73.5,
    "underutilized_count": 12,
    "renewals_next_30_days": 3,
    "high_risk_contracts": 2,
    "top_cost_drivers": [
      {
        "software_name": "Salesforce",
        "annual_cost": 120000
      }
    ],
    "recent_analyses": [ ... ],
    "upcoming_renewals": [ ... ]
  }
}
```

## Software

### List Software
```http
GET /api/software?companyId={uuid}&category={category}&search={query}
Authorization: Required (Admin or Company Member)

Query Parameters:
- companyId (required): Company UUID
- category (optional): Filter by software category
- search (optional): Search in software/vendor name
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 20, max: 100)

Response:
{
  "success": true,
  "data": [
    {
      "software_id": "uuid",
      "company_id": "uuid",
      "software_name": "Salesforce",
      "vendor_name": "Salesforce Inc",
      "category": "CRM",
      "total_annual_cost": 120000,
      "total_licenses": 100,
      "active_users": 75,
      "utilization_rate": 75,
      "license_type": "per_user",
      "renewal_date": "2025-06-30T00:00:00Z",
      "contract_status": "active"
    }
  ]
}
```

### Create Software
```http
POST /api/software
Authorization: Required (Admin or Company Manager)
Content-Type: application/json

{
  "company_id": "uuid",
  "software_name": "Slack",
  "vendor_name": "Slack Technologies",
  "category": "Communication",
  "total_annual_cost": 24000,
  "total_licenses": 200,
  "active_users": 180,
  "license_type": "per_user",
  "renewal_date": "2025-12-31T00:00:00Z"
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Software added successfully"
}
```

### Get Software by ID
```http
GET /api/software/{id}
Authorization: Required (Admin or Company Member)

Response:
{
  "success": true,
  "data": {
    "software_id": "uuid",
    "software_name": "Salesforce",
    ...
  }
}
```

### Update Software
```http
PUT /api/software/{id}
Authorization: Required (Admin or Company Manager)
Content-Type: application/json

{
  "total_licenses": 90,
  "active_users": 75,
  "contract_status": "active"
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Software updated successfully"
}
```

### Delete Software
```http
DELETE /api/software/{id}
Authorization: Required (Admin or Company Manager)

Response:
{
  "success": true,
  "message": "Software deleted successfully"
}
```

## Agents

### Trigger AI Analysis
```http
POST /api/agents/analyze
Authorization: Required (Admin or Company Manager)
Content-Type: application/json

{
  "company_id": "uuid",
  "analysis_type": "cost_optimization",
  "software_id": "uuid" // optional, required for some analysis types
}

Analysis Types:
- "cost_optimization": License optimization and cost reduction
- "alternative_discovery": Find cheaper alternatives
- "vendor_intelligence": Vendor risk and market analysis
- "full_portfolio": Comprehensive portfolio review

Response:
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "company_id": "uuid",
    "analysis_type": "cost_optimization",
    "analysis_data": {
      "license_optimization": { ... },
      "tier_optimization": { ... },
      "total_savings": { ... },
      "recommendations": [ ... ]
    },
    "confidence_score": 0.85,
    "status": "completed"
  },
  "message": "Analysis completed successfully"
}
```

## Reports

### List Reports
```http
GET /api/reports?companyId={uuid}
Authorization: Required (Admin or Company Member)

Query Parameters:
- companyId (required): Company UUID

Response:
{
  "success": true,
  "data": [
    {
      "report_id": "uuid",
      "company_id": "uuid",
      "report_type": "executive_summary",
      "generated_at": "2024-01-15T00:00:00Z",
      "total_savings_identified": 64000,
      "action_items_count": 8
    }
  ]
}
```

### Generate Report
```http
POST /api/reports
Authorization: Required (Admin or Company Member)
Content-Type: application/json

{
  "company_id": "uuid",
  "report_type": "executive_summary",
  "period_start": "2024-01-01T00:00:00Z",
  "period_end": "2024-03-31T00:00:00Z"
}

Report Types:
- "executive_summary": High-level overview for executives
- "detailed_analysis": In-depth software portfolio analysis
- "quarterly_review": Quarterly performance review

Response:
{
  "success": true,
  "data": {
    "report_id": "uuid",
    "report_data": {
      "executive_summary": "...",
      "key_findings": [ ... ],
      "action_items": [ ... ]
    }
  },
  "message": "Report generated successfully"
}
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Status Codes

- `200 OK`: Successful GET/PUT/DELETE request
- `201 Created`: Successful POST request
- `400 Bad Request`: Validation error or missing parameters
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but lacking permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Data Types

### License Types
- `per_user`: Per-user licensing
- `per_device`: Per-device licensing
- `site_license`: Site-wide license
- `consumption_based`: Usage-based pricing

### Contract Status
- `active`: Active contract
- `expiring_soon`: Expiring within 90 days
- `expired`: Contract has expired
- `renewed`: Recently renewed

### User Roles
- `admin`: Full system access
- `company_manager`: Can manage own company
- `viewer`: Read-only access

## Rate Limiting

Agent analysis endpoints are rate-limited to prevent abuse:
- 10 requests per minute per user
- 100 requests per hour per company

## Examples

### cURL Examples

**Create Software:**
```bash
curl -X POST http://localhost:3000/api/software \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "123e4567-e89b-12d3-a456-426614174000",
    "software_name": "Slack",
    "vendor_name": "Slack Technologies",
    "category": "Communication",
    "total_annual_cost": 24000,
    "total_licenses": 200,
    "active_users": 180,
    "license_type": "per_user",
    "renewal_date": "2025-12-31T00:00:00Z"
  }'
```

**Trigger Cost Optimization:**
```bash
curl -X POST http://localhost:3000/api/agents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "123e4567-e89b-12d3-a456-426614174000",
    "analysis_type": "cost_optimization",
    "software_id": "123e4567-e89b-12d3-a456-426614174001"
  }'
```

## Testing

Use the provided examples with tools like:
- cURL (command line)
- Postman
- Insomnia
- Thunder Client (VS Code extension)

For testing, ensure you have:
1. Database connection configured in `.env.local`
2. NextAuth secret set
3. User account created in the database
4. Active session cookie from login
