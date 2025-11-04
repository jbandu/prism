"""
Schema Detection Script - Finds actual database columns
Run this first to see what columns exist
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import Database

def check_schema():
    """Check actual database schema"""
    print("\n" + "="*60)
    print("🔍 CHECKING DATABASE SCHEMA")
    print("="*60)
    
    db = Database()
    
    # Check software_assets table
    print("\n📋 SOFTWARE_ASSETS columns:")
    result = db.execute_query("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'software_assets'
        ORDER BY ordinal_position
    """)
    
    if result:
        for row in result:
            print(f"   ✅ {row['column_name']:<30} ({row['data_type']})")
    else:
        print("   ❌ Could not read schema")
    
    # Check companies table
    print("\n📋 COMPANIES columns:")
    result = db.execute_query("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'companies'
        ORDER BY ordinal_position
    """)
    
    if result:
        for row in result:
            print(f"   ✅ {row['column_name']:<30} ({row['data_type']})")
    
    # Check software_catalog table
    print("\n📋 SOFTWARE_CATALOG columns:")
    result = db.execute_query("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'software_catalog'
        ORDER BY ordinal_position
    """)
    
    if result:
        for row in result:
            print(f"   ✅ {row['column_name']:<30} ({row['data_type']})")
    
    print("\n" + "="*60)
    print("✅ SCHEMA CHECK COMPLETE")
    print("="*60)
    print("\nSave this output and I'll create a script that matches your exact schema!")

if __name__ == "__main__":
    check_schema()
