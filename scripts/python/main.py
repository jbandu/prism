"""
PRISM Main Orchestrator
Coordinates all agents
"""
from agents.vendor_intelligence import VendorIntelligenceAgent
from agents.alternative_discovery import AlternativeDiscoveryAgent
from agents.cost_optimization import CostOptimizationAgent
from agents.report_generation import ReportGenerationAgent
from database.db import Database


def analyze_full_portfolio():
    """Run complete portfolio analysis"""
    print("=" * 60)
    print("PRISM - Portfolio Risk Intelligence & Savings Management")
    print("=" * 60)
    print()
    
    db = Database()
    
    # Initialize agents
    vendor_agent = VendorIntelligenceAgent()
    alternative_agent = AlternativeDiscoveryAgent()
    cost_agent = CostOptimizationAgent()
    report_agent = ReportGenerationAgent()
    
    print("📊 Step 1: Analyzing vendors...")
    print("-" * 60)
    
    # Get all unique vendors
    vendors_query = "SELECT DISTINCT vendor_name FROM software_assets"
    vendors = db.execute_query(vendors_query)
    
    for vendor_row in vendors:
        vendor_name = vendor_row['vendor_name']
        try:
            vendor_agent.analyze_vendor(vendor_name)
        except Exception as e:
            print(f"Error analyzing {vendor_name}: {e}")
    
    print()
    print("🔍 Step 2: Finding alternatives for replacement candidates...")
    print("-" * 60)
    
    # Get replacement candidates
    candidates = db.get_replacement_candidates()
    
    for software in candidates[:5]:  # Limit to top 5 for demo
        try:
            alternative_agent.find_alternatives(software['id'])
        except Exception as e:
            print(f"Error finding alternatives for {software['software_name']}: {e}")
    
    print()
    print("💰 Step 3: Analyzing cost optimization opportunities...")
    print("-" * 60)
    
    # Get all software with usage data
    usage_query = """
        SELECT DISTINCT sa.id 
        FROM software_assets sa
        INNER JOIN usage_analytics ua ON sa.id = ua.software_id
    """
    software_with_usage = db.execute_query(usage_query)
    
    for sw in software_with_usage:
        try:
            cost_agent.analyze_costs(sw['id'])
        except Exception as e:
            print(f"Error analyzing costs: {e}")
    
    print()
    print("📄 Step 4: Generating executive report...")
    print("-" * 60)
    
    report = report_agent.generate_executive_report()
    
    # Save report to file
    with open("PRISM_Executive_Report.md", "w") as f:
        f.write(report)
    
    print()
    print("=" * 60)
    print("✅ ANALYSIS COMPLETE!")
    print("=" * 60)
    print(f"\n📄 Report saved to: PRISM_Executive_Report.md")
    print("\nKey findings:")
    print(report[:500] + "...\n")


if __name__ == "__main__":
    analyze_full_portfolio()
