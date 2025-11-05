# PRISM Database Schema Documentation

**Generated:** 2025-11-05T00:28:25.645Z
**Source:** Neon Database (Actual Deployed Schema)

---

## Table of Contents

- [neon_auth.users_sync](#neon_authusers_sync)
- [public.activity_log](#publicactivity_log)
- [public.ai_agent_analyses](#publicai_agent_analyses)
- [public.alternative_solutions](#publicalternative_solutions)
- [public.brand_logos](#publicbrand_logos)
- [public.client_reports](#publicclient_reports)
- [public.companies](#publiccompanies)
- [public.company_metrics](#publiccompany_metrics)
- [public.company_users](#publiccompany_users)
- [public.consolidation_recommendations](#publicconsolidation_recommendations)
- [public.contacts](#publiccontacts)
- [public.contracts](#publiccontracts)
- [public.feature_analysis_cache](#publicfeature_analysis_cache)
- [public.feature_categories](#publicfeature_categories)
- [public.feature_comparison_matrix](#publicfeature_comparison_matrix)
- [public.feature_overlaps](#publicfeature_overlaps)
- [public.initiatives](#publicinitiatives)
- [public.integration_dependencies](#publicintegration_dependencies)
- [public.intelligence_notes](#publicintelligence_notes)
- [public.negotiation_market_data](#publicnegotiation_market_data)
- [public.negotiation_outcomes](#publicnegotiation_outcomes)
- [public.negotiation_playbooks](#publicnegotiation_playbooks)
- [public.opportunities](#publicopportunities)
- [public.pain_points](#publicpain_points)
- [public.prism_savings_log](#publicprism_savings_log)
- [public.renewal_negotiations](#publicrenewal_negotiations)
- [public.replacement_projects](#publicreplacement_projects)
- [public.software](#publicsoftware)
- [public.software_assets](#publicsoftware_assets)
- [public.software_catalog](#publicsoftware_catalog)
- [public.software_features](#publicsoftware_features)
- [public.software_features_mapping](#publicsoftware_features_mapping)
- [public.technologies](#publictechnologies)
- [public.usage_analytics](#publicusage_analytics)
- [public.users](#publicusers)
- [public.v_admin_overview](#publicv_admin_overview)
- [public.v_company_dashboard](#publicv_company_dashboard)
- [public.v_company_overview](#publicv_company_overview)
- [public.v_cost_optimization](#publicv_cost_optimization)
- [public.v_high_priority_pain_points](#publicv_high_priority_pain_points)
- [public.v_high_risk_vendors](#publicv_high_risk_vendors)
- [public.v_portfolio_overview](#publicv_portfolio_overview)
- [public.v_replacement_candidates](#publicv_replacement_candidates)
- [public.v_upcoming_renewals](#publicv_upcoming_renewals)
- [public.vendor_intelligence](#publicvendor_intelligence)
- [public.vendors](#publicvendors)
- [public.workflow_automations](#publicworkflow_automations)

---

## Tables

### neon_auth.users_sync

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| raw_json | jsonb | ✗ | - |  |
| id | text | ✗ | - | 🔑 PK |
| name | text | ✓ | - |  |
| email | text | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | - |  |
| updated_at | timestamp with time zone | ✓ | - |  |
| deleted_at | timestamp with time zone | ✓ | - |  |

### public.activity_log

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| company_id | uuid | ✓ | - |  |
| user_id | uuid | ✓ | - |  |
| action_type | character varying(100) | ✗ | - |  |
| action_description | text | ✓ | - |  |
| metadata | jsonb | ✓ | '{}'::jsonb |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.ai_agent_analyses

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| software_id | uuid | ✓ | - |  |
| agent_name | character varying(100) | ✗ | - |  |
| analysis_type | character varying(100) | ✗ | - |  |
| analysis_date | timestamp with time zone | ✓ | now() |  |
| raw_findings | text | ✗ | - |  |
| structured_findings | jsonb | ✓ | '{}'::jsonb |  |
| key_insights | ARRAY | ✓ | - |  |
| recommendations | ARRAY | ✓ | - |  |
| risk_flags | ARRAY | ✓ | - |  |
| opportunities | ARRAY | ✓ | - |  |
| confidence_score | numeric | ✓ | - |  |
| sources_cited | ARRAY | ✓ | - |  |
| requires_human_review | boolean | ✓ | true |  |
| suggested_actions | jsonb | ✓ | '[]'::jsonb |  |
| priority_level | character varying(20) | ✓ | - |  |
| reviewed_by | character varying(200) | ✓ | - |  |
| reviewed_at | timestamp with time zone | ✓ | - |  |
| review_status | character varying(50) | ✓ | 'pending'::character varying |  |
| human_notes | text | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| tokens_used | integer | ✓ | - |  |
| processing_time_seconds | numeric | ✓ | - |  |
| company_id | uuid | ✓ | - |  |

### public.alternative_solutions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| original_software_id | uuid | ✓ | - |  |
| alternative_name | character varying(200) | ✗ | - |  |
| alternative_vendor | character varying(200) | ✓ | - |  |
| alternative_type | character varying(50) | ✓ | - |  |
| alternative_url | text | ✓ | - |  |
| cost_comparison | numeric | ✓ | - |  |
| cost_savings_percentage | numeric | ✓ | - |  |
| feature_parity_score | numeric | ✓ | - |  |
| missing_critical_features | ARRAY | ✓ | - |  |
| additional_capabilities | ARRAY | ✓ | - |  |
| implementation_complexity | character varying(20) | ✓ | - |  |
| estimated_migration_time_weeks | integer | ✓ | - |  |
| estimated_migration_cost | numeric | ✓ | - |  |
| training_required | character varying(20) | ✓ | - |  |
| integration_compatibility_score | numeric | ✓ | - |  |
| api_quality | character varying(20) | ✓ | - |  |
| security_compliance | boolean | ✓ | false |  |
| regulatory_compliant | boolean | ✓ | false |  |
| replacement_risk_score | numeric | ✓ | - |  |
| rollback_difficulty | character varying(20) | ✓ | - |  |
| business_continuity_risk | character varying(20) | ✓ | - |  |
| recommendation_status | character varying(50) | ✓ | - |  |
| recommendation_reasoning | text | ✓ | - |  |
| pilot_feasibility | character varying(20) | ✓ | - |  |
| case_studies | ARRAY | ✓ | - |  |
| reference_customers | ARRAY | ✓ | - |  |
| proof_of_concept_completed | boolean | ✓ | false |  |
| poc_results_summary | text | ✓ | - |  |
| poc_date | date | ✓ | - |  |
| payback_period_months | integer | ✓ | - |  |
| three_year_total_savings | numeric | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |

### public.brand_logos

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| company_name | character varying(255) | ✗ | - |  |
| vendor_name | character varying(255) | ✓ | - |  |
| logo_url | text | ✗ | - |  |
| logo_type | character varying(20) | ✓ | 'external'::character varying |  |
| file_size | integer | ✓ | - |  |
| dimensions | character varying(20) | ✓ | - |  |
| last_verified | timestamp with time zone | ✓ | now() |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.client_reports

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| company_id | uuid | ✓ | - |  |
| report_type | character varying(100) | ✗ | - |  |
| report_title | character varying(300) | ✗ | - |  |
| report_content | text | ✗ | - |  |
| total_spend | numeric | ✓ | - |  |
| savings_identified | numeric | ✓ | - |  |
| software_analyzed | integer | ✓ | - |  |
| generated_at | timestamp with time zone | ✓ | now() |  |
| generated_by | uuid | ✓ | - |  |

### public.companies

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| company_name | character varying(200) | ✗ | - |  |
| industry | character varying(100) | ✓ | - |  |
| headquarters_location | character varying(200) | ✓ | - |  |
| employee_count | integer | ✓ | - |  |
| primary_contact_name | character varying(200) | ✓ | - |  |
| primary_contact_email | character varying(255) | ✓ | - |  |
| primary_contact_phone | character varying(50) | ✓ | - |  |
| primary_contact_title | character varying(100) | ✓ | - |  |
| contract_start_date | date | ✓ | - |  |
| contract_value | numeric | ✓ | - |  |
| contract_status | character varying(50) | ✓ | - |  |
| total_software_count | integer | ✓ | 0 |  |
| total_annual_software_spend | numeric | ✓ | 0 |  |
| total_savings_identified | numeric | ✓ | 0 |  |
| notes | text | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |
| created_by | uuid | ✓ | - |  |
| headquarters | character varying(200) | ✓ | - |  |
| country | character varying(100) | ✓ | - |  |
| description | text | ✓ | - |  |
| website | character varying(500) | ✓ | - |  |
| total_revenue | numeric | ✓ | - |  |
| net_profit | numeric | ✓ | - |  |
| founded_year | integer | ✓ | - |  |
| is_client | boolean | ✓ | true |  |
| slug | character varying(100) | ✓ | - |  |

### public.company_metrics

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| metric_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| metric_category | character varying(100) | ✗ | - |  |
| metric_name | character varying(200) | ✗ | - |  |
| metric_value | numeric | ✓ | - |  |
| unit | character varying(50) | ✓ | - |  |
| fiscal_year | integer | ✓ | - |  |
| target_value | numeric | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.company_users

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| company_id | uuid | ✓ | - |  |
| user_id | uuid | ✓ | - |  |
| role | character varying(50) | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.consolidation_recommendations

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| company_id | uuid | ✓ | - |  |
| recommendation_type | character varying(100) | ✗ | - |  |
| software_to_consolidate | ARRAY | ✗ | - |  |
| recommended_solution | character varying(255) | ✓ | - |  |
| annual_savings | numeric | ✓ | 0 |  |
| risk_level | character varying(50) | ✓ | - |  |
| rationale | text | ✓ | - |  |
| status | character varying(50) | ✓ | 'pending'::character varying |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.contacts

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| contact_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| first_name | character varying(100) | ✗ | - |  |
| last_name | character varying(100) | ✗ | - |  |
| title | character varying(200) | ✓ | - |  |
| department | character varying(100) | ✓ | - |  |
| email_pattern | character varying(255) | ✓ | - |  |
| phone | character varying(50) | ✓ | - |  |
| linkedin_url | character varying(500) | ✓ | - |  |
| is_decision_maker | boolean | ✓ | false |  |
| seniority_level | character varying(50) | ✓ | - |  |
| notes | text | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.contracts

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| contract_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| vendor_id | character varying(50) | ✓ | - |  |
| contract_name | character varying(300) | ✗ | - |  |
| contract_type | character varying(100) | ✓ | - |  |
| start_date | date | ✓ | - |  |
| end_date | date | ✓ | - |  |
| contract_value | numeric | ✓ | - |  |
| currency | character varying(10) | ✓ | - |  |
| status | character varying(50) | ✓ | - |  |
| description | text | ✓ | - |  |
| renewal_notice_days | integer | ✓ | - |  |
| auto_renew | boolean | ✓ | false |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.feature_analysis_cache

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| software_name | character varying(255) | ✗ | - |  |
| extracted_features | jsonb | ✓ | - |  |
| feature_count | integer | ✓ | - |  |
| analysis_date | timestamp with time zone | ✓ | now() |  |
| source | character varying(50) | ✓ | - |  |
| confidence_score | numeric | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.feature_categories

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| category_name | character varying(100) | ✗ | - |  |
| parent_category_id | uuid | ✓ | - |  |
| description | text | ✓ | - |  |
| icon | character varying(50) | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.feature_comparison_matrix

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| company_id | uuid | ✓ | - |  |
| software_id_1 | uuid | ✓ | - |  |
| software_id_2 | uuid | ✓ | - |  |
| overlap_percentage | numeric | ✗ | - |  |
| shared_features_count | integer | ✗ | - |  |
| total_features_compared | integer | ✗ | - |  |
| shared_features | jsonb | ✓ | - |  |
| cost_implication | numeric | ✓ | 0 |  |
| analysis_date | timestamp with time zone | ✓ | now() |  |

### public.feature_overlaps

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| company_id | uuid | ✓ | - |  |
| feature_category_id | uuid | ✓ | - |  |
| software_ids | ARRAY | ✓ | - |  |
| overlap_count | integer | ✓ | - |  |
| redundancy_cost | numeric | ✓ | - |  |
| consolidation_opportunity | text | ✓ | - |  |
| priority | character varying(20) | ✓ | 'medium'::character varying |  |
| status | character varying(20) | ✓ | 'active'::character varying |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |

### public.initiatives

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| initiative_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| initiative_name | character varying(300) | ✗ | - |  |
| category | character varying(100) | ✓ | - |  |
| status | character varying(50) | ✓ | - |  |
| start_date | date | ✓ | - |  |
| target_completion | date | ✓ | - |  |
| budget | numeric | ✓ | - |  |
| description | text | ✓ | - |  |
| owner_contact_id | character varying(50) | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.integration_dependencies

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| source_software_id | uuid | ✓ | - |  |
| target_software_id | uuid | ✓ | - |  |
| integration_name | character varying(200) | ✓ | - |  |
| integration_type | character varying(50) | ✓ | - |  |
| integration_method | character varying(100) | ✓ | - |  |
| data_flow_direction | character varying(20) | ✓ | - |  |
| business_criticality | character varying(20) | ✓ | - |  |
| data_volume | character varying(50) | ✓ | - |  |
| failure_impact | text | ✓ | - |  |
| api_stability | character varying(20) | ✓ | - |  |
| authentication_method | character varying(100) | ✓ | - |  |
| has_documentation | boolean | ✓ | false |  |
| custom_code_required | boolean | ✓ | false |  |
| custom_code_location | text | ✓ | - |  |
| replacement_blocker | boolean | ✓ | false |  |
| workaround_available | boolean | ✓ | false |  |
| workaround_description | text | ✓ | - |  |
| migration_complexity | character varying(20) | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |

### public.intelligence_notes

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| note_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| category | character varying(100) | ✓ | - |  |
| note_date | date | ✓ | - |  |
| source | character varying(200) | ✓ | - |  |
| content | text | ✗ | - |  |
| tags | ARRAY | ✓ | - |  |
| author_user_id | uuid | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.negotiation_market_data

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| software_name | character varying(255) | ✗ | - |  |
| vendor_name | character varying(255) | ✗ | - |  |
| average_price_per_user | numeric | ✓ | - |  |
| price_range_min | numeric | ✓ | - |  |
| price_range_max | numeric | ✓ | - |  |
| typical_discount_range | character varying(50) | ✓ | - |  |
| market_share_percentage | numeric | ✓ | - |  |
| competitor_list | jsonb | ✓ | - |  |
| recent_price_changes | jsonb | ✓ | - |  |
| seasonal_discount_periods | jsonb | ✓ | - |  |
| data_source | character varying(100) | ✓ | - |  |
| data_quality_score | integer | ✓ | - |  |
| last_updated | timestamp with time zone | ✓ | now() |  |
| next_update_due | timestamp with time zone | ✓ | - |  |

### public.negotiation_outcomes

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| playbook_id | uuid | ✓ | - |  |
| company_id | uuid | ✗ | - |  |
| software_id | uuid | ✗ | - |  |
| original_annual_cost | numeric | ✗ | - |  |
| negotiated_annual_cost | numeric | ✗ | - |  |
| annual_savings | numeric | ✗ | - |  |
| discount_achieved | integer | ✗ | - |  |
| negotiation_tactics_used | jsonb | ✓ | - |  |
| vendor_response | text | ✓ | - |  |
| final_terms | jsonb | ✓ | - |  |
| negotiation_duration_days | integer | ✓ | - |  |
| success_rating | integer | ✓ | - |  |
| notes | text | ✓ | - |  |
| achieved_at | timestamp with time zone | ✓ | now() |  |
| recorded_by | uuid | ✓ | - |  |
| new_renewal_date | date | ✓ | - |  |
| new_contract_length_years | integer | ✓ | - |  |
| new_payment_terms | character varying(100) | ✓ | - |  |

### public.negotiation_playbooks

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| software_id | uuid | ✗ | - |  |
| market_average_price | numeric | ✓ | - |  |
| market_discount_range_min | integer | ✓ | - |  |
| market_discount_range_max | integer | ✓ | - |  |
| competitor_alternatives | jsonb | ✓ | - |  |
| pricing_trends | text | ✓ | - |  |
| utilization_rate | numeric | ✓ | - |  |
| unused_licenses | integer | ✓ | - |  |
| contract_length_years | integer | ✓ | - |  |
| total_spent_to_date | numeric | ✓ | - |  |
| payment_history_score | integer | ✓ | - |  |
| recommended_target_discount | integer | ✓ | - |  |
| confidence_level | character varying(20) | ✓ | - |  |
| leverage_points | jsonb | ✓ | - |  |
| risks | jsonb | ✓ | - |  |
| talking_points | jsonb | ✓ | - |  |
| email_initial_outreach | text | ✓ | - |  |
| email_counter_offer | text | ✓ | - |  |
| email_final_push | text | ✓ | - |  |
| email_alternative_threat | text | ✓ | - |  |
| generated_at | timestamp with time zone | ✓ | now() |  |
| generated_by | uuid | ✓ | - |  |
| ai_model_version | character varying(50) | ✓ | - |  |
| status | character varying(50) | ✓ | 'draft'::character varying |  |
| negotiation_started_at | timestamp with time zone | ✓ | - |  |
| negotiation_completed_at | timestamp with time zone | ✓ | - |  |

### public.opportunities

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| opportunity_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| opportunity_name | character varying(300) | ✗ | - |  |
| category | character varying(100) | ✓ | - |  |
| priority | character varying(50) | ✓ | - |  |
| estimated_value | numeric | ✓ | - |  |
| probability | character varying(50) | ✓ | - |  |
| status | character varying(50) | ✓ | - |  |
| description | text | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.pain_points

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| pain_point_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| category | character varying(100) | ✓ | - |  |
| severity | character varying(50) | ✓ | - |  |
| description | text | ✗ | - |  |
| impact | text | ✓ | - |  |
| identified_date | date | ✓ | - |  |
| resolved_date | date | ✓ | - |  |
| resolution | text | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.prism_savings_log

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| software_id | uuid | ✓ | - |  |
| software_name | character varying(255) | ✗ | - |  |
| vendor_name | character varying(255) | ✗ | - |  |
| annual_savings | numeric | ✗ | - |  |
| savings_type | character varying(50) | ✗ | - |  |
| identified_by | character varying(50) | ✗ | 'prism'::character varying |  |
| description | text | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| created_by | uuid | ✓ | - |  |

### public.renewal_negotiations

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| software_id | uuid | ✓ | - |  |
| renewal_date | date | ✗ | - |  |
| current_annual_cost | numeric | ✓ | - |  |
| current_terms | text | ✓ | - |  |
| current_contract_length_years | integer | ✓ | - |  |
| negotiation_status | character varying(50) | ✓ | - |  |
| target_discount_percentage | numeric | ✓ | - |  |
| target_annual_cost | numeric | ✓ | - |  |
| usage_decline_evidence | text | ✓ | - |  |
| alternative_vendors | ARRAY | ✓ | - |  |
| competitive_pricing | text | ✓ | - |  |
| budget_constraints | text | ✓ | - |  |
| multi_year_commitment_option | boolean | ✓ | false |  |
| vendor_eagerness | character varying(20) | ✓ | - |  |
| vendor_quarter_end | date | ✓ | - |  |
| vendor_recent_losses | ARRAY | ✓ | - |  |
| vendor_pressure_points | ARRAY | ✓ | - |  |
| negotiation_notes | text | ✓ | - |  |
| offers_received | jsonb | ✓ | '[]'::jsonb |  |
| counteroffers_made | jsonb | ✓ | '[]'::jsonb |  |
| negotiation_started_date | date | ✓ | - |  |
| final_annual_cost | numeric | ✓ | - |  |
| savings_achieved | numeric | ✓ | - |  |
| savings_percentage | numeric | ✓ | - |  |
| new_contract_terms | text | ✓ | - |  |
| new_contract_length_years | integer | ✓ | - |  |
| negotiation_completed_date | date | ✓ | - |  |
| lead_negotiator | character varying(200) | ✓ | - |  |
| stakeholders | ARRAY | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |
| company_id | uuid | ✓ | - |  |

### public.replacement_projects

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| project_name | character varying(200) | ✗ | - |  |
| project_code | character varying(50) | ✗ | - |  |
| old_software_id | uuid | ✓ | - |  |
| new_solution_id | uuid | ✓ | - |  |
| project_status | character varying(50) | ✗ | - |  |
| start_date | date | ✓ | - |  |
| target_completion_date | date | ✓ | - |  |
| actual_completion_date | date | ✓ | - |  |
| total_projected_savings | numeric | ✓ | - |  |
| implementation_cost | numeric | ✓ | - |  |
| roi_months | integer | ✓ | - |  |
| annual_recurring_savings | numeric | ✓ | - |  |
| project_sponsor | character varying(200) | ✓ | - |  |
| project_manager | character varying(200) | ✓ | - |  |
| technical_lead | character varying(200) | ✓ | - |  |
| business_lead | character varying(200) | ✓ | - |  |
| team_members | ARRAY | ✓ | - |  |
| discovery_complete | boolean | ✓ | false |  |
| discovery_completion_date | date | ✓ | - |  |
| pilot_complete | boolean | ✓ | false |  |
| pilot_completion_date | date | ✓ | - |  |
| migration_plan_approved | boolean | ✓ | false |  |
| migration_plan_approval_date | date | ✓ | - |  |
| user_training_complete | boolean | ✓ | false |  |
| user_training_completion_date | date | ✓ | - |  |
| go_live_complete | boolean | ✓ | false |  |
| go_live_date | date | ✓ | - |  |
| current_risks | ARRAY | ✓ | - |  |
| current_issues | ARRAY | ✓ | - |  |
| mitigation_plans | text | ✓ | - |  |
| risk_level | character varying(20) | ✓ | - |  |
| user_adoption_rate | numeric | ✓ | - |  |
| performance_vs_baseline | text | ✓ | - |  |
| user_satisfaction_score | numeric | ✓ | - |  |
| issue_count | integer | ✓ | - |  |
| critical_issue_count | integer | ✓ | - |  |
| what_went_well | text | ✓ | - |  |
| what_went_wrong | text | ✓ | - |  |
| recommendations | text | ✓ | - |  |
| would_do_again | boolean | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |
| company_id | uuid | ✓ | - |  |

### public.software

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| software_name | character varying(200) | ✗ | - |  |
| vendor_name | character varying(200) | ✓ | - |  |
| category | character varying(100) | ✓ | - |  |
| annual_cost | numeric | ✓ | - |  |
| contract_start_date | date | ✓ | - |  |
| contract_end_date | date | ✓ | - |  |
| license_count | integer | ✓ | - |  |
| status | character varying(50) | ✓ | 'Active'::character varying |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |
| logo_id | uuid | ✓ | - |  |

### public.software_assets

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| asset_code | character varying(50) | ✗ | - |  |
| software_name | character varying(200) | ✗ | - |  |
| vendor_name | character varying(200) | ✗ | - |  |
| category | character varying(100) | ✗ | - |  |
| subcategory | character varying(100) | ✓ | - |  |
| license_type | character varying(50) | ✗ | - |  |
| total_annual_cost | numeric | ✗ | - |  |
| cost_per_user | numeric | ✓ | - |  |
| total_licenses | integer | ✓ | - |  |
| active_users | integer | ✓ | - |  |
| utilization_rate | numeric | ✓ | - |  |
| vendor_contact_name | character varying(200) | ✓ | - |  |
| vendor_contact_email | character varying(200) | ✓ | - |  |
| contract_start_date | date | ✓ | - |  |
| contract_end_date | date | ✓ | - |  |
| renewal_date | date | ✗ | - |  |
| days_to_renewal | integer | ✓ | - |  |
| auto_renewal | boolean | ✓ | false |  |
| notice_period_days | integer | ✓ | 30 |  |
| payment_frequency | character varying(20) | ✓ | 'annual'::character varying |  |
| deployment_type | character varying(50) | ✓ | - |  |
| primary_use_case | text | ✓ | - |  |
| business_owner | character varying(200) | ✓ | - |  |
| technical_owner | character varying(200) | ✓ | - |  |
| integration_complexity | character varying(20) | ✓ | - |  |
| api_available | boolean | ✓ | false |  |
| replacement_priority | character varying(20) | ✓ | - |  |
| replacement_feasibility_score | numeric | ✓ | - |  |
| business_criticality | character varying(20) | ✓ | - |  |
| regulatory_requirement | boolean | ✓ | false |  |
| last_used_date | date | ✓ | - |  |
| usage_trend | character varying(20) | ✓ | - |  |
| ai_replacement_candidate | boolean | ✓ | false |  |
| ai_augmentation_candidate | boolean | ✓ | false |  |
| workflow_automation_potential | character varying(20) | ✓ | - |  |
| notes | text | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |
| created_by | character varying(200) | ✓ | - |  |
| company_id | uuid | ✓ | - |  |
| contract_status | character varying(50) | ✓ | 'active'::character varying |  |
| waste_amount | numeric | ✓ | - |  |
| potential_savings | numeric | ✓ | - |  |

### public.software_catalog

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| software_name | character varying(255) | ✗ | - |  |
| vendor_name | character varying(255) | ✗ | - |  |
| category | character varying(100) | ✓ | - |  |
| description | text | ✓ | - |  |
| website_url | text | ✓ | - |  |
| pricing_model | character varying(50) | ✓ | - |  |
| min_price | numeric | ✓ | - |  |
| max_price | numeric | ✓ | - |  |
| logo_url | text | ✓ | - |  |
| g2_rating | numeric | ✓ | - |  |
| capterra_rating | numeric | ✓ | - |  |
| total_features_count | integer | ✓ | 0 |  |
| last_updated | timestamp with time zone | ✓ | now() |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.software_features

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| software_catalog_id | uuid | ✓ | - |  |
| feature_category_id | uuid | ✓ | - |  |
| feature_name | character varying(255) | ✗ | - |  |
| feature_description | text | ✓ | - |  |
| is_core_feature | boolean | ✓ | true |  |
| requires_premium | boolean | ✓ | false |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.software_features_mapping

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | gen_random_uuid() | 🔑 PK |
| software_id | uuid | ✓ | - |  |
| feature_category_id | uuid | ✓ | - |  |
| feature_name | character varying(255) | ✗ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.technologies

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| tech_id | character varying(50) | ✗ | - | 🔑 PK |
| company_id | uuid | ✗ | - |  |
| technology_name | character varying(200) | ✗ | - |  |
| category | character varying(100) | ✓ | - |  |
| vendor | character varying(200) | ✓ | - |  |
| description | text | ✓ | - |  |
| implementation_year | integer | ✓ | - |  |
| status | character varying(50) | ✓ | - |  |
| annual_cost | numeric | ✓ | - |  |
| users_count | integer | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.usage_analytics

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| software_id | uuid | ✓ | - |  |
| analysis_date | date | ✗ | - |  |
| licenses_purchased | integer | ✓ | - |  |
| licenses_active | integer | ✓ | - |  |
| licenses_unused | integer | ✓ | - |  |
| utilization_percentage | numeric | ✓ | - |  |
| daily_active_users | integer | ✓ | - |  |
| weekly_active_users | integer | ✓ | - |  |
| monthly_active_users | integer | ✓ | - |  |
| power_users_count | integer | ✓ | - |  |
| occasional_users_count | integer | ✓ | - |  |
| inactive_users_count | integer | ✓ | - |  |
| features_available | integer | ✓ | - |  |
| features_used | integer | ✓ | - |  |
| feature_utilization_percentage | numeric | ✓ | - |  |
| underutilized_features | ARRAY | ✓ | - |  |
| heavily_used_features | ARRAY | ✓ | - |  |
| cost_per_active_user | numeric | ✓ | - |  |
| waste_amount | numeric | ✓ | - |  |
| usage_trend | character varying(20) | ✓ | - |  |
| trend_percentage | numeric | ✓ | - |  |
| optimization_opportunity | numeric | ✓ | - |  |
| right_sizing_recommendation | text | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |

### public.users

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| email | character varying(255) | ✗ | - |  |
| full_name | character varying(200) | ✗ | - |  |
| role | character varying(50) | ✗ | - |  |
| is_active | boolean | ✓ | true |  |
| last_login | timestamp with time zone | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |
| password_hash | text | ✓ | - |  |
| company_id | uuid | ✓ | - |  |

### public.v_admin_overview

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| total_clients | bigint | ✓ | - |  |
| active_clients | bigint | ✓ | - |  |
| prospects | bigint | ✓ | - |  |
| total_portfolio_under_management | numeric | ✓ | - |  |
| total_savings_delivered | numeric | ✓ | - |  |
| total_software_analyzed | bigint | ✓ | - |  |
| unique_vendors_tracked | bigint | ✓ | - |  |

### public.v_company_dashboard

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| company_id | uuid | ✓ | - |  |
| company_name | character varying(200) | ✓ | - |  |
| contract_status | character varying(50) | ✓ | - |  |
| primary_contact_name | character varying(200) | ✓ | - |  |
| total_annual_software_spend | numeric | ✓ | - |  |
| software_count | bigint | ✓ | - |  |
| actual_spend | numeric | ✓ | - |  |
| replacement_candidates | bigint | ✓ | - |  |
| license_waste | numeric | ✓ | - |  |
| optimization_savings | numeric | ✓ | - |  |
| renewals_next_90_days | bigint | ✓ | - |  |
| high_risk_vendors | bigint | ✓ | - |  |
| last_activity | timestamp with time zone | ✓ | - |  |

### public.v_company_overview

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| company_id | uuid | ✓ | - |  |
| company_name | character varying(200) | ✓ | - |  |
| industry | character varying(100) | ✓ | - |  |
| employee_count | integer | ✓ | - |  |
| country | character varying(100) | ✓ | - |  |
| total_revenue | numeric | ✓ | - |  |
| net_profit | numeric | ✓ | - |  |
| tech_count | bigint | ✓ | - |  |
| contact_count | bigint | ✓ | - |  |
| active_initiatives | bigint | ✓ | - |  |
| open_opportunities | bigint | ✓ | - |  |

### public.v_cost_optimization

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| asset_code | character varying(50) | ✓ | - |  |
| software_name | character varying(200) | ✓ | - |  |
| total_annual_cost | numeric | ✓ | - |  |
| utilization_rate | numeric | ✓ | - |  |
| waste_amount | numeric | ✓ | - |  |
| optimization_opportunity | numeric | ✓ | - |  |
| right_sizing_recommendation | text | ✓ | - |  |
| replacement_priority | character varying(20) | ✓ | - |  |
| waste_category | text | ✓ | - |  |

### public.v_high_priority_pain_points

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| pain_point_id | character varying(50) | ✓ | - |  |
| company_id | uuid | ✓ | - |  |
| company_name | character varying(200) | ✓ | - |  |
| category | character varying(100) | ✓ | - |  |
| severity | character varying(50) | ✓ | - |  |
| description | text | ✓ | - |  |
| impact | text | ✓ | - |  |
| identified_date | date | ✓ | - |  |
| days_open | integer | ✓ | - |  |

### public.v_high_risk_vendors

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| vendor_name | character varying(200) | ✓ | - |  |
| financial_risk_score | numeric | ✓ | - |  |
| acquisition_risk | character varying(20) | ✓ | - |  |
| market_position | character varying(50) | ✓ | - |  |
| profitability | character varying(20) | ✓ | - |  |
| recent_layoffs | boolean | ✓ | - |  |
| software_count | bigint | ✓ | - |  |
| total_spend | numeric | ✓ | - |  |
| affected_software | text | ✓ | - |  |

### public.v_portfolio_overview

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✓ | - |  |
| asset_code | character varying(50) | ✓ | - |  |
| software_name | character varying(200) | ✓ | - |  |
| vendor_name | character varying(200) | ✓ | - |  |
| category | character varying(100) | ✓ | - |  |
| total_annual_cost | numeric | ✓ | - |  |
| renewal_date | date | ✓ | - |  |
| days_to_renewal | integer | ✓ | - |  |
| business_criticality | character varying(20) | ✓ | - |  |
| replacement_priority | character varying(20) | ✓ | - |  |
| utilization_rate | numeric | ✓ | - |  |
| financial_risk_score | numeric | ✓ | - |  |
| market_position | character varying(50) | ✓ | - |  |
| alternative_count | bigint | ✓ | - |  |
| integration_count | bigint | ✓ | - |  |

### public.v_replacement_candidates

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| asset_code | character varying(50) | ✓ | - |  |
| software_name | character varying(200) | ✓ | - |  |
| vendor_name | character varying(200) | ✓ | - |  |
| total_annual_cost | numeric | ✓ | - |  |
| replacement_priority | character varying(20) | ✓ | - |  |
| replacement_feasibility_score | numeric | ✓ | - |  |
| business_criticality | character varying(20) | ✓ | - |  |
| integration_complexity | character varying(20) | ✓ | - |  |
| top_alternative | character varying(200) | ✓ | - |  |
| cost_savings_percentage | numeric | ✓ | - |  |
| recommendation_status | character varying(50) | ✓ | - |  |
| replacement_category | text | ✓ | - |  |

### public.v_upcoming_renewals

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| asset_code | character varying(50) | ✓ | - |  |
| software_name | character varying(200) | ✓ | - |  |
| vendor_name | character varying(200) | ✓ | - |  |
| total_annual_cost | numeric | ✓ | - |  |
| renewal_date | date | ✓ | - |  |
| days_to_renewal | integer | ✓ | - |  |
| auto_renewal | boolean | ✓ | - |  |
| notice_period_days | integer | ✓ | - |  |
| negotiation_status | character varying(50) | ✓ | - |  |
| target_discount_percentage | numeric | ✓ | - |  |
| financial_risk_score | numeric | ✓ | - |  |
| alternatives_available | bigint | ✓ | - |  |

### public.vendor_intelligence

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| vendor_name | character varying(200) | ✗ | - |  |
| headquarters_location | character varying(200) | ✓ | - |  |
| founded_year | integer | ✓ | - |  |
| employee_count | integer | ✓ | - |  |
| company_status | character varying(50) | ✓ | - |  |
| parent_company | character varying(200) | ✓ | - |  |
| stock_ticker | character varying(10) | ✓ | - |  |
| website_url | text | ✓ | - |  |
| annual_revenue | numeric | ✓ | - |  |
| revenue_growth_rate | numeric | ✓ | - |  |
| profitability | character varying(20) | ✓ | - |  |
| funding_stage | character varying(50) | ✓ | - |  |
| last_funding_date | date | ✓ | - |  |
| last_funding_amount | numeric | ✓ | - |  |
| financial_risk_score | numeric | ✓ | - |  |
| acquisition_risk | character varying(20) | ✓ | - |  |
| technology_risk | character varying(20) | ✓ | - |  |
| vendor_lock_in_severity | character varying(20) | ✓ | - |  |
| market_position | character varying(50) | ✓ | - |  |
| major_competitors | ARRAY | ✓ | - |  |
| customer_count | integer | ✓ | - |  |
| notable_customers | ARRAY | ✓ | - |  |
| support_quality_rating | numeric | ✓ | - |  |
| response_time_sla | character varying(50) | ✓ | - |  |
| customer_satisfaction_score | numeric | ✓ | - |  |
| product_roadmap_summary | text | ✓ | - |  |
| recent_acquisitions | ARRAY | ✓ | - |  |
| recent_layoffs | boolean | ✓ | false |  |
| leadership_changes | text | ✓ | - |  |
| security_incidents | ARRAY | ✓ | - |  |
| last_researched_date | date | ✓ | - |  |
| research_summary | text | ✓ | - |  |
| analyst_reports | ARRAY | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |

### public.vendors

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| vendor_id | character varying(50) | ✗ | - | 🔑 PK |
| vendor_name | character varying(200) | ✗ | - |  |
| vendor_type | character varying(100) | ✓ | - |  |
| industry | character varying(100) | ✓ | - |  |
| headquarters | character varying(200) | ✓ | - |  |
| country | character varying(100) | ✓ | - |  |
| website | character varying(500) | ✓ | - |  |
| relationship_type | character varying(100) | ✓ | - |  |
| created_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |
| updated_at | timestamp without time zone | ✓ | CURRENT_TIMESTAMP |  |

### public.workflow_automations

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | ✗ | uuid_generate_v4() | 🔑 PK |
| workflow_name | character varying(200) | ✗ | - |  |
| workflow_code | character varying(50) | ✗ | - |  |
| replaces_software_id | uuid | ✓ | - |  |
| workflow_category | character varying(100) | ✓ | - |  |
| workflow_description | text | ✓ | - |  |
| implementation_type | character varying(50) | ✓ | - |  |
| workflow_status | character varying(50) | ✗ | - |  |
| code_repository_url | text | ✓ | - |  |
| deployment_url | text | ✓ | - |  |
| trigger_type | character varying(100) | ✓ | - |  |
| trigger_schedule | character varying(100) | ✓ | - |  |
| input_sources | ARRAY | ✓ | - |  |
| output_destinations | ARRAY | ✓ | - |  |
| error_handling | text | ✓ | - |  |
| executions_per_day | integer | ✓ | - |  |
| success_rate | numeric | ✓ | - |  |
| average_execution_time_seconds | integer | ✓ | - |  |
| cost_per_execution | numeric | ✓ | - |  |
| monthly_execution_cost | numeric | ✓ | - |  |
| manual_effort_hours_saved | numeric | ✓ | - |  |
| annual_cost_savings | numeric | ✓ | - |  |
| error_reduction_percentage | numeric | ✓ | - |  |
| time_savings_percentage | numeric | ✓ | - |  |
| last_execution_date | timestamp with time zone | ✓ | - |  |
| last_success_date | timestamp with time zone | ✓ | - |  |
| last_failure_date | timestamp with time zone | ✓ | - |  |
| consecutive_failures | integer | ✓ | 0 |  |
| alert_email | text | ✓ | - |  |
| alert_threshold | integer | ✓ | 3 |  |
| last_updated_date | date | ✓ | - |  |
| next_review_date | date | ✓ | - |  |
| maintainer | character varying(200) | ✓ | - |  |
| created_at | timestamp with time zone | ✓ | now() |  |
| updated_at | timestamp with time zone | ✓ | now() |  |
| created_by | character varying(200) | ✓ | - |  |
| company_id | uuid | ✓ | - |  |


---

## Foreign Key Relationships

| Table | Column | References | On Delete | On Update |
|-------|--------|------------|-----------|----------|
| activity_log | company_id | companies.id | CASCADE | NO ACTION |
| activity_log | user_id | users.id | NO ACTION | NO ACTION |
| ai_agent_analyses | company_id | companies.id | CASCADE | NO ACTION |
| ai_agent_analyses | software_id | software_assets.id | CASCADE | NO ACTION |
| alternative_solutions | original_software_id | software_assets.id | CASCADE | NO ACTION |
| client_reports | company_id | companies.id | CASCADE | NO ACTION |
| client_reports | generated_by | users.id | NO ACTION | NO ACTION |
| companies | created_by | users.id | NO ACTION | NO ACTION |
| company_metrics | company_id | companies.id | CASCADE | NO ACTION |
| company_users | company_id | companies.id | CASCADE | NO ACTION |
| company_users | user_id | users.id | CASCADE | NO ACTION |
| consolidation_recommendations | company_id | companies.id | CASCADE | NO ACTION |
| contacts | company_id | companies.id | CASCADE | NO ACTION |
| contracts | company_id | companies.id | CASCADE | NO ACTION |
| contracts | vendor_id | vendors.vendor_id | NO ACTION | NO ACTION |
| feature_categories | parent_category_id | feature_categories.id | NO ACTION | NO ACTION |
| feature_comparison_matrix | company_id | companies.id | CASCADE | NO ACTION |
| feature_comparison_matrix | software_id_1 | software.id | CASCADE | NO ACTION |
| feature_comparison_matrix | software_id_2 | software.id | CASCADE | NO ACTION |
| feature_overlaps | company_id | companies.id | CASCADE | NO ACTION |
| feature_overlaps | feature_category_id | feature_categories.id | NO ACTION | NO ACTION |
| initiatives | company_id | companies.id | CASCADE | NO ACTION |
| initiatives | owner_contact_id | contacts.contact_id | NO ACTION | NO ACTION |
| integration_dependencies | source_software_id | software_assets.id | CASCADE | NO ACTION |
| integration_dependencies | target_software_id | software_assets.id | CASCADE | NO ACTION |
| intelligence_notes | author_user_id | users.id | NO ACTION | NO ACTION |
| intelligence_notes | company_id | companies.id | CASCADE | NO ACTION |
| negotiation_outcomes | company_id | companies.id | CASCADE | NO ACTION |
| negotiation_outcomes | playbook_id | negotiation_playbooks.id | SET NULL | NO ACTION |
| negotiation_outcomes | software_id | software.id | CASCADE | NO ACTION |
| negotiation_playbooks | company_id | companies.id | CASCADE | NO ACTION |
| negotiation_playbooks | software_id | software.id | CASCADE | NO ACTION |
| opportunities | company_id | companies.id | CASCADE | NO ACTION |
| pain_points | company_id | companies.id | CASCADE | NO ACTION |
| prism_savings_log | company_id | companies.id | CASCADE | NO ACTION |
| prism_savings_log | created_by | users.id | NO ACTION | NO ACTION |
| renewal_negotiations | company_id | companies.id | CASCADE | NO ACTION |
| renewal_negotiations | software_id | software_assets.id | CASCADE | NO ACTION |
| replacement_projects | company_id | companies.id | CASCADE | NO ACTION |
| replacement_projects | new_solution_id | alternative_solutions.id | RESTRICT | NO ACTION |
| replacement_projects | old_software_id | software_assets.id | RESTRICT | NO ACTION |
| software | company_id | companies.id | CASCADE | NO ACTION |
| software | logo_id | brand_logos.id | NO ACTION | NO ACTION |
| software_assets | company_id | companies.id | CASCADE | NO ACTION |
| software_features | feature_category_id | feature_categories.id | NO ACTION | NO ACTION |
| software_features | software_catalog_id | software_catalog.id | CASCADE | NO ACTION |
| software_features_mapping | feature_category_id | feature_categories.id | NO ACTION | NO ACTION |
| software_features_mapping | software_id | software.id | CASCADE | NO ACTION |
| technologies | company_id | companies.id | CASCADE | NO ACTION |
| usage_analytics | software_id | software_assets.id | CASCADE | NO ACTION |
| workflow_automations | company_id | companies.id | CASCADE | NO ACTION |
| workflow_automations | replaces_software_id | software_assets.id | SET NULL | NO ACTION |

---

## Indexes

Total indexes: 119

