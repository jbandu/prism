"""
Check what values are allowed by database constraints
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import Database

def check_constraints():
    """Check constraints on key columns"""
    print("\n" + "="*60)
    print("🔍 CHECKING DATABASE CONSTRAINTS")
    print("="*60)
    
    db = Database()
    
    # Check constraints on software_assets
    print("\n📋 Constraints on SOFTWARE_ASSETS table:")
    result = db.execute_query("""
        SELECT 
            conname as constraint_name,
            pg_get_constraintdef(c.oid) as constraint_definition
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE conrelid = 'software_assets'::regclass
        AND contype = 'c'
        ORDER BY conname
    """)
    
    if result:
        for row in result:
            print(f"\n   Constraint: {row['constraint_name']}")
            print(f"   Definition: {row['constraint_definition']}")
    else:
        print("   No check constraints found")
    
    print("\n" + "="*60)
    print("✅ CONSTRAINT CHECK COMPLETE")
    print("="*60)

if __name__ == "__main__":
    check_constraints()
