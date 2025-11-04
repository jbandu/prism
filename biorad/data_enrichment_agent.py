"""
PRISM Data Enrichment Agent
Uses Claude AI to enrich software data with comprehensive metadata
"""

import csv
import json
import os
import sys
import time
from datetime import datetime, timedelta
from decimal import Decimal
import random
import anthropic
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import Json
import uuid

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import Database

load_dotenv()

class DataEnrichmentAgent:
    def __init__(self):
        self.anthropic_client = anthropic.Anthropic(
            api_key=os.getenv('ANTHROPIC_API_KEY')
        )
        self.db = Database()
        self.company_id = None
        self.enriched_count = 0
        self.failed_count = 0
        self.feature_categories = {}
        
    def initialize_company(self, company_name='BioRad Laboratories'):
        """Get or create company"""
        print(f"\n🏢 Initializing company: {company_name}")
        
        query = "SELECT id FROM companies WHERE company_name = %s"
        result = self.db.execute_query(query, (company_name,))
        
        if not result:
            # Create company
            self.company_id = str(uuid.uuid4())
            insert_query = """
                INSERT INTO companies (id, company_name, industry, headquarters_location, employee_count, revenue_range)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            self.db.execute_update(insert_query, (
                self.company_id,
                company_name,
                'Life Sciences & Biotechnology',
                'Hercules, California',
                8000,
                '$2.8B'
            ))
            print(f"✅ Created company: {self.company_id}")
        else:
            self.company_id = result[0]['id']
            print(f"✅ Found existing company: {self.company_id}")
    
    def load_feature_categories(self):
        """Load feature category mappings"""
        print("\n📋 Loading feature categories...")
        
        query = "SELECT id, category_name FROM feature_categories"
        results = self.db.execute_query(query)
        
        for row in results:
            self.feature_categories[row['category_name']] = row['id']
        
        print(f"✅ Loaded {len(self.feature_categories)} feature categories")
    
    def generate_random_renewal_date(self):
        """Generate random renewal date in next 1-6 months"""
        days_ahead = random.randint(30, 180)
        renewal_date = datetime.now() + timedelta(days=days_ahead)
        return renewal_date.strftime('%Y-%m-%d')
    
    def generate_contract_start_date(self):
        """Generate contract start date 1-5 years ago"""
        years_ago = random.randint(1, 5)
        start_date = datetime.now() - timedelta(days=years_ago*365)
        return start_date.strftime('%Y-%m-%d')
    
    def enrich_software_data(self, software_name: str, description: str) -> dict:
        """
        Use Claude to extract comprehensive software metadata
        """
        print(f"\n🤖 Enriching: {software_name}")
        print(f"   Description: {description[:100]}...")
        
        prompt = f"""You are a software intelligence expert. Analyze this enterprise software product and extract comprehensive metadata.

SOFTWARE: {software_name}
DESCRIPTION: {description}

Extract the following information in JSON format:

{{
  "vendor_name": "Company that makes this software",
  "category": "Choose ONE from: ERP/Financial, CRM, ITSM/Service Desk, Productivity Suite, Collaboration, Project Management, Business Intelligence, Cloud Infrastructure, HR/HCM, Marketing, Development Tools, Security, Data/Analytics, Other",
  "pricing": {{
    "license_type": "Per User | Per Month | Usage Based | Flat Fee | Enterprise",
    "estimated_annual_cost_range": {{
      "min": 50000,
      "max": 500000
    }},
    "typical_cost_for_8000_employees": 250000
  }},
  "usage": {{
    "estimated_total_licenses": 1000,
    "estimated_active_users": 850,
    "utilization_rate": 85.0
  }},
  "business_context": {{
    "primary_use_case": "One sentence describing main purpose",
    "business_criticality": "Critical | High | Medium | Low",
    "business_owner_role": "CFO | CTO | CIO | VP Sales | etc",
    "technical_owner_role": "IT Director | DevOps | Cloud Ops | etc"
  }},
  "contract": {{
    "contract_term_years": 3,
    "auto_renewal": true,
    "payment_terms": "Net 30 | Net 60 | Annual Prepay | Monthly"
  }},
  "technical": {{
    "deployment_type": "Cloud | On-Premise | Hybrid",
    "integration_complexity": "Low | Medium | High | Very High"
  }},
  "replacement": {{
    "replacement_priority": "Low | Medium | High",
    "ai_replacement_candidate": true,
    "replacement_feasibility_score": 0.65,
    "reason": "Brief explanation why it could be replaced"
  }},
  "features": [
    {{
      "feature_name": "Task Management",
      "category": "Task Management",
      "description": "Create and assign tasks",
      "is_core": true,
      "requires_premium": false
    }},
    {{
      "feature_name": "Reporting Dashboard",
      "category": "Reporting & Analytics",
      "description": "Visual analytics dashboards",
      "is_core": true,
      "requires_premium": false
    }}
  ]
}}

Be realistic and specific. For BioRad (8,000 employees, $2.8B revenue), provide accurate enterprise pricing.

IMPORTANT GUIDELINES:
1. Pricing: Consider enterprise scale (8,000 users)
2. Usage: Be realistic - not everything is 100% utilized
3. Business Criticality: 
   - Critical: Company can't operate without it (ERP, Email, Core Systems)
   - High: Major impact if unavailable (CRM, ITSM, Analytics)
   - Medium: Important but not critical (Project Management, Collaboration)
   - Low: Nice to have (Some specialty tools)
4. Replacement Priority:
   - High: Easy to replace, good alternatives exist, overlapping features
   - Medium: Possible to replace but needs planning
   - Low: Mission critical or highly integrated
5. Features: Extract 10-20 key features minimum

Return ONLY valid JSON, no markdown formatting.
"""

        try:
            message = self.anthropic_client.messages.create(
                model='claude-sonnet-4-20250514',
                max_tokens=4000,
                temperature=0.3,
                messages=[{'role': 'user', 'content': prompt}]
            )
            
            response_text = message.content[0].text
            
            # Extract JSON (remove markdown if present)
            response_text = response_text.strip()
            if response_text.startswith('```'):
                # Remove markdown code blocks
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            enriched_data = json.loads(response_text)
            
            print(f"   ✅ Enriched successfully")
            print(f"      Vendor: {enriched_data['vendor_name']}")
            print(f"      Category: {enriched_data['category']}")
            print(f"      Est. Cost: ${enriched_data['pricing']['typical_cost_for_8000_employees']:,}")
            print(f"      Features: {len(enriched_data['features'])}")
            
            return enriched_data
            
        except json.JSONDecodeError as e:
            print(f"   ❌ JSON Parse Error: {e}")
            print(f"      Response: {response_text[:200]}...")
            return None
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return None
    
    def save_to_database(self, software_name: str, description: str, enriched_data: dict):
        """Save enriched data to database"""
        print(f"\n💾 Saving to database: {software_name}")
        
        try:
            software_id = str(uuid.uuid4())
            
            # Calculate days to renewal
            renewal_date = self.generate_random_renewal_date()
            renewal_dt = datetime.strptime(renewal_date, '%Y-%m-%d')
            days_to_renewal = (renewal_dt - datetime.now()).days
            
            # Insert into software_assets
            insert_software = """
                INSERT INTO software_assets (
                    id, company_id, software_name, vendor_name, category,
                    description, total_annual_cost, license_type, 
                    total_licenses, active_users, utilization_rate,
                    renewal_date, contract_start_date,
                    business_criticality, primary_use_case,
                    business_owner, technical_owner,
                    auto_renewal, payment_terms, contract_term_years,
                    deployment_type, integration_complexity,
                    replacement_priority, ai_replacement_candidate,
                    days_to_renewal, replacement_feasibility_score
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """
            
            self.db.execute_update(insert_software, (
                software_id,
                self.company_id,
                software_name,
                enriched_data['vendor_name'],
                enriched_data['category'],
                description,
                enriched_data['pricing']['typical_cost_for_8000_employees'],
                enriched_data['pricing']['license_type'],
                enriched_data['usage']['estimated_total_licenses'],
                enriched_data['usage']['estimated_active_users'],
                enriched_data['usage']['utilization_rate'],
                renewal_date,
                self.generate_contract_start_date(),
                enriched_data['business_context']['business_criticality'],
                enriched_data['business_context']['primary_use_case'],
                enriched_data['business_context']['business_owner_role'],
                enriched_data['business_context']['technical_owner_role'],
                enriched_data['contract']['auto_renewal'],
                enriched_data['contract']['payment_terms'],
                enriched_data['contract']['contract_term_years'],
                enriched_data['technical']['deployment_type'],
                enriched_data['technical']['integration_complexity'],
                enriched_data['replacement']['replacement_priority'],
                enriched_data['replacement']['ai_replacement_candidate'],
                days_to_renewal,
                enriched_data['replacement']['replacement_feasibility_score']
            ))
            
            print(f"   ✅ Saved software_assets")
            
            # Save to software_catalog if not exists
            catalog_check = self.db.execute_query(
                "SELECT id FROM software_catalog WHERE software_name = %s",
                (software_name,)
            )
            
            if not catalog_check:
                catalog_id = str(uuid.uuid4())
                insert_catalog = """
                    INSERT INTO software_catalog (
                        id, software_name, vendor_name, category, description,
                        pricing_model, min_price, max_price, total_features_count
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                self.db.execute_update(insert_catalog, (
                    catalog_id,
                    software_name,
                    enriched_data['vendor_name'],
                    enriched_data['category'],
                    description,
                    enriched_data['pricing']['license_type'],
                    enriched_data['pricing']['estimated_annual_cost_range']['min'],
                    enriched_data['pricing']['estimated_annual_cost_range']['max'],
                    len(enriched_data['features'])
                ))
                print(f"   ✅ Saved software_catalog")
            else:
                catalog_id = catalog_check[0]['id']
                print(f"   ℹ️  Software already in catalog")
            
            # Save features
            features_saved = 0
            for feature in enriched_data['features']:
                # Get category ID
                category_id = self.feature_categories.get(feature['category'])
                
                if category_id:
                    try:
                        insert_feature = """
                            INSERT INTO software_features (
                                id, software_catalog_id, feature_category_id,
                                feature_name, feature_description,
                                is_core_feature, requires_premium
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (software_catalog_id, feature_name) DO NOTHING
                        """
                        self.db.execute_update(insert_feature, (
                            str(uuid.uuid4()),
                            catalog_id,
                            category_id,
                            feature['feature_name'],
                            feature['description'],
                            feature['is_core'],
                            feature['requires_premium']
                        ))
                        features_saved += 1
                    except Exception as e:
                        print(f"      ⚠️  Feature error: {feature['feature_name']}")
            
            print(f"   ✅ Saved {features_saved} features")
            
            # Cache the analysis
            cache_insert = """
                INSERT INTO feature_analysis_cache (
                    id, software_name, extracted_features, feature_count,
                    source, confidence_score
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (software_name) DO UPDATE SET
                    extracted_features = EXCLUDED.extracted_features,
                    feature_count = EXCLUDED.feature_count,
                    analysis_date = NOW()
            """
            self.db.execute_update(cache_insert, (
                str(uuid.uuid4()),
                software_name,
                Json(enriched_data['features']),
                len(enriched_data['features']),
                'ai_extraction',
                0.85
            ))
            
            print(f"   ✅ Cached analysis")
            
            self.enriched_count += 1
            return True
            
        except Exception as e:
            print(f"   ❌ Database error: {e}")
            import traceback
            traceback.print_exc()
            self.failed_count += 1
            return False
    
    def process_csv(self, csv_file_path: str, batch_size: int = 5):
        """Process CSV file with software data"""
        print(f"\n📂 Reading CSV: {csv_file_path}")
        
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            software_list = list(reader)
        
        print(f"✅ Found {len(software_list)} software products to enrich")
        
        for idx, row in enumerate(software_list, 1):
            software_name = row['software_name'].strip()
            description = row['description'].strip()
            
            print(f"\n{'='*60}")
            print(f"Processing {idx}/{len(software_list)}: {software_name}")
            print(f"{'='*60}")
            
            # Enrich with AI
            enriched_data = self.enrich_software_data(software_name, description)
            
            if enriched_data:
                # Save to database
                success = self.save_to_database(software_name, description, enriched_data)
                
                if success:
                    print(f"✅ Successfully processed {software_name}")
                else:
                    print(f"❌ Failed to save {software_name}")
            else:
                print(f"❌ Failed to enrich {software_name}")
                self.failed_count += 1
            
            # Rate limiting (Claude API)
            if idx % batch_size == 0 and idx < len(software_list):
                print(f"\n⏸️  Batch complete. Waiting 5 seconds...")
                time.sleep(5)
            else:
                time.sleep(1)  # Small delay between requests
        
        # Final summary
        print(f"\n{'='*60}")
        print(f"🎉 ENRICHMENT COMPLETE")
        print(f"{'='*60}")
        print(f"✅ Successfully enriched: {self.enriched_count}")
        print(f"❌ Failed: {self.failed_count}")
        print(f"📊 Success rate: {(self.enriched_count / len(software_list) * 100):.1f}%")
        print(f"{'='*60}")
    
    def run(self, csv_file_path: str):
        """Main execution flow"""
        print("=" * 60)
        print("🚀 PRISM DATA ENRICHMENT AGENT")
        print("=" * 60)
        
        # Initialize
        self.initialize_company()
        self.load_feature_categories()
        
        # Process CSV
        self.process_csv(csv_file_path)
        
        print("\n✅ Agent execution complete!")


if __name__ == "__main__":
    # Usage
    agent = DataEnrichmentAgent()
    
    # Path to your CSV file - use FINAL processed BioRad data
    csv_file = 'biorad_software_final_processed.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ Error: File not found: {csv_file}")
        print(f"\nLooking for the final processed BioRad data.")
        print(f"Please ensure biorad_software_final_processed.csv is in the current directory.")
        print(f"\nThis should contain 95 unique software products from BioRad's $49M portfolio.")
        sys.exit(1)
    
    agent.run(csv_file)
