-- ============================================
-- PRISM DATABASE SCHEMA EXPORT
-- Generated: 2025-11-05T00:28:25.645Z
-- Source: Neon Database (Actual Deployed Schema)
-- ============================================

-- This file represents the ACTUAL schema as deployed in production,
-- not just what's in migration files. This is the source of truth.


-- Table: "neon_auth"."users_sync"
CREATE TABLE "neon_auth"."users_sync" (
    "raw_json" JSONB NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    PRIMARY KEY ("id")
);
ALTER TABLE "neon_auth"."users_sync" ADD CONSTRAINT "16486_16487_1_not_null" CHECK raw_json IS NOT NULL;
ALTER TABLE "neon_auth"."users_sync" ADD CONSTRAINT "16486_16487_2_not_null" CHECK id IS NOT NULL;

-- Table: "public"."activity_log"
CREATE TABLE "public"."activity_log" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "company_id" UUID,
    "user_id" UUID,
    "action_type" CHARACTER VARYING(100) NOT NULL,
    "action_description" TEXT,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."activity_log" ADD CONSTRAINT "2200_32873_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."activity_log" ADD CONSTRAINT "2200_32873_4_not_null" CHECK action_type IS NOT NULL;

-- Table: "public"."ai_agent_analyses"
CREATE TABLE "public"."ai_agent_analyses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "software_id" UUID,
    "agent_name" CHARACTER VARYING(100) NOT NULL,
    "analysis_type" CHARACTER VARYING(100) NOT NULL,
    "analysis_date" TIMESTAMPTZ DEFAULT now(),
    "raw_findings" TEXT NOT NULL,
    "structured_findings" JSONB DEFAULT '{}'::jsonb,
    "key_insights" TEXT[],
    "recommendations" TEXT[],
    "risk_flags" TEXT[],
    "opportunities" TEXT[],
    "confidence_score" NUMERIC,
    "sources_cited" TEXT[],
    "requires_human_review" BOOLEAN DEFAULT true,
    "suggested_actions" JSONB DEFAULT '[]'::jsonb,
    "priority_level" CHARACTER VARYING(20),
    "reviewed_by" CHARACTER VARYING(200),
    "reviewed_at" TIMESTAMPTZ,
    "review_status" CHARACTER VARYING(50) DEFAULT 'pending'::character varying,
    "human_notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "tokens_used" INTEGER,
    "processing_time_seconds" NUMERIC,
    "company_id" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."ai_agent_analyses" ADD CONSTRAINT "ai_agent_analyses_confidence_score_check" CHECK ((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric));
ALTER TABLE "public"."ai_agent_analyses" ADD CONSTRAINT "ai_agent_analyses_priority_level_check" CHECK ((priority_level)::text = ANY ((ARRAY['critical'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying])::text[]));
ALTER TABLE "public"."ai_agent_analyses" ADD CONSTRAINT "ai_agent_analyses_review_status_check" CHECK ((review_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'needs-revision'::character varying])::text[]));
ALTER TABLE "public"."ai_agent_analyses" ADD CONSTRAINT "2200_24859_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."ai_agent_analyses" ADD CONSTRAINT "2200_24859_3_not_null" CHECK agent_name IS NOT NULL;
ALTER TABLE "public"."ai_agent_analyses" ADD CONSTRAINT "2200_24859_4_not_null" CHECK analysis_type IS NOT NULL;
ALTER TABLE "public"."ai_agent_analyses" ADD CONSTRAINT "2200_24859_6_not_null" CHECK raw_findings IS NOT NULL;

-- Table: "public"."alternative_solutions"
CREATE TABLE "public"."alternative_solutions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "original_software_id" UUID,
    "alternative_name" CHARACTER VARYING(200) NOT NULL,
    "alternative_vendor" CHARACTER VARYING(200),
    "alternative_type" CHARACTER VARYING(50),
    "alternative_url" TEXT,
    "cost_comparison" NUMERIC,
    "cost_savings_percentage" NUMERIC,
    "feature_parity_score" NUMERIC,
    "missing_critical_features" TEXT[],
    "additional_capabilities" TEXT[],
    "implementation_complexity" CHARACTER VARYING(20),
    "estimated_migration_time_weeks" INTEGER,
    "estimated_migration_cost" NUMERIC,
    "training_required" CHARACTER VARYING(20),
    "integration_compatibility_score" NUMERIC,
    "api_quality" CHARACTER VARYING(20),
    "security_compliance" BOOLEAN DEFAULT false,
    "regulatory_compliant" BOOLEAN DEFAULT false,
    "replacement_risk_score" NUMERIC,
    "rollback_difficulty" CHARACTER VARYING(20),
    "business_continuity_risk" CHARACTER VARYING(20),
    "recommendation_status" CHARACTER VARYING(50),
    "recommendation_reasoning" TEXT,
    "pilot_feasibility" CHARACTER VARYING(20),
    "case_studies" TEXT[],
    "reference_customers" TEXT[],
    "proof_of_concept_completed" BOOLEAN DEFAULT false,
    "poc_results_summary" TEXT,
    "poc_date" DATE,
    "payback_period_months" INTEGER,
    "three_year_total_savings" NUMERIC,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_alternative_type_check" CHECK ((alternative_type)::text = ANY ((ARRAY['commercial'::character varying, 'open-source'::character varying, 'ai-powered'::character varying, 'custom-built'::character varying, 'hybrid'::character varying, 'custom'::character varying, 'ai-powered-custom'::character varying, 'custom-ai'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_api_quality_check" CHECK ((api_quality)::text = ANY ((ARRAY['excellent'::character varying, 'very-good'::character varying, 'good'::character varying, 'fair'::character varying, 'limited'::character varying, 'none'::character varying, 'poor'::character varying, 'variable'::character varying, 'custom'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_business_continuity_risk_check" CHECK ((business_continuity_risk)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_cost_comparison_check" CHECK (cost_comparison >= (0)::numeric);
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_estimated_migration_cost_check" CHECK (estimated_migration_cost >= (0)::numeric);
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_estimated_migration_time_weeks_check" CHECK (estimated_migration_time_weeks > 0);
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_feature_parity_score_check" CHECK ((feature_parity_score >= (0)::numeric) AND (feature_parity_score <= (1)::numeric));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_implementation_complexity_check" CHECK ((implementation_complexity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'very-high'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_integration_compatibility_score_check" CHECK ((integration_compatibility_score >= (0)::numeric) AND (integration_compatibility_score <= (1)::numeric));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_pilot_feasibility_check" CHECK ((pilot_feasibility)::text = ANY ((ARRAY['ideal'::character varying, 'good'::character varying, 'possible'::character varying, 'challenging'::character varying, 'difficult'::character varying, 'very-challenging'::character varying, 'complex'::character varying, 'poor'::character varying, 'moderate'::character varying, 'caution'::character varying, 'explore'::character varying, 'evaluate'::character varying, 'excellent'::character varying, 'suitable'::character varying, 'feasible'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_recommendation_status_check" CHECK ((recommendation_status)::text = ANY ((ARRAY['strongly-recommend'::character varying, 'recommend'::character varying, 'consider'::character varying, 'conditional-recommend'::character varying, 'conditional'::character varying, 'not-recommended'::character varying, 'not-recommend'::character varying, 'caution'::character varying, 'evaluate'::character varying, 'explore'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_replacement_risk_score_check" CHECK ((replacement_risk_score >= (0)::numeric) AND (replacement_risk_score <= (1)::numeric));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_rollback_difficulty_check" CHECK ((rollback_difficulty)::text = ANY ((ARRAY['easy'::character varying, 'moderate'::character varying, 'difficult'::character varying, 'very-difficult'::character varying, 'high'::character varying, 'very-high'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "alternative_solutions_training_required_check" CHECK ((training_required)::text = ANY ((ARRAY['minimal'::character varying, 'moderate'::character varying, 'extensive'::character varying])::text[]));
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "2200_24685_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."alternative_solutions" ADD CONSTRAINT "2200_24685_3_not_null" CHECK alternative_name IS NOT NULL;

-- Table: "public"."brand_logos"
CREATE TABLE "public"."brand_logos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_name" CHARACTER VARYING(255) NOT NULL,
    "vendor_name" CHARACTER VARYING(255),
    "logo_url" TEXT NOT NULL,
    "logo_type" CHARACTER VARYING(20) DEFAULT 'external'::character varying,
    "file_size" INTEGER,
    "dimensions" CHARACTER VARYING(20),
    "last_verified" TIMESTAMPTZ DEFAULT now(),
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."brand_logos" ADD CONSTRAINT "2200_98304_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."brand_logos" ADD CONSTRAINT "2200_98304_2_not_null" CHECK company_name IS NOT NULL;
ALTER TABLE "public"."brand_logos" ADD CONSTRAINT "2200_98304_4_not_null" CHECK logo_url IS NOT NULL;
ALTER TABLE "public"."brand_logos" ADD CONSTRAINT "brand_logos_company_name_vendor_name_key" UNIQUE ("company_name", "vendor_name");

-- Table: "public"."client_reports"
CREATE TABLE "public"."client_reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "company_id" UUID,
    "report_type" CHARACTER VARYING(100) NOT NULL,
    "report_title" CHARACTER VARYING(300) NOT NULL,
    "report_content" TEXT NOT NULL,
    "total_spend" NUMERIC,
    "savings_identified" NUMERIC,
    "software_analyzed" INTEGER,
    "generated_at" TIMESTAMPTZ DEFAULT now(),
    "generated_by" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."client_reports" ADD CONSTRAINT "2200_32852_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."client_reports" ADD CONSTRAINT "2200_32852_3_not_null" CHECK report_type IS NOT NULL;
ALTER TABLE "public"."client_reports" ADD CONSTRAINT "2200_32852_4_not_null" CHECK report_title IS NOT NULL;
ALTER TABLE "public"."client_reports" ADD CONSTRAINT "2200_32852_5_not_null" CHECK report_content IS NOT NULL;

-- Table: "public"."companies"
CREATE TABLE "public"."companies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "company_name" CHARACTER VARYING(200) NOT NULL,
    "industry" CHARACTER VARYING(100),
    "headquarters_location" CHARACTER VARYING(200),
    "employee_count" INTEGER,
    "primary_contact_name" CHARACTER VARYING(200),
    "primary_contact_email" CHARACTER VARYING(255),
    "primary_contact_phone" CHARACTER VARYING(50),
    "primary_contact_title" CHARACTER VARYING(100),
    "contract_start_date" DATE,
    "contract_value" NUMERIC,
    "contract_status" CHARACTER VARYING(50),
    "total_software_count" INTEGER DEFAULT 0,
    "total_annual_software_spend" NUMERIC DEFAULT 0,
    "total_savings_identified" NUMERIC DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "created_by" UUID,
    "headquarters" CHARACTER VARYING(200),
    "country" CHARACTER VARYING(100),
    "description" TEXT,
    "website" CHARACTER VARYING(500),
    "total_revenue" NUMERIC,
    "net_profit" NUMERIC,
    "founded_year" INTEGER,
    "is_client" BOOLEAN DEFAULT true,
    "slug" CHARACTER VARYING(100),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_contract_status_check" CHECK ((contract_status)::text = ANY ((ARRAY['prospect'::character varying, 'active'::character varying, 'paused'::character varying, 'churned'::character varying])::text[]));
ALTER TABLE "public"."companies" ADD CONSTRAINT "2200_32784_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."companies" ADD CONSTRAINT "2200_32784_2_not_null" CHECK company_name IS NOT NULL;
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_slug_key" UNIQUE ("slug");

-- Table: "public"."company_metrics"
CREATE TABLE "public"."company_metrics" (
    "metric_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "metric_category" CHARACTER VARYING(100) NOT NULL,
    "metric_name" CHARACTER VARYING(200) NOT NULL,
    "metric_value" NUMERIC,
    "unit" CHARACTER VARYING(50),
    "fiscal_year" INTEGER,
    "target_value" NUMERIC,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("metric_id")
);
ALTER TABLE "public"."company_metrics" ADD CONSTRAINT "2200_57449_1_not_null" CHECK metric_id IS NOT NULL;
ALTER TABLE "public"."company_metrics" ADD CONSTRAINT "2200_57449_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."company_metrics" ADD CONSTRAINT "2200_57449_3_not_null" CHECK metric_category IS NOT NULL;
ALTER TABLE "public"."company_metrics" ADD CONSTRAINT "2200_57449_4_not_null" CHECK metric_name IS NOT NULL;

-- Table: "public"."company_users"
CREATE TABLE "public"."company_users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "company_id" UUID,
    "user_id" UUID,
    "role" CHARACTER VARYING(50),
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."company_users" ADD CONSTRAINT "company_users_role_check" CHECK ((role)::text = ANY ((ARRAY['primary'::character varying, 'viewer'::character varying, 'analyst'::character varying])::text[]));
ALTER TABLE "public"."company_users" ADD CONSTRAINT "2200_32804_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."company_users" ADD CONSTRAINT "company_users_company_id_user_id_key" UNIQUE ("company_id", "user_id");

-- Table: "public"."consolidation_recommendations"
CREATE TABLE "public"."consolidation_recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID,
    "recommendation_type" CHARACTER VARYING(100) NOT NULL,
    "software_to_consolidate" UUID[] NOT NULL,
    "recommended_solution" CHARACTER VARYING(255),
    "annual_savings" NUMERIC DEFAULT 0,
    "risk_level" CHARACTER VARYING(50),
    "rationale" TEXT,
    "status" CHARACTER VARYING(50) DEFAULT 'pending'::character varying,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."consolidation_recommendations" ADD CONSTRAINT "2200_90150_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."consolidation_recommendations" ADD CONSTRAINT "2200_90150_3_not_null" CHECK recommendation_type IS NOT NULL;
ALTER TABLE "public"."consolidation_recommendations" ADD CONSTRAINT "2200_90150_4_not_null" CHECK software_to_consolidate IS NOT NULL;

-- Table: "public"."contacts"
CREATE TABLE "public"."contacts" (
    "contact_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "first_name" CHARACTER VARYING(100) NOT NULL,
    "last_name" CHARACTER VARYING(100) NOT NULL,
    "title" CHARACTER VARYING(200),
    "department" CHARACTER VARYING(100),
    "email_pattern" CHARACTER VARYING(255),
    "phone" CHARACTER VARYING(50),
    "linkedin_url" CHARACTER VARYING(500),
    "is_decision_maker" BOOLEAN DEFAULT false,
    "seniority_level" CHARACTER VARYING(50),
    "notes" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("contact_id")
);
ALTER TABLE "public"."contacts" ADD CONSTRAINT "2200_57464_1_not_null" CHECK contact_id IS NOT NULL;
ALTER TABLE "public"."contacts" ADD CONSTRAINT "2200_57464_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."contacts" ADD CONSTRAINT "2200_57464_3_not_null" CHECK first_name IS NOT NULL;
ALTER TABLE "public"."contacts" ADD CONSTRAINT "2200_57464_4_not_null" CHECK last_name IS NOT NULL;

-- Table: "public"."contracts"
CREATE TABLE "public"."contracts" (
    "contract_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "vendor_id" CHARACTER VARYING(50),
    "contract_name" CHARACTER VARYING(300) NOT NULL,
    "contract_type" CHARACTER VARYING(100),
    "start_date" DATE,
    "end_date" DATE,
    "contract_value" NUMERIC,
    "currency" CHARACTER VARYING(10),
    "status" CHARACTER VARYING(50),
    "description" TEXT,
    "renewal_notice_days" INTEGER,
    "auto_renew" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("contract_id")
);
ALTER TABLE "public"."contracts" ADD CONSTRAINT "2200_57500_1_not_null" CHECK contract_id IS NOT NULL;
ALTER TABLE "public"."contracts" ADD CONSTRAINT "2200_57500_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."contracts" ADD CONSTRAINT "2200_57500_4_not_null" CHECK contract_name IS NOT NULL;

-- Table: "public"."feature_analysis_cache"
CREATE TABLE "public"."feature_analysis_cache" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_name" CHARACTER VARYING(255) NOT NULL,
    "extracted_features" JSONB,
    "feature_count" INTEGER,
    "analysis_date" TIMESTAMPTZ DEFAULT now(),
    "source" CHARACTER VARYING(50),
    "confidence_score" NUMERIC,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."feature_analysis_cache" ADD CONSTRAINT "2200_82036_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."feature_analysis_cache" ADD CONSTRAINT "2200_82036_2_not_null" CHECK software_name IS NOT NULL;
ALTER TABLE "public"."feature_analysis_cache" ADD CONSTRAINT "feature_analysis_cache_software_name_key" UNIQUE ("software_name");

-- Table: "public"."feature_categories"
CREATE TABLE "public"."feature_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_name" CHARACTER VARYING(100) NOT NULL,
    "parent_category_id" UUID,
    "description" TEXT,
    "icon" CHARACTER VARYING(50),
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."feature_categories" ADD CONSTRAINT "2200_81936_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."feature_categories" ADD CONSTRAINT "2200_81936_2_not_null" CHECK category_name IS NOT NULL;
ALTER TABLE "public"."feature_categories" ADD CONSTRAINT "feature_categories_category_name_key" UNIQUE ("category_name");

-- Table: "public"."feature_comparison_matrix"
CREATE TABLE "public"."feature_comparison_matrix" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID,
    "software_id_1" UUID,
    "software_id_2" UUID,
    "overlap_percentage" NUMERIC NOT NULL,
    "shared_features_count" INTEGER NOT NULL,
    "total_features_compared" INTEGER NOT NULL,
    "shared_features" JSONB,
    "cost_implication" NUMERIC DEFAULT 0,
    "analysis_date" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."feature_comparison_matrix" ADD CONSTRAINT "2200_90169_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."feature_comparison_matrix" ADD CONSTRAINT "2200_90169_5_not_null" CHECK overlap_percentage IS NOT NULL;
ALTER TABLE "public"."feature_comparison_matrix" ADD CONSTRAINT "2200_90169_6_not_null" CHECK shared_features_count IS NOT NULL;
ALTER TABLE "public"."feature_comparison_matrix" ADD CONSTRAINT "2200_90169_7_not_null" CHECK total_features_compared IS NOT NULL;
ALTER TABLE "public"."feature_comparison_matrix" ADD CONSTRAINT "feature_comparison_matrix_company_id_software_id_1_software_key" UNIQUE ("company_id", "software_id_1", "software_id_2");

-- Table: "public"."feature_overlaps"
CREATE TABLE "public"."feature_overlaps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID,
    "feature_category_id" UUID,
    "software_ids" UUID[],
    "overlap_count" INTEGER,
    "redundancy_cost" NUMERIC,
    "consolidation_opportunity" TEXT,
    "priority" CHARACTER VARYING(20) DEFAULT 'medium'::character varying,
    "status" CHARACTER VARYING(20) DEFAULT 'active'::character varying,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."feature_overlaps" ADD CONSTRAINT "2200_81979_1_not_null" CHECK id IS NOT NULL;

-- Table: "public"."initiatives"
CREATE TABLE "public"."initiatives" (
    "initiative_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "initiative_name" CHARACTER VARYING(300) NOT NULL,
    "category" CHARACTER VARYING(100),
    "status" CHARACTER VARYING(50),
    "start_date" DATE,
    "target_completion" DATE,
    "budget" NUMERIC,
    "description" TEXT,
    "owner_contact_id" CHARACTER VARYING(50),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("initiative_id")
);
ALTER TABLE "public"."initiatives" ADD CONSTRAINT "2200_57524_1_not_null" CHECK initiative_id IS NOT NULL;
ALTER TABLE "public"."initiatives" ADD CONSTRAINT "2200_57524_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."initiatives" ADD CONSTRAINT "2200_57524_3_not_null" CHECK initiative_name IS NOT NULL;

-- Table: "public"."integration_dependencies"
CREATE TABLE "public"."integration_dependencies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "source_software_id" UUID,
    "target_software_id" UUID,
    "integration_name" CHARACTER VARYING(200),
    "integration_type" CHARACTER VARYING(50),
    "integration_method" CHARACTER VARYING(100),
    "data_flow_direction" CHARACTER VARYING(20),
    "business_criticality" CHARACTER VARYING(20),
    "data_volume" CHARACTER VARYING(50),
    "failure_impact" TEXT,
    "api_stability" CHARACTER VARYING(20),
    "authentication_method" CHARACTER VARYING(100),
    "has_documentation" BOOLEAN DEFAULT false,
    "custom_code_required" BOOLEAN DEFAULT false,
    "custom_code_location" TEXT,
    "replacement_blocker" BOOLEAN DEFAULT false,
    "workaround_available" BOOLEAN DEFAULT false,
    "workaround_description" TEXT,
    "migration_complexity" CHARACTER VARYING(20),
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "different_systems" CHECK (source_software_id <> target_software_id);
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "integration_dependencies_api_stability_check" CHECK ((api_stability)::text = ANY ((ARRAY['stable'::character varying, 'deprecated'::character varying, 'beta'::character varying, 'unknown'::character varying])::text[]));
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "integration_dependencies_business_criticality_check" CHECK ((business_criticality)::text = ANY ((ARRAY['critical'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying])::text[]));
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "integration_dependencies_data_flow_direction_check" CHECK ((data_flow_direction)::text = ANY ((ARRAY['bidirectional'::character varying, 'source-to-target'::character varying, 'target-to-source'::character varying])::text[]));
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "integration_dependencies_data_volume_check" CHECK ((data_volume)::text = ANY ((ARRAY['realtime'::character varying, 'hourly'::character varying, 'daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'on-demand'::character varying])::text[]));
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "integration_dependencies_integration_type_check" CHECK ((integration_type)::text = ANY ((ARRAY['api'::character varying, 'file-transfer'::character varying, 'database'::character varying, 'manual'::character varying, 'embedded'::character varying, 'webhook'::character varying, 'etl'::character varying])::text[]));
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "integration_dependencies_migration_complexity_check" CHECK ((migration_complexity)::text = ANY ((ARRAY['simple'::character varying, 'moderate'::character varying, 'complex'::character varying, 'very-complex'::character varying])::text[]));
ALTER TABLE "public"."integration_dependencies" ADD CONSTRAINT "2200_24755_1_not_null" CHECK id IS NOT NULL;

-- Table: "public"."intelligence_notes"
CREATE TABLE "public"."intelligence_notes" (
    "note_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "category" CHARACTER VARYING(100),
    "note_date" DATE,
    "source" CHARACTER VARYING(200),
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "author_user_id" UUID,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("note_id")
);
ALTER TABLE "public"."intelligence_notes" ADD CONSTRAINT "2200_57580_1_not_null" CHECK note_id IS NOT NULL;
ALTER TABLE "public"."intelligence_notes" ADD CONSTRAINT "2200_57580_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."intelligence_notes" ADD CONSTRAINT "2200_57580_6_not_null" CHECK content IS NOT NULL;

-- Table: "public"."negotiation_market_data"
CREATE TABLE "public"."negotiation_market_data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_name" CHARACTER VARYING(255) NOT NULL,
    "vendor_name" CHARACTER VARYING(255) NOT NULL,
    "average_price_per_user" NUMERIC,
    "price_range_min" NUMERIC,
    "price_range_max" NUMERIC,
    "typical_discount_range" CHARACTER VARYING(50),
    "market_share_percentage" NUMERIC,
    "competitor_list" JSONB,
    "recent_price_changes" JSONB,
    "seasonal_discount_periods" JSONB,
    "data_source" CHARACTER VARYING(100),
    "data_quality_score" INTEGER,
    "last_updated" TIMESTAMPTZ DEFAULT now(),
    "next_update_due" TIMESTAMPTZ,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."negotiation_market_data" ADD CONSTRAINT "2200_106548_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."negotiation_market_data" ADD CONSTRAINT "2200_106548_2_not_null" CHECK software_name IS NOT NULL;
ALTER TABLE "public"."negotiation_market_data" ADD CONSTRAINT "2200_106548_3_not_null" CHECK vendor_name IS NOT NULL;
ALTER TABLE "public"."negotiation_market_data" ADD CONSTRAINT "negotiation_market_data_software_name_vendor_name_key" UNIQUE ("software_name", "vendor_name");

-- Table: "public"."negotiation_outcomes"
CREATE TABLE "public"."negotiation_outcomes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "playbook_id" UUID,
    "company_id" UUID NOT NULL,
    "software_id" UUID NOT NULL,
    "original_annual_cost" NUMERIC NOT NULL,
    "negotiated_annual_cost" NUMERIC NOT NULL,
    "annual_savings" NUMERIC NOT NULL,
    "discount_achieved" INTEGER NOT NULL,
    "negotiation_tactics_used" JSONB,
    "vendor_response" TEXT,
    "final_terms" JSONB,
    "negotiation_duration_days" INTEGER,
    "success_rating" INTEGER,
    "notes" TEXT,
    "achieved_at" TIMESTAMPTZ DEFAULT now(),
    "recorded_by" UUID,
    "new_renewal_date" DATE,
    "new_contract_length_years" INTEGER,
    "new_payment_terms" CHARACTER VARYING(100),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "negotiation_outcomes_success_rating_check" CHECK ((success_rating >= 1) AND (success_rating <= 5));
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "2200_106521_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "2200_106521_3_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "2200_106521_4_not_null" CHECK software_id IS NOT NULL;
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "2200_106521_5_not_null" CHECK original_annual_cost IS NOT NULL;
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "2200_106521_6_not_null" CHECK negotiated_annual_cost IS NOT NULL;
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "2200_106521_7_not_null" CHECK annual_savings IS NOT NULL;
ALTER TABLE "public"."negotiation_outcomes" ADD CONSTRAINT "2200_106521_8_not_null" CHECK discount_achieved IS NOT NULL;

-- Table: "public"."negotiation_playbooks"
CREATE TABLE "public"."negotiation_playbooks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "software_id" UUID NOT NULL,
    "market_average_price" NUMERIC,
    "market_discount_range_min" INTEGER,
    "market_discount_range_max" INTEGER,
    "competitor_alternatives" JSONB,
    "pricing_trends" TEXT,
    "utilization_rate" NUMERIC,
    "unused_licenses" INTEGER,
    "contract_length_years" INTEGER,
    "total_spent_to_date" NUMERIC,
    "payment_history_score" INTEGER,
    "recommended_target_discount" INTEGER,
    "confidence_level" CHARACTER VARYING(20),
    "leverage_points" JSONB,
    "risks" JSONB,
    "talking_points" JSONB,
    "email_initial_outreach" TEXT,
    "email_counter_offer" TEXT,
    "email_final_push" TEXT,
    "email_alternative_threat" TEXT,
    "generated_at" TIMESTAMPTZ DEFAULT now(),
    "generated_by" UUID,
    "ai_model_version" CHARACTER VARYING(50),
    "status" CHARACTER VARYING(50) DEFAULT 'draft'::character varying,
    "negotiation_started_at" TIMESTAMPTZ,
    "negotiation_completed_at" TIMESTAMPTZ,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."negotiation_playbooks" ADD CONSTRAINT "2200_106499_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."negotiation_playbooks" ADD CONSTRAINT "2200_106499_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."negotiation_playbooks" ADD CONSTRAINT "2200_106499_3_not_null" CHECK software_id IS NOT NULL;

-- Table: "public"."opportunities"
CREATE TABLE "public"."opportunities" (
    "opportunity_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "opportunity_name" CHARACTER VARYING(300) NOT NULL,
    "category" CHARACTER VARYING(100),
    "priority" CHARACTER VARYING(50),
    "estimated_value" NUMERIC,
    "probability" CHARACTER VARYING(50),
    "status" CHARACTER VARYING(50),
    "description" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("opportunity_id")
);
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "2200_57546_1_not_null" CHECK opportunity_id IS NOT NULL;
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "2200_57546_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "2200_57546_3_not_null" CHECK opportunity_name IS NOT NULL;

-- Table: "public"."pain_points"
CREATE TABLE "public"."pain_points" (
    "pain_point_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "category" CHARACTER VARYING(100),
    "severity" CHARACTER VARYING(50),
    "description" TEXT NOT NULL,
    "impact" TEXT,
    "identified_date" DATE,
    "resolved_date" DATE,
    "resolution" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("pain_point_id")
);
ALTER TABLE "public"."pain_points" ADD CONSTRAINT "2200_57563_1_not_null" CHECK pain_point_id IS NOT NULL;
ALTER TABLE "public"."pain_points" ADD CONSTRAINT "2200_57563_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."pain_points" ADD CONSTRAINT "2200_57563_5_not_null" CHECK description IS NOT NULL;

-- Table: "public"."prism_savings_log"
CREATE TABLE "public"."prism_savings_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "software_id" UUID,
    "software_name" CHARACTER VARYING(255) NOT NULL,
    "vendor_name" CHARACTER VARYING(255) NOT NULL,
    "annual_savings" NUMERIC NOT NULL,
    "savings_type" CHARACTER VARYING(50) NOT NULL,
    "identified_by" CHARACTER VARYING(50) NOT NULL DEFAULT 'prism'::character varying,
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "created_by" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."prism_savings_log" ADD CONSTRAINT "2200_73728_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."prism_savings_log" ADD CONSTRAINT "2200_73728_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."prism_savings_log" ADD CONSTRAINT "2200_73728_4_not_null" CHECK software_name IS NOT NULL;
ALTER TABLE "public"."prism_savings_log" ADD CONSTRAINT "2200_73728_5_not_null" CHECK vendor_name IS NOT NULL;
ALTER TABLE "public"."prism_savings_log" ADD CONSTRAINT "2200_73728_6_not_null" CHECK annual_savings IS NOT NULL;
ALTER TABLE "public"."prism_savings_log" ADD CONSTRAINT "2200_73728_7_not_null" CHECK savings_type IS NOT NULL;
ALTER TABLE "public"."prism_savings_log" ADD CONSTRAINT "2200_73728_8_not_null" CHECK identified_by IS NOT NULL;

-- Table: "public"."renewal_negotiations"
CREATE TABLE "public"."renewal_negotiations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "software_id" UUID,
    "renewal_date" DATE NOT NULL,
    "current_annual_cost" NUMERIC,
    "current_terms" TEXT,
    "current_contract_length_years" INTEGER,
    "negotiation_status" CHARACTER VARYING(50),
    "target_discount_percentage" NUMERIC,
    "target_annual_cost" NUMERIC,
    "usage_decline_evidence" TEXT,
    "alternative_vendors" TEXT[],
    "competitive_pricing" TEXT,
    "budget_constraints" TEXT,
    "multi_year_commitment_option" BOOLEAN DEFAULT false,
    "vendor_eagerness" CHARACTER VARYING(20),
    "vendor_quarter_end" DATE,
    "vendor_recent_losses" TEXT[],
    "vendor_pressure_points" TEXT[],
    "negotiation_notes" TEXT,
    "offers_received" JSONB DEFAULT '[]'::jsonb,
    "counteroffers_made" JSONB DEFAULT '[]'::jsonb,
    "negotiation_started_date" DATE,
    "final_annual_cost" NUMERIC,
    "savings_achieved" NUMERIC,
    "savings_percentage" NUMERIC,
    "new_contract_terms" TEXT,
    "new_contract_length_years" INTEGER,
    "negotiation_completed_date" DATE,
    "lead_negotiator" CHARACTER VARYING(200),
    "stakeholders" TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "company_id" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."renewal_negotiations" ADD CONSTRAINT "renewal_negotiations_current_annual_cost_check" CHECK (current_annual_cost >= (0)::numeric);
ALTER TABLE "public"."renewal_negotiations" ADD CONSTRAINT "renewal_negotiations_final_annual_cost_check" CHECK (final_annual_cost >= (0)::numeric);
ALTER TABLE "public"."renewal_negotiations" ADD CONSTRAINT "renewal_negotiations_negotiation_status_check" CHECK ((negotiation_status)::text = ANY ((ARRAY['planning'::character varying, 'in-progress'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'on-hold'::character varying])::text[]));
ALTER TABLE "public"."renewal_negotiations" ADD CONSTRAINT "renewal_negotiations_target_annual_cost_check" CHECK (target_annual_cost >= (0)::numeric);
ALTER TABLE "public"."renewal_negotiations" ADD CONSTRAINT "renewal_negotiations_vendor_eagerness_check" CHECK ((vendor_eagerness)::text = ANY ((ARRAY['desperate'::character varying, 'willing'::character varying, 'inflexible'::character varying, 'unknown'::character varying])::text[]));
ALTER TABLE "public"."renewal_negotiations" ADD CONSTRAINT "2200_24790_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."renewal_negotiations" ADD CONSTRAINT "2200_24790_3_not_null" CHECK renewal_date IS NOT NULL;

-- Table: "public"."replacement_projects"
CREATE TABLE "public"."replacement_projects" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "project_name" CHARACTER VARYING(200) NOT NULL,
    "project_code" CHARACTER VARYING(50) NOT NULL,
    "old_software_id" UUID,
    "new_solution_id" UUID,
    "project_status" CHARACTER VARYING(50) NOT NULL,
    "start_date" DATE,
    "target_completion_date" DATE,
    "actual_completion_date" DATE,
    "total_projected_savings" NUMERIC,
    "implementation_cost" NUMERIC,
    "roi_months" INTEGER,
    "annual_recurring_savings" NUMERIC,
    "project_sponsor" CHARACTER VARYING(200),
    "project_manager" CHARACTER VARYING(200),
    "technical_lead" CHARACTER VARYING(200),
    "business_lead" CHARACTER VARYING(200),
    "team_members" TEXT[],
    "discovery_complete" BOOLEAN DEFAULT false,
    "discovery_completion_date" DATE,
    "pilot_complete" BOOLEAN DEFAULT false,
    "pilot_completion_date" DATE,
    "migration_plan_approved" BOOLEAN DEFAULT false,
    "migration_plan_approval_date" DATE,
    "user_training_complete" BOOLEAN DEFAULT false,
    "user_training_completion_date" DATE,
    "go_live_complete" BOOLEAN DEFAULT false,
    "go_live_date" DATE,
    "current_risks" TEXT[],
    "current_issues" TEXT[],
    "mitigation_plans" TEXT,
    "risk_level" CHARACTER VARYING(20),
    "user_adoption_rate" NUMERIC,
    "performance_vs_baseline" TEXT,
    "user_satisfaction_score" NUMERIC,
    "issue_count" INTEGER,
    "critical_issue_count" INTEGER,
    "what_went_well" TEXT,
    "what_went_wrong" TEXT,
    "recommendations" TEXT,
    "would_do_again" BOOLEAN,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "company_id" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_annual_recurring_savings_check" CHECK (annual_recurring_savings >= (0)::numeric);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_critical_issue_count_check" CHECK (critical_issue_count >= 0);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_implementation_cost_check" CHECK (implementation_cost >= (0)::numeric);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_issue_count_check" CHECK (issue_count >= 0);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_project_status_check" CHECK ((project_status)::text = ANY ((ARRAY['planning'::character varying, 'pilot'::character varying, 'migration'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'on-hold'::character varying])::text[]));
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_risk_level_check" CHECK ((risk_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]));
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_roi_months_check" CHECK (roi_months > 0);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_total_projected_savings_check" CHECK (total_projected_savings >= (0)::numeric);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_user_adoption_rate_check" CHECK ((user_adoption_rate >= (0)::numeric) AND (user_adoption_rate <= (100)::numeric));
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_user_satisfaction_score_check" CHECK ((user_satisfaction_score >= (1)::numeric) AND (user_satisfaction_score <= (5)::numeric));
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "valid_project_dates" CHECK (start_date <= target_completion_date);
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "2200_24817_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "2200_24817_2_not_null" CHECK project_name IS NOT NULL;
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "2200_24817_3_not_null" CHECK project_code IS NOT NULL;
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "2200_24817_6_not_null" CHECK project_status IS NOT NULL;
ALTER TABLE "public"."replacement_projects" ADD CONSTRAINT "replacement_projects_project_code_key" UNIQUE ("project_code");

-- Table: "public"."software"
CREATE TABLE "public"."software" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "software_name" CHARACTER VARYING(200) NOT NULL,
    "vendor_name" CHARACTER VARYING(200),
    "category" CHARACTER VARYING(100),
    "annual_cost" NUMERIC,
    "contract_start_date" DATE,
    "contract_end_date" DATE,
    "license_count" INTEGER,
    "status" CHARACTER VARYING(50) DEFAULT 'Active'::character varying,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "logo_id" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."software" ADD CONSTRAINT "2200_90113_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."software" ADD CONSTRAINT "2200_90113_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."software" ADD CONSTRAINT "2200_90113_3_not_null" CHECK software_name IS NOT NULL;
ALTER TABLE "public"."software" ADD CONSTRAINT "software_company_id_software_name_key" UNIQUE ("company_id", "software_name");

-- Table: "public"."software_assets"
CREATE TABLE "public"."software_assets" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "asset_code" CHARACTER VARYING(50) NOT NULL,
    "software_name" CHARACTER VARYING(200) NOT NULL,
    "vendor_name" CHARACTER VARYING(200) NOT NULL,
    "category" CHARACTER VARYING(100) NOT NULL,
    "subcategory" CHARACTER VARYING(100),
    "license_type" CHARACTER VARYING(50) NOT NULL,
    "total_annual_cost" NUMERIC NOT NULL,
    "cost_per_user" NUMERIC,
    "total_licenses" INTEGER,
    "active_users" INTEGER,
    "utilization_rate" NUMERIC,
    "vendor_contact_name" CHARACTER VARYING(200),
    "vendor_contact_email" CHARACTER VARYING(200),
    "contract_start_date" DATE,
    "contract_end_date" DATE,
    "renewal_date" DATE NOT NULL,
    "days_to_renewal" INTEGER,
    "auto_renewal" BOOLEAN DEFAULT false,
    "notice_period_days" INTEGER DEFAULT 30,
    "payment_frequency" CHARACTER VARYING(20) DEFAULT 'annual'::character varying,
    "deployment_type" CHARACTER VARYING(50),
    "primary_use_case" TEXT,
    "business_owner" CHARACTER VARYING(200),
    "technical_owner" CHARACTER VARYING(200),
    "integration_complexity" CHARACTER VARYING(20),
    "api_available" BOOLEAN DEFAULT false,
    "replacement_priority" CHARACTER VARYING(20),
    "replacement_feasibility_score" NUMERIC,
    "business_criticality" CHARACTER VARYING(20),
    "regulatory_requirement" BOOLEAN DEFAULT false,
    "last_used_date" DATE,
    "usage_trend" CHARACTER VARYING(20),
    "ai_replacement_candidate" BOOLEAN DEFAULT false,
    "ai_augmentation_candidate" BOOLEAN DEFAULT false,
    "workflow_automation_potential" CHARACTER VARYING(20),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "created_by" CHARACTER VARYING(200),
    "company_id" UUID,
    "contract_status" CHARACTER VARYING(50) DEFAULT 'active'::character varying,
    "waste_amount" NUMERIC,
    "potential_savings" NUMERIC,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "software_assets_business_criticality_check" CHECK ((business_criticality)::text = ANY ((ARRAY['mission-critical'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying])::text[]));
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "software_assets_integration_complexity_check" CHECK ((integration_complexity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]));
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "software_assets_replacement_feasibility_score_check" CHECK ((replacement_feasibility_score >= (0)::numeric) AND (replacement_feasibility_score <= (1)::numeric));
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "software_assets_replacement_priority_check" CHECK ((replacement_priority)::text = ANY ((ARRAY['immediate'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying, 'never'::character varying])::text[]));
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "software_assets_usage_trend_check" CHECK ((usage_trend)::text = ANY ((ARRAY['increasing'::character varying, 'stable'::character varying, 'declining'::character varying, 'unknown'::character varying])::text[]));
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "software_assets_workflow_automation_potential_check" CHECK ((workflow_automation_potential)::text = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying, 'none'::character varying])::text[]));
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "valid_cost" CHECK (total_annual_cost >= (0)::numeric);
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "valid_dates" CHECK (contract_start_date <= contract_end_date);
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "valid_licenses" CHECK (total_licenses >= 0);
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_2_not_null" CHECK asset_code IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_3_not_null" CHECK software_name IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_4_not_null" CHECK vendor_name IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_5_not_null" CHECK category IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_7_not_null" CHECK license_type IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_8_not_null" CHECK total_annual_cost IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "2200_24621_17_not_null" CHECK renewal_date IS NOT NULL;
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "software_assets_asset_code_key" UNIQUE ("asset_code");
ALTER TABLE "public"."software_assets" ADD CONSTRAINT "unique_software_per_company" UNIQUE ("company_id", "software_name", "vendor_name");

-- Table: "public"."software_catalog"
CREATE TABLE "public"."software_catalog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_name" CHARACTER VARYING(255) NOT NULL,
    "vendor_name" CHARACTER VARYING(255) NOT NULL,
    "category" CHARACTER VARYING(100),
    "description" TEXT,
    "website_url" TEXT,
    "pricing_model" CHARACTER VARYING(50),
    "min_price" NUMERIC,
    "max_price" NUMERIC,
    "logo_url" TEXT,
    "g2_rating" NUMERIC,
    "capterra_rating" NUMERIC,
    "total_features_count" INTEGER DEFAULT 0,
    "last_updated" TIMESTAMPTZ DEFAULT now(),
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."software_catalog" ADD CONSTRAINT "2200_81920_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."software_catalog" ADD CONSTRAINT "2200_81920_2_not_null" CHECK software_name IS NOT NULL;
ALTER TABLE "public"."software_catalog" ADD CONSTRAINT "2200_81920_3_not_null" CHECK vendor_name IS NOT NULL;
ALTER TABLE "public"."software_catalog" ADD CONSTRAINT "software_catalog_software_name_key" UNIQUE ("software_name");

-- Table: "public"."software_features"
CREATE TABLE "public"."software_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_catalog_id" UUID,
    "feature_category_id" UUID,
    "feature_name" CHARACTER VARYING(255) NOT NULL,
    "feature_description" TEXT,
    "is_core_feature" BOOLEAN DEFAULT true,
    "requires_premium" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."software_features" ADD CONSTRAINT "2200_81953_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."software_features" ADD CONSTRAINT "2200_81953_4_not_null" CHECK feature_name IS NOT NULL;
ALTER TABLE "public"."software_features" ADD CONSTRAINT "software_features_software_catalog_id_feature_name_key" UNIQUE ("software_catalog_id", "feature_name");

-- Table: "public"."software_features_mapping"
CREATE TABLE "public"."software_features_mapping" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_id" UUID,
    "feature_category_id" UUID,
    "feature_name" CHARACTER VARYING(255) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."software_features_mapping" ADD CONSTRAINT "2200_90131_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."software_features_mapping" ADD CONSTRAINT "2200_90131_4_not_null" CHECK feature_name IS NOT NULL;
ALTER TABLE "public"."software_features_mapping" ADD CONSTRAINT "software_features_mapping_software_id_feature_name_key" UNIQUE ("software_id", "feature_name");

-- Table: "public"."technologies"
CREATE TABLE "public"."technologies" (
    "tech_id" CHARACTER VARYING(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "technology_name" CHARACTER VARYING(200) NOT NULL,
    "category" CHARACTER VARYING(100),
    "vendor" CHARACTER VARYING(200),
    "description" TEXT,
    "implementation_year" INTEGER,
    "status" CHARACTER VARYING(50),
    "annual_cost" NUMERIC,
    "users_count" INTEGER,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("tech_id")
);
ALTER TABLE "public"."technologies" ADD CONSTRAINT "2200_57482_1_not_null" CHECK tech_id IS NOT NULL;
ALTER TABLE "public"."technologies" ADD CONSTRAINT "2200_57482_2_not_null" CHECK company_id IS NOT NULL;
ALTER TABLE "public"."technologies" ADD CONSTRAINT "2200_57482_3_not_null" CHECK technology_name IS NOT NULL;

-- Table: "public"."usage_analytics"
CREATE TABLE "public"."usage_analytics" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "software_id" UUID,
    "analysis_date" DATE NOT NULL,
    "licenses_purchased" INTEGER,
    "licenses_active" INTEGER,
    "licenses_unused" INTEGER,
    "utilization_percentage" NUMERIC,
    "daily_active_users" INTEGER,
    "weekly_active_users" INTEGER,
    "monthly_active_users" INTEGER,
    "power_users_count" INTEGER,
    "occasional_users_count" INTEGER,
    "inactive_users_count" INTEGER,
    "features_available" INTEGER,
    "features_used" INTEGER,
    "feature_utilization_percentage" NUMERIC,
    "underutilized_features" TEXT[],
    "heavily_used_features" TEXT[],
    "cost_per_active_user" NUMERIC,
    "waste_amount" NUMERIC,
    "usage_trend" CHARACTER VARYING(20),
    "trend_percentage" NUMERIC,
    "optimization_opportunity" NUMERIC,
    "right_sizing_recommendation" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_daily_active_users_check" CHECK (daily_active_users >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_features_available_check" CHECK (features_available >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_features_used_check" CHECK (features_used >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_inactive_users_count_check" CHECK (inactive_users_count >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_licenses_active_check" CHECK (licenses_active >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_licenses_purchased_check" CHECK (licenses_purchased >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_monthly_active_users_check" CHECK (monthly_active_users >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_occasional_users_count_check" CHECK (occasional_users_count >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_optimization_opportunity_check" CHECK (optimization_opportunity >= (0)::numeric);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_power_users_count_check" CHECK (power_users_count >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_usage_trend_check" CHECK ((usage_trend)::text = ANY ((ARRAY['increasing'::character varying, 'stable'::character varying, 'declining'::character varying, 'volatile'::character varying])::text[]));
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_waste_amount_check" CHECK (waste_amount >= (0)::numeric);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_weekly_active_users_check" CHECK (weekly_active_users >= 0);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "valid_feature_numbers" CHECK (features_used <= features_available);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "valid_license_numbers" CHECK (licenses_active <= licenses_purchased);
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "2200_24721_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "2200_24721_3_not_null" CHECK analysis_date IS NOT NULL;
ALTER TABLE "public"."usage_analytics" ADD CONSTRAINT "usage_analytics_software_id_analysis_date_key" UNIQUE ("software_id", "analysis_date");

-- Table: "public"."users"
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" CHARACTER VARYING(255) NOT NULL,
    "full_name" CHARACTER VARYING(200) NOT NULL,
    "role" CHARACTER VARYING(50) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "last_login" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "password_hash" TEXT,
    "company_id" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_check" CHECK ((role)::text = ANY ((ARRAY['admin'::character varying, 'client'::character varying, 'viewer'::character varying])::text[]));
ALTER TABLE "public"."users" ADD CONSTRAINT "2200_32768_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."users" ADD CONSTRAINT "2200_32768_2_not_null" CHECK email IS NOT NULL;
ALTER TABLE "public"."users" ADD CONSTRAINT "2200_32768_3_not_null" CHECK full_name IS NOT NULL;
ALTER TABLE "public"."users" ADD CONSTRAINT "2200_32768_4_not_null" CHECK role IS NOT NULL;
ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");

-- Table: "public"."v_admin_overview"
CREATE TABLE "public"."v_admin_overview" (
    "total_clients" BIGINT,
    "active_clients" BIGINT,
    "prospects" BIGINT,
    "total_portfolio_under_management" NUMERIC,
    "total_savings_delivered" NUMERIC,
    "total_software_analyzed" BIGINT,
    "unique_vendors_tracked" BIGINT
);

-- Table: "public"."v_company_dashboard"
CREATE TABLE "public"."v_company_dashboard" (
    "company_id" UUID,
    "company_name" CHARACTER VARYING(200),
    "contract_status" CHARACTER VARYING(50),
    "primary_contact_name" CHARACTER VARYING(200),
    "total_annual_software_spend" NUMERIC,
    "software_count" BIGINT,
    "actual_spend" NUMERIC,
    "replacement_candidates" BIGINT,
    "license_waste" NUMERIC,
    "optimization_savings" NUMERIC,
    "renewals_next_90_days" BIGINT,
    "high_risk_vendors" BIGINT,
    "last_activity" TIMESTAMPTZ
);

-- Table: "public"."v_company_overview"
CREATE TABLE "public"."v_company_overview" (
    "company_id" UUID,
    "company_name" CHARACTER VARYING(200),
    "industry" CHARACTER VARYING(100),
    "employee_count" INTEGER,
    "country" CHARACTER VARYING(100),
    "total_revenue" NUMERIC,
    "net_profit" NUMERIC,
    "tech_count" BIGINT,
    "contact_count" BIGINT,
    "active_initiatives" BIGINT,
    "open_opportunities" BIGINT
);

-- Table: "public"."v_cost_optimization"
CREATE TABLE "public"."v_cost_optimization" (
    "asset_code" CHARACTER VARYING(50),
    "software_name" CHARACTER VARYING(200),
    "total_annual_cost" NUMERIC,
    "utilization_rate" NUMERIC,
    "waste_amount" NUMERIC,
    "optimization_opportunity" NUMERIC,
    "right_sizing_recommendation" TEXT,
    "replacement_priority" CHARACTER VARYING(20),
    "waste_category" TEXT
);

-- Table: "public"."v_high_priority_pain_points"
CREATE TABLE "public"."v_high_priority_pain_points" (
    "pain_point_id" CHARACTER VARYING(50),
    "company_id" UUID,
    "company_name" CHARACTER VARYING(200),
    "category" CHARACTER VARYING(100),
    "severity" CHARACTER VARYING(50),
    "description" TEXT,
    "impact" TEXT,
    "identified_date" DATE,
    "days_open" INTEGER
);

-- Table: "public"."v_high_risk_vendors"
CREATE TABLE "public"."v_high_risk_vendors" (
    "vendor_name" CHARACTER VARYING(200),
    "financial_risk_score" NUMERIC,
    "acquisition_risk" CHARACTER VARYING(20),
    "market_position" CHARACTER VARYING(50),
    "profitability" CHARACTER VARYING(20),
    "recent_layoffs" BOOLEAN,
    "software_count" BIGINT,
    "total_spend" NUMERIC,
    "affected_software" TEXT
);

-- Table: "public"."v_portfolio_overview"
CREATE TABLE "public"."v_portfolio_overview" (
    "id" UUID,
    "asset_code" CHARACTER VARYING(50),
    "software_name" CHARACTER VARYING(200),
    "vendor_name" CHARACTER VARYING(200),
    "category" CHARACTER VARYING(100),
    "total_annual_cost" NUMERIC,
    "renewal_date" DATE,
    "days_to_renewal" INTEGER,
    "business_criticality" CHARACTER VARYING(20),
    "replacement_priority" CHARACTER VARYING(20),
    "utilization_rate" NUMERIC,
    "financial_risk_score" NUMERIC,
    "market_position" CHARACTER VARYING(50),
    "alternative_count" BIGINT,
    "integration_count" BIGINT
);

-- Table: "public"."v_replacement_candidates"
CREATE TABLE "public"."v_replacement_candidates" (
    "asset_code" CHARACTER VARYING(50),
    "software_name" CHARACTER VARYING(200),
    "vendor_name" CHARACTER VARYING(200),
    "total_annual_cost" NUMERIC,
    "replacement_priority" CHARACTER VARYING(20),
    "replacement_feasibility_score" NUMERIC,
    "business_criticality" CHARACTER VARYING(20),
    "integration_complexity" CHARACTER VARYING(20),
    "top_alternative" CHARACTER VARYING(200),
    "cost_savings_percentage" NUMERIC,
    "recommendation_status" CHARACTER VARYING(50),
    "replacement_category" TEXT
);

-- Table: "public"."v_upcoming_renewals"
CREATE TABLE "public"."v_upcoming_renewals" (
    "asset_code" CHARACTER VARYING(50),
    "software_name" CHARACTER VARYING(200),
    "vendor_name" CHARACTER VARYING(200),
    "total_annual_cost" NUMERIC,
    "renewal_date" DATE,
    "days_to_renewal" INTEGER,
    "auto_renewal" BOOLEAN,
    "notice_period_days" INTEGER,
    "negotiation_status" CHARACTER VARYING(50),
    "target_discount_percentage" NUMERIC,
    "financial_risk_score" NUMERIC,
    "alternatives_available" BIGINT
);

-- Table: "public"."vendor_intelligence"
CREATE TABLE "public"."vendor_intelligence" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "vendor_name" CHARACTER VARYING(200) NOT NULL,
    "headquarters_location" CHARACTER VARYING(200),
    "founded_year" INTEGER,
    "employee_count" INTEGER,
    "company_status" CHARACTER VARYING(50),
    "parent_company" CHARACTER VARYING(200),
    "stock_ticker" CHARACTER VARYING(10),
    "website_url" TEXT,
    "annual_revenue" NUMERIC,
    "revenue_growth_rate" NUMERIC,
    "profitability" CHARACTER VARYING(20),
    "funding_stage" CHARACTER VARYING(50),
    "last_funding_date" DATE,
    "last_funding_amount" NUMERIC,
    "financial_risk_score" NUMERIC,
    "acquisition_risk" CHARACTER VARYING(20),
    "technology_risk" CHARACTER VARYING(20),
    "vendor_lock_in_severity" CHARACTER VARYING(20),
    "market_position" CHARACTER VARYING(50),
    "major_competitors" TEXT[],
    "customer_count" INTEGER,
    "notable_customers" TEXT[],
    "support_quality_rating" NUMERIC,
    "response_time_sla" CHARACTER VARYING(50),
    "customer_satisfaction_score" NUMERIC,
    "product_roadmap_summary" TEXT,
    "recent_acquisitions" TEXT[],
    "recent_layoffs" BOOLEAN DEFAULT false,
    "leadership_changes" TEXT,
    "security_incidents" TEXT[],
    "last_researched_date" DATE,
    "research_summary" TEXT,
    "analyst_reports" TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_acquisition_risk_check" CHECK ((acquisition_risk)::text = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying, 'unknown'::character varying])::text[]));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_annual_revenue_check" CHECK (annual_revenue >= (0)::numeric);
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_company_status_check" CHECK ((company_status)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying, 'acquired'::character varying, 'startup'::character varying, 'unknown'::character varying])::text[]));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_customer_count_check" CHECK (customer_count >= 0);
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_customer_satisfaction_score_check" CHECK ((customer_satisfaction_score >= (0)::numeric) AND (customer_satisfaction_score <= (100)::numeric));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_employee_count_check" CHECK (employee_count >= 0);
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_financial_risk_score_check" CHECK ((financial_risk_score >= (0)::numeric) AND (financial_risk_score <= (1)::numeric));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_founded_year_check" CHECK ((founded_year > 1900) AND (founded_year <= 2025));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_last_funding_amount_check" CHECK (last_funding_amount >= (0)::numeric);
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_market_position_check" CHECK ((market_position)::text = ANY ((ARRAY['leader'::character varying, 'challenger'::character varying, 'niche'::character varying, 'declining'::character varying, 'emerging'::character varying])::text[]));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_profitability_check" CHECK ((profitability)::text = ANY ((ARRAY['profitable'::character varying, 'break-even'::character varying, 'burning-cash'::character varying, 'unknown'::character varying])::text[]));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_support_quality_rating_check" CHECK ((support_quality_rating >= (1)::numeric) AND (support_quality_rating <= (5)::numeric));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_technology_risk_check" CHECK ((technology_risk)::text = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying, 'unknown'::character varying])::text[]));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_vendor_lock_in_severity_check" CHECK ((vendor_lock_in_severity)::text = ANY ((ARRAY['severe'::character varying, 'moderate'::character varying, 'low'::character varying, 'minimal'::character varying])::text[]));
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "2200_24655_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "2200_24655_2_not_null" CHECK vendor_name IS NOT NULL;
ALTER TABLE "public"."vendor_intelligence" ADD CONSTRAINT "vendor_intelligence_vendor_name_key" UNIQUE ("vendor_name");

-- Table: "public"."vendors"
CREATE TABLE "public"."vendors" (
    "vendor_id" CHARACTER VARYING(50) NOT NULL,
    "vendor_name" CHARACTER VARYING(200) NOT NULL,
    "vendor_type" CHARACTER VARYING(100),
    "industry" CHARACTER VARYING(100),
    "headquarters" CHARACTER VARYING(200),
    "country" CHARACTER VARYING(100),
    "website" CHARACTER VARYING(500),
    "relationship_type" CHARACTER VARYING(100),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("vendor_id")
);
ALTER TABLE "public"."vendors" ADD CONSTRAINT "2200_57370_1_not_null" CHECK vendor_id IS NOT NULL;
ALTER TABLE "public"."vendors" ADD CONSTRAINT "2200_57370_2_not_null" CHECK vendor_name IS NOT NULL;

-- Table: "public"."workflow_automations"
CREATE TABLE "public"."workflow_automations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "workflow_name" CHARACTER VARYING(200) NOT NULL,
    "workflow_code" CHARACTER VARYING(50) NOT NULL,
    "replaces_software_id" UUID,
    "workflow_category" CHARACTER VARYING(100),
    "workflow_description" TEXT,
    "implementation_type" CHARACTER VARYING(50),
    "workflow_status" CHARACTER VARYING(50) NOT NULL,
    "code_repository_url" TEXT,
    "deployment_url" TEXT,
    "trigger_type" CHARACTER VARYING(100),
    "trigger_schedule" CHARACTER VARYING(100),
    "input_sources" TEXT[],
    "output_destinations" TEXT[],
    "error_handling" TEXT,
    "executions_per_day" INTEGER,
    "success_rate" NUMERIC,
    "average_execution_time_seconds" INTEGER,
    "cost_per_execution" NUMERIC,
    "monthly_execution_cost" NUMERIC,
    "manual_effort_hours_saved" NUMERIC,
    "annual_cost_savings" NUMERIC,
    "error_reduction_percentage" NUMERIC,
    "time_savings_percentage" NUMERIC,
    "last_execution_date" TIMESTAMPTZ,
    "last_success_date" TIMESTAMPTZ,
    "last_failure_date" TIMESTAMPTZ,
    "consecutive_failures" INTEGER DEFAULT 0,
    "alert_email" TEXT,
    "alert_threshold" INTEGER DEFAULT 3,
    "last_updated_date" DATE,
    "next_review_date" DATE,
    "maintainer" CHARACTER VARYING(200),
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "created_by" CHARACTER VARYING(200),
    "company_id" UUID,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_annual_cost_savings_check" CHECK (annual_cost_savings >= (0)::numeric);
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_average_execution_time_seconds_check" CHECK (average_execution_time_seconds >= 0);
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_cost_per_execution_check" CHECK (cost_per_execution >= (0)::numeric);
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_error_reduction_percentage_check" CHECK ((error_reduction_percentage >= (0)::numeric) AND (error_reduction_percentage <= (100)::numeric));
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_executions_per_day_check" CHECK (executions_per_day >= 0);
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_implementation_type_check" CHECK ((implementation_type)::text = ANY ((ARRAY['claude-api'::character varying, 'n8n'::character varying, 'zapier'::character varying, 'custom-code'::character varying, 'python'::character varying, 'nodejs'::character varying, 'hybrid'::character varying])::text[]));
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_manual_effort_hours_saved_check" CHECK (manual_effort_hours_saved >= (0)::numeric);
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_success_rate_check" CHECK ((success_rate >= (0)::numeric) AND (success_rate <= (100)::numeric));
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_workflow_status_check" CHECK ((workflow_status)::text = ANY ((ARRAY['development'::character varying, 'testing'::character varying, 'production'::character varying, 'retired'::character varying, 'failed'::character varying])::text[]));
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "2200_24886_1_not_null" CHECK id IS NOT NULL;
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "2200_24886_2_not_null" CHECK workflow_name IS NOT NULL;
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "2200_24886_3_not_null" CHECK workflow_code IS NOT NULL;
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "2200_24886_8_not_null" CHECK workflow_status IS NOT NULL;
ALTER TABLE "public"."workflow_automations" ADD CONSTRAINT "workflow_automations_workflow_code_key" UNIQUE ("workflow_code");


-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

ALTER TABLE "public"."activity_log" 
    ADD CONSTRAINT "activity_log_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."activity_log" 
    ADD CONSTRAINT "activity_log_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "public"."users" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."ai_agent_analyses" 
    ADD CONSTRAINT "ai_agent_analyses_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."ai_agent_analyses" 
    ADD CONSTRAINT "ai_agent_analyses_software_id_fkey" 
    FOREIGN KEY ("software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."alternative_solutions" 
    ADD CONSTRAINT "alternative_solutions_original_software_id_fkey" 
    FOREIGN KEY ("original_software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."client_reports" 
    ADD CONSTRAINT "client_reports_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."client_reports" 
    ADD CONSTRAINT "client_reports_generated_by_fkey" 
    FOREIGN KEY ("generated_by") 
    REFERENCES "public"."users" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."companies" 
    ADD CONSTRAINT "companies_created_by_fkey" 
    FOREIGN KEY ("created_by") 
    REFERENCES "public"."users" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."company_metrics" 
    ADD CONSTRAINT "company_metrics_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."company_users" 
    ADD CONSTRAINT "company_users_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."company_users" 
    ADD CONSTRAINT "company_users_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "public"."users" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."consolidation_recommendations" 
    ADD CONSTRAINT "consolidation_recommendations_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."contacts" 
    ADD CONSTRAINT "contacts_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."contracts" 
    ADD CONSTRAINT "contracts_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."contracts" 
    ADD CONSTRAINT "contracts_vendor_id_fkey" 
    FOREIGN KEY ("vendor_id") 
    REFERENCES "public"."vendors" ("vendor_id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."feature_categories" 
    ADD CONSTRAINT "feature_categories_parent_category_id_fkey" 
    FOREIGN KEY ("parent_category_id") 
    REFERENCES "public"."feature_categories" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."feature_comparison_matrix" 
    ADD CONSTRAINT "feature_comparison_matrix_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."feature_comparison_matrix" 
    ADD CONSTRAINT "feature_comparison_matrix_software_id_1_fkey" 
    FOREIGN KEY ("software_id_1") 
    REFERENCES "public"."software" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."feature_comparison_matrix" 
    ADD CONSTRAINT "feature_comparison_matrix_software_id_2_fkey" 
    FOREIGN KEY ("software_id_2") 
    REFERENCES "public"."software" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."feature_overlaps" 
    ADD CONSTRAINT "feature_overlaps_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."feature_overlaps" 
    ADD CONSTRAINT "feature_overlaps_feature_category_id_fkey" 
    FOREIGN KEY ("feature_category_id") 
    REFERENCES "public"."feature_categories" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."initiatives" 
    ADD CONSTRAINT "initiatives_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."initiatives" 
    ADD CONSTRAINT "initiatives_owner_contact_id_fkey" 
    FOREIGN KEY ("owner_contact_id") 
    REFERENCES "public"."contacts" ("contact_id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."integration_dependencies" 
    ADD CONSTRAINT "integration_dependencies_source_software_id_fkey" 
    FOREIGN KEY ("source_software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."integration_dependencies" 
    ADD CONSTRAINT "integration_dependencies_target_software_id_fkey" 
    FOREIGN KEY ("target_software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."intelligence_notes" 
    ADD CONSTRAINT "intelligence_notes_author_user_id_fkey" 
    FOREIGN KEY ("author_user_id") 
    REFERENCES "public"."users" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."intelligence_notes" 
    ADD CONSTRAINT "intelligence_notes_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."negotiation_outcomes" 
    ADD CONSTRAINT "negotiation_outcomes_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."negotiation_outcomes" 
    ADD CONSTRAINT "negotiation_outcomes_playbook_id_fkey" 
    FOREIGN KEY ("playbook_id") 
    REFERENCES "public"."negotiation_playbooks" ("id")
    ON DELETE SET NULL
    ON UPDATE NO ACTION;

ALTER TABLE "public"."negotiation_outcomes" 
    ADD CONSTRAINT "negotiation_outcomes_software_id_fkey" 
    FOREIGN KEY ("software_id") 
    REFERENCES "public"."software" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."negotiation_playbooks" 
    ADD CONSTRAINT "negotiation_playbooks_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."negotiation_playbooks" 
    ADD CONSTRAINT "negotiation_playbooks_software_id_fkey" 
    FOREIGN KEY ("software_id") 
    REFERENCES "public"."software" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."opportunities" 
    ADD CONSTRAINT "opportunities_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."pain_points" 
    ADD CONSTRAINT "pain_points_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."prism_savings_log" 
    ADD CONSTRAINT "prism_savings_log_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."prism_savings_log" 
    ADD CONSTRAINT "prism_savings_log_created_by_fkey" 
    FOREIGN KEY ("created_by") 
    REFERENCES "public"."users" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."renewal_negotiations" 
    ADD CONSTRAINT "renewal_negotiations_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."renewal_negotiations" 
    ADD CONSTRAINT "renewal_negotiations_software_id_fkey" 
    FOREIGN KEY ("software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."replacement_projects" 
    ADD CONSTRAINT "replacement_projects_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."replacement_projects" 
    ADD CONSTRAINT "replacement_projects_new_solution_id_fkey" 
    FOREIGN KEY ("new_solution_id") 
    REFERENCES "public"."alternative_solutions" ("id")
    ON DELETE RESTRICT
    ON UPDATE NO ACTION;

ALTER TABLE "public"."replacement_projects" 
    ADD CONSTRAINT "replacement_projects_old_software_id_fkey" 
    FOREIGN KEY ("old_software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE RESTRICT
    ON UPDATE NO ACTION;

ALTER TABLE "public"."software" 
    ADD CONSTRAINT "software_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."software" 
    ADD CONSTRAINT "software_logo_id_fkey" 
    FOREIGN KEY ("logo_id") 
    REFERENCES "public"."brand_logos" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."software_assets" 
    ADD CONSTRAINT "software_assets_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."software_features" 
    ADD CONSTRAINT "software_features_feature_category_id_fkey" 
    FOREIGN KEY ("feature_category_id") 
    REFERENCES "public"."feature_categories" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."software_features" 
    ADD CONSTRAINT "software_features_software_catalog_id_fkey" 
    FOREIGN KEY ("software_catalog_id") 
    REFERENCES "public"."software_catalog" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."software_features_mapping" 
    ADD CONSTRAINT "software_features_mapping_feature_category_id_fkey" 
    FOREIGN KEY ("feature_category_id") 
    REFERENCES "public"."feature_categories" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."software_features_mapping" 
    ADD CONSTRAINT "software_features_mapping_software_id_fkey" 
    FOREIGN KEY ("software_id") 
    REFERENCES "public"."software" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."technologies" 
    ADD CONSTRAINT "technologies_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."usage_analytics" 
    ADD CONSTRAINT "usage_analytics_software_id_fkey" 
    FOREIGN KEY ("software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."workflow_automations" 
    ADD CONSTRAINT "workflow_automations_company_id_fkey" 
    FOREIGN KEY ("company_id") 
    REFERENCES "public"."companies" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."workflow_automations" 
    ADD CONSTRAINT "workflow_automations_replaces_software_id_fkey" 
    FOREIGN KEY ("replaces_software_id") 
    REFERENCES "public"."software_assets" ("id")
    ON DELETE SET NULL
    ON UPDATE NO ACTION;



-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_activity_company ON public.activity_log USING btree (company_id);
CREATE INDEX idx_activity_date ON public.activity_log USING btree (created_at);
CREATE INDEX idx_analysis_agent ON public.ai_agent_analyses USING btree (agent_name);
CREATE INDEX idx_analysis_date ON public.ai_agent_analyses USING btree (analysis_date);
CREATE INDEX idx_analysis_software ON public.ai_agent_analyses USING btree (software_id);
CREATE INDEX idx_analysis_status ON public.ai_agent_analyses USING btree (review_status);
CREATE INDEX idx_analysis_type ON public.ai_agent_analyses USING btree (analysis_type);
CREATE INDEX idx_alt_original_software ON public.alternative_solutions USING btree (original_software_id);
CREATE INDEX idx_alt_recommendation ON public.alternative_solutions USING btree (recommendation_status);
CREATE INDEX idx_alt_savings ON public.alternative_solutions USING btree (cost_savings_percentage);
CREATE INDEX idx_alt_type ON public.alternative_solutions USING btree (alternative_type);
CREATE UNIQUE INDEX brand_logos_company_name_vendor_name_key ON public.brand_logos USING btree (company_name, vendor_name);
CREATE INDEX idx_brand_logos_company ON public.brand_logos USING btree (company_name);
CREATE INDEX idx_brand_logos_vendor ON public.brand_logos USING btree (vendor_name);
CREATE INDEX idx_reports_company ON public.client_reports USING btree (company_id);
CREATE INDEX idx_reports_date ON public.client_reports USING btree (generated_at);
CREATE UNIQUE INDEX companies_slug_key ON public.companies USING btree (slug);
CREATE INDEX idx_companies_industry ON public.companies USING btree (industry);
CREATE INDEX idx_companies_name ON public.companies USING btree (company_name);
CREATE INDEX idx_companies_slug ON public.companies USING btree (slug);
CREATE INDEX idx_companies_status ON public.companies USING btree (contract_status);
CREATE INDEX idx_company_metrics_category ON public.company_metrics USING btree (metric_category);
CREATE INDEX idx_company_metrics_company ON public.company_metrics USING btree (company_id);
CREATE INDEX idx_company_metrics_year ON public.company_metrics USING btree (fiscal_year);
CREATE UNIQUE INDEX company_users_company_id_user_id_key ON public.company_users USING btree (company_id, user_id);
CREATE INDEX idx_company_users_company ON public.company_users USING btree (company_id);
CREATE INDEX idx_company_users_user ON public.company_users USING btree (user_id);
CREATE INDEX idx_contacts_company ON public.contacts USING btree (company_id);
CREATE INDEX idx_contacts_decision_maker ON public.contacts USING btree (is_decision_maker);
CREATE INDEX idx_contacts_seniority ON public.contacts USING btree (seniority_level);
CREATE INDEX idx_contracts_company ON public.contracts USING btree (company_id);
CREATE INDEX idx_contracts_end_date ON public.contracts USING btree (end_date);
CREATE INDEX idx_contracts_status ON public.contracts USING btree (status);
CREATE INDEX idx_contracts_vendor ON public.contracts USING btree (vendor_id);
CREATE UNIQUE INDEX feature_analysis_cache_software_name_key ON public.feature_analysis_cache USING btree (software_name);
CREATE INDEX idx_analysis_cache_date ON public.feature_analysis_cache USING btree (analysis_date DESC);
CREATE INDEX idx_analysis_cache_software ON public.feature_analysis_cache USING btree (software_name);
CREATE UNIQUE INDEX feature_categories_category_name_key ON public.feature_categories USING btree (category_name);
CREATE INDEX idx_feature_categories_parent ON public.feature_categories USING btree (parent_category_id);
CREATE UNIQUE INDEX feature_comparison_matrix_company_id_software_id_1_software_key ON public.feature_comparison_matrix USING btree (company_id, software_id_1, software_id_2);
CREATE INDEX idx_feature_overlaps_category ON public.feature_overlaps USING btree (feature_category_id);
CREATE INDEX idx_feature_overlaps_company ON public.feature_overlaps USING btree (company_id);
CREATE INDEX idx_feature_overlaps_status ON public.feature_overlaps USING btree (status);
CREATE INDEX idx_initiatives_category ON public.initiatives USING btree (category);
CREATE INDEX idx_initiatives_company ON public.initiatives USING btree (company_id);
CREATE INDEX idx_initiatives_status ON public.initiatives USING btree (status);
CREATE INDEX idx_integration_blocker ON public.integration_dependencies USING btree (replacement_blocker);
CREATE INDEX idx_integration_criticality ON public.integration_dependencies USING btree (business_criticality);
CREATE INDEX idx_integration_source ON public.integration_dependencies USING btree (source_software_id);
CREATE INDEX idx_integration_target ON public.integration_dependencies USING btree (target_software_id);
CREATE INDEX idx_intelligence_notes_category ON public.intelligence_notes USING btree (category);
CREATE INDEX idx_intelligence_notes_company ON public.intelligence_notes USING btree (company_id);
CREATE INDEX idx_intelligence_notes_date ON public.intelligence_notes USING btree (note_date);
CREATE INDEX idx_intelligence_notes_tags ON public.intelligence_notes USING gin (tags);
CREATE INDEX idx_market_data_software ON public.negotiation_market_data USING btree (software_name, vendor_name);
CREATE UNIQUE INDEX negotiation_market_data_software_name_vendor_name_key ON public.negotiation_market_data USING btree (software_name, vendor_name);
CREATE INDEX idx_negotiation_outcomes_company ON public.negotiation_outcomes USING btree (company_id);
CREATE INDEX idx_negotiation_outcomes_software ON public.negotiation_outcomes USING btree (software_id);
CREATE INDEX idx_negotiation_playbooks_company ON public.negotiation_playbooks USING btree (company_id);
CREATE INDEX idx_negotiation_playbooks_software ON public.negotiation_playbooks USING btree (software_id);
CREATE INDEX idx_opportunities_company ON public.opportunities USING btree (company_id);
CREATE INDEX idx_opportunities_priority ON public.opportunities USING btree (priority);
CREATE INDEX idx_opportunities_status ON public.opportunities USING btree (status);
CREATE INDEX idx_pain_points_category ON public.pain_points USING btree (category);
CREATE INDEX idx_pain_points_company ON public.pain_points USING btree (company_id);
CREATE INDEX idx_pain_points_severity ON public.pain_points USING btree (severity);
CREATE INDEX idx_prism_savings_company ON public.prism_savings_log USING btree (company_id);
CREATE INDEX idx_prism_savings_created ON public.prism_savings_log USING btree (created_at DESC);
CREATE INDEX idx_renewal_date ON public.renewal_negotiations USING btree (renewal_date);
CREATE INDEX idx_renewal_savings ON public.renewal_negotiations USING btree (savings_achieved);
CREATE INDEX idx_renewal_software ON public.renewal_negotiations USING btree (software_id);
CREATE INDEX idx_renewal_status ON public.renewal_negotiations USING btree (negotiation_status);
CREATE INDEX idx_project_completion_date ON public.replacement_projects USING btree (target_completion_date);
CREATE INDEX idx_project_old_software ON public.replacement_projects USING btree (old_software_id);
CREATE INDEX idx_project_roi ON public.replacement_projects USING btree (roi_months);
CREATE INDEX idx_project_status ON public.replacement_projects USING btree (project_status);
CREATE UNIQUE INDEX replacement_projects_project_code_key ON public.replacement_projects USING btree (project_code);
CREATE UNIQUE INDEX software_company_id_software_name_key ON public.software USING btree (company_id, software_name);
CREATE INDEX idx_software_business_criticality ON public.software_assets USING btree (business_criticality);
CREATE INDEX idx_software_category ON public.software_assets USING btree (category);
CREATE INDEX idx_software_company ON public.software_assets USING btree (company_id);
CREATE INDEX idx_software_days_to_renewal ON public.software_assets USING btree (days_to_renewal);
CREATE INDEX idx_software_renewal_date ON public.software_assets USING btree (renewal_date);
CREATE INDEX idx_software_replacement_priority ON public.software_assets USING btree (replacement_priority);
CREATE INDEX idx_software_vendor ON public.software_assets USING btree (vendor_name);
CREATE UNIQUE INDEX software_assets_asset_code_key ON public.software_assets USING btree (asset_code);
CREATE UNIQUE INDEX unique_software_per_company ON public.software_assets USING btree (company_id, software_name, vendor_name);
CREATE INDEX idx_software_catalog_category ON public.software_catalog USING btree (category);
CREATE INDEX idx_software_catalog_name ON public.software_catalog USING btree (software_name);
CREATE INDEX idx_software_catalog_vendor ON public.software_catalog USING btree (vendor_name);
CREATE UNIQUE INDEX software_catalog_software_name_key ON public.software_catalog USING btree (software_name);
CREATE INDEX idx_software_features_catalog ON public.software_features USING btree (software_catalog_id);
CREATE INDEX idx_software_features_category ON public.software_features USING btree (feature_category_id);
CREATE INDEX idx_software_features_name ON public.software_features USING btree (feature_name);
CREATE UNIQUE INDEX software_features_software_catalog_id_feature_name_key ON public.software_features USING btree (software_catalog_id, feature_name);
CREATE UNIQUE INDEX software_features_mapping_software_id_feature_name_key ON public.software_features_mapping USING btree (software_id, feature_name);
CREATE INDEX idx_technologies_category ON public.technologies USING btree (category);
CREATE INDEX idx_technologies_company ON public.technologies USING btree (company_id);
CREATE INDEX idx_technologies_status ON public.technologies USING btree (status);
CREATE INDEX idx_technologies_vendor ON public.technologies USING btree (vendor);
CREATE INDEX idx_usage_date ON public.usage_analytics USING btree (analysis_date);
CREATE INDEX idx_usage_software ON public.usage_analytics USING btree (software_id);
CREATE INDEX idx_usage_waste ON public.usage_analytics USING btree (waste_amount);
CREATE UNIQUE INDEX usage_analytics_software_id_analysis_date_key ON public.usage_analytics USING btree (software_id, analysis_date);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE INDEX idx_vendor_last_researched ON public.vendor_intelligence USING btree (last_researched_date);
CREATE INDEX idx_vendor_market_position ON public.vendor_intelligence USING btree (market_position);
CREATE INDEX idx_vendor_name ON public.vendor_intelligence USING btree (vendor_name);
CREATE INDEX idx_vendor_risk_score ON public.vendor_intelligence USING btree (financial_risk_score);
CREATE UNIQUE INDEX vendor_intelligence_vendor_name_key ON public.vendor_intelligence USING btree (vendor_name);
CREATE INDEX idx_vendors_relationship ON public.vendors USING btree (relationship_type);
CREATE INDEX idx_vendors_type ON public.vendors USING btree (vendor_type);
CREATE INDEX idx_workflow_last_execution ON public.workflow_automations USING btree (last_execution_date);
CREATE INDEX idx_workflow_replaces ON public.workflow_automations USING btree (replaces_software_id);
CREATE INDEX idx_workflow_savings ON public.workflow_automations USING btree (annual_cost_savings);
CREATE INDEX idx_workflow_status ON public.workflow_automations USING btree (workflow_status);
CREATE UNIQUE INDEX workflow_automations_workflow_code_key ON public.workflow_automations USING btree (workflow_code);
