#!/usr/bin/env python3
"""
Quick Test Script - Validates Setup Before Full Enrichment
Tests with just 1 product to make sure everything works
"""

import os
import sys
import csv
from dotenv import load_dotenv

load_dotenv()

def test_environment():
    """Test environment variables"""
    print("\n" + "="*60)
    print("🔍 TESTING ENVIRONMENT SETUP")
    print("="*60)
    
    issues = []
    
    # Check ANTHROPIC_API_KEY
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        issues.append("❌ ANTHROPIC_API_KEY not set in .env")
    elif api_key.startswith('sk-ant-'):
        print("✅ ANTHROPIC_API_KEY found")
    else:
        issues.append("⚠️  ANTHROPIC_API_KEY doesn't look right (should start with 'sk-ant-')")
    
    # Check DATABASE_URL
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        issues.append("❌ DATABASE_URL not set in .env")
    elif 'postgres' in db_url:
        print("✅ DATABASE_URL found")
    else:
        issues.append("⚠️  DATABASE_URL doesn't look right (should contain 'postgres')")
    
    return issues

def test_database_connection():
    """Test database connection"""
    print("\n" + "="*60)
    print("🔍 TESTING DATABASE CONNECTION")
    print("="*60)
    
    try:
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from database.db import Database
        
        db = Database()
        
        # Test query
        result = db.execute_query("SELECT 1 as test")
        if result and result[0]['test'] == 1:
            print("✅ Database connection successful")
            return []
        else:
            return ["❌ Database query returned unexpected result"]
            
    except Exception as e:
        return [f"❌ Database connection failed: {e}"]

def test_feature_categories():
    """Test if feature categories are seeded"""
    print("\n" + "="*60)
    print("🔍 TESTING FEATURE CATEGORIES")
    print("="*60)
    
    try:
        from database.db import Database
        db = Database()
        
        result = db.execute_query("SELECT COUNT(*) as count FROM feature_categories")
        count = result[0]['count']
        
        if count > 0:
            print(f"✅ Found {count} feature categories")
            return []
        else:
            return ["❌ No feature categories found - run seed_feature_categories.sql first"]
            
    except Exception as e:
        return [f"❌ Could not check feature categories: {e}"]

def test_csv_file():
    """Test if CSV file exists and is readable"""
    print("\n" + "="*60)
    print("🔍 TESTING CSV FILE")
    print("="*60)
    
    csv_file = 'biorad_software_final_processed.csv'
    
    if not os.path.exists(csv_file):
        return [f"❌ CSV file not found: {csv_file}"]
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            
        print(f"✅ CSV file found with {len(rows)} products")
        
        if len(rows) != 95:
            return [f"⚠️  Expected 95 products but found {len(rows)}"]
        
        # Check first row
        first = rows[0]
        if 'software_name' not in first or 'description' not in first:
            return ["❌ CSV file missing required columns (software_name, description)"]
        
        print(f"   First product: {first['software_name']}")
        return []
        
    except Exception as e:
        return [f"❌ Could not read CSV file: {e}"]

def test_single_product():
    """Test enrichment with a single product"""
    print("\n" + "="*60)
    print("🔍 TESTING SINGLE PRODUCT ENRICHMENT")
    print("="*60)
    print("This will enrich just 1 product to verify everything works...")
    print("")
    
    response = input("Run test enrichment? (y/n): ")
    if response.lower() != 'y':
        print("⏭️  Skipping test enrichment")
        return []
    
    try:
        from data_enrichment_agent_final import DataEnrichmentAgent
        
        agent = DataEnrichmentAgent()
        agent.initialize_company()
        agent.load_feature_categories()
        
        # Test with AWS (first product)
        print("\n🧪 Testing with: AWS Cloud Services")
        result = agent.enrich_software_data(
            "AWS Cloud Services",
            "Various AWS cloud services subscribed by Bio-Rad under Enterprise Account agreement."
        )
        
        if result:
            print("\n✅ TEST ENRICHMENT SUCCESSFUL!")
            print(f"   Vendor: {result['vendor_name']}")
            print(f"   Category: {result['category']}")
            print(f"   Cost: ${result['pricing']['typical_cost_for_8000_employees']:,}")
            print(f"   Features: {len(result['features'])}")
            
            # Try to save
            print("\n🧪 Testing database save...")
            success = agent.save_to_database(
                "AWS Cloud Services TEST",  # Add TEST to avoid duplicate
                "Test description",
                result
            )
            
            if success:
                print("✅ Database save successful!")
                print("\n⚠️  Note: This created a test entry 'AWS Cloud Services TEST'")
                print("   You may want to delete it before running full enrichment")
                return []
            else:
                return ["❌ Database save failed"]
        else:
            return ["❌ Enrichment returned no data"]
            
    except Exception as e:
        return [f"❌ Test enrichment failed: {e}"]

def main():
    print("\n" + "="*60)
    print("🧪 PRISM ENRICHMENT - PRE-FLIGHT CHECK")
    print("="*60)
    print("This will verify your setup before processing 95 products...")
    
    all_issues = []
    
    # Run all tests
    all_issues.extend(test_environment())
    all_issues.extend(test_database_connection())
    all_issues.extend(test_feature_categories())
    all_issues.extend(test_csv_file())
    
    # Show issues if any
    if all_issues:
        print("\n" + "="*60)
        print("⚠️  ISSUES FOUND")
        print("="*60)
        for issue in all_issues:
            print(issue)
        print("\n❌ Please fix these issues before running enrichment")
        print("="*60)
        sys.exit(1)
    
    # Optional: Test actual enrichment
    test_issues = test_single_product()
    all_issues.extend(test_issues)
    
    # Final summary
    print("\n" + "="*60)
    if all_issues:
        print("⚠️  SOME TESTS FAILED")
        print("="*60)
        for issue in all_issues:
            print(issue)
        print("\n❌ Please fix these issues before running enrichment")
    else:
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n🎉 You're ready to run the full enrichment!")
        print("\nNext steps:")
        print("1. Run: python3 batch_enrichment_fixed.py")
        print("2. Wait ~48 minutes")
        print("3. Verify: python3 verify_enrichment.py")
        print("\nGood luck! 🚀")
    print("="*60 + "\n")
    
    sys.exit(0 if not all_issues else 1)

if __name__ == "__main__":
    main()
