"""
PRISM Report Generation Agent
Creates executive reports and summaries
"""
from typing import Dict, Any, List
from agents.base_agent import BaseAgent
import json
from datetime import datetime


class ReportGenerationAgent(BaseAgent):
    """Agent 3B: Generate executive reports"""
    
    def __init__(self):
        super().__init__("Report Generation Agent")
    
    def generate_executive_report(self) -> str:
        """
        Generate comprehensive executive summary report
        
        Returns:
            Formatted report text
        """
        self.log("Generating executive report...")
        
        # Gather portfolio data
        portfolio_data = self._gather_portfolio_data()
        
        # Create report prompt
        prompt = self._create_report_prompt(portfolio_data)
        
        system_prompt = """You are an executive report writer for enterprise software portfolio management.

Create clear, concise, action-oriented reports for C-level executives.

Format guidelines:
- Lead with key numbers and bottom-line recommendations
- Use clear section headers
- Bullet points for scannability  
- Highlight savings opportunities prominently
- Include specific next steps
- Professional but direct tone

Executives care about: savings, risk, and action items."""

        # Generate report
        report = self.call_claude(prompt, system_prompt)
        
        self.log("Executive report generated")
        
        return report
    
    def _gather_portfolio_data(self) -> Dict[str, Any]:
        """Gather all necessary data for report"""
        data = {}
        
        # Portfolio overview
        overview_query = """
            SELECT 
                COUNT(*) as total_software,
                SUM(total_annual_cost) as total_spend,
                COUNT(CASE WHEN ai_replacement_candidate THEN 1 END) as replacement_candidates,
                AVG(utilization_rate) as avg_utilization
            FROM software_assets
        """
        data['overview'] = self.db.execute_query(overview_query)[0]
        
        # Top 10 most expensive
        data['top_expensive'] = self.db.execute_query("""
            SELECT software_name, vendor_name, total_annual_cost, utilization_rate
            FROM software_assets
            ORDER BY total_annual_cost DESC
            LIMIT 10
        """)
        
        # Replacement candidates
        data['replacement_candidates'] = self.db.execute_query("""
            SELECT 
                sa.software_name,
                sa.total_annual_cost,
                sa.replacement_priority,
                alt.alternative_name,
                alt.cost_savings_percentage
            FROM software_assets sa
            LEFT JOIN LATERAL (
                SELECT * FROM alternative_solutions 
                WHERE original_software_id = sa.id 
                ORDER BY cost_savings_percentage DESC 
                LIMIT 1
            ) alt ON true
            WHERE sa.ai_replacement_candidate = true
            ORDER BY sa.replacement_feasibility_score DESC
            LIMIT 10
        """)
        
        # Cost optimization opportunities
        data['cost_optimizations'] = self.db.execute_query("""
            SELECT 
                sa.software_name,
                sa.total_annual_cost,
                ua.waste_amount,
                ua.optimization_opportunity,
                ua.utilization_percentage
            FROM software_assets sa
            INNER JOIN usage_analytics ua ON sa.id = ua.software_id
            WHERE ua.waste_amount > 0
            ORDER BY ua.waste_amount DESC
            LIMIT 10
        """)
        
        # High-risk vendors
        data['high_risk_vendors'] = self.db.execute_query("""
            SELECT 
                vi.vendor_name,
                vi.financial_risk_score,
                SUM(sa.total_annual_cost) as total_spend
            FROM vendor_intelligence vi
            INNER JOIN software_assets sa ON vi.vendor_name = sa.vendor_name
            WHERE vi.financial_risk_score > 0.5
            GROUP BY vi.id
            ORDER BY total_spend DESC
        """)
        
        # Upcoming renewals (next 90 days)
        data['upcoming_renewals'] = self.db.execute_query("""
            SELECT software_name, vendor_name, renewal_date, total_annual_cost, days_to_renewal
            FROM software_assets
            WHERE days_to_renewal > 0 AND days_to_renewal <= 90
            ORDER BY days_to_renewal ASC
        """)
        
        return data
