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

    def _create_report_prompt(self, data: Dict[str, Any]) -> str:
        """Create report generation prompt"""
        
        # Safely get values with defaults
        overview = data.get('overview', {})
        total_software = overview.get('total_software') or 0
        total_spend = overview.get('total_spend') or 0
        replacement_candidates = overview.get('replacement_candidates') or 0
        avg_utilization = overview.get('avg_utilization') or 0
        
        prompt = f"""Generate an executive report for our software portfolio based on the following data:
    
    **PORTFOLIO OVERVIEW:**
    - Total Software Products: {total_software}
    - Total Annual Spend: ${total_spend:,.2f}
    - Replacement Candidates: {replacement_candidates}
    - Average License Utilization: {avg_utilization:.1f}%
    
    **TOP 10 MOST EXPENSIVE SOFTWARE:**
    {self._format_table(data.get('top_expensive', []), ['software_name', 'vendor_name', 'total_annual_cost', 'utilization_rate'])}
    
    **REPLACEMENT OPPORTUNITIES:**
    {self._format_table(data.get('replacement_candidates', [])[:5], ['software_name', 'total_annual_cost', 'alternative_name', 'cost_savings_percentage'])}
    
    **COST OPTIMIZATION OPPORTUNITIES:**
    {self._format_table(data.get('cost_optimizations', [])[:5], ['software_name', 'waste_amount', 'optimization_opportunity', 'utilization_percentage'])}
    
    **HIGH-RISK VENDORS:**
    {self._format_table(data.get('high_risk_vendors', [])[:5], ['vendor_name', 'financial_risk_score', 'total_spend'])}
    
    **UPCOMING RENEWALS:**
    {self._format_table(data.get('upcoming_renewals', [])[:5], ['software_name', 'vendor_name', 'renewal_date', 'total_annual_cost', 'days_to_renewal'])}
    
    Create a professional executive report with these sections:
    
    # PRISM PORTFOLIO INTELLIGENCE REPORT
    *{datetime.now().strftime('%B %d, %Y')}*
    
    ## EXECUTIVE SUMMARY
    [Overview with key findings and total savings opportunity]
    
    ## KEY METRICS
    [Most important numbers]
    
    ## TOP RECOMMENDATIONS
    [Top 5 actions with expected savings]
    
    ## COST OPTIMIZATION OPPORTUNITIES
    [Immediate savings without replacement]
    
    ## REPLACEMENT CANDIDATES  
    [Software that should be replaced with savings potential]
    
    ## RISK ASSESSMENT
    [High-risk vendors and renewals]
    
    ## UPCOMING RENEWALS
    [Next 90 days negotiation priorities]
    
    ## NEXT STEPS
    [Actions for next 30/60/90 days]
    
    Make it executive-friendly and action-oriented."""
    
        return prompt

    def _format_software_list(self, software_list: List[Dict[str, Any]]) -> str:
        """Format software list for prompt"""
        if not software_list:
            return "No data available"

        lines = []
        for sw in software_list:
            lines.append(f"- {sw.get('software_name', 'Unknown')} ({sw.get('vendor_name', 'Unknown')}): ${sw.get('total_annual_cost', 0):,.2f} | Utilization: {sw.get('utilization_rate', 0):.1f}%")

        return "\n".join(lines)

    def _format_replacement_candidates(self, candidates: List[Dict[str, Any]]) -> str:
        """Format replacement candidates for prompt"""
        if not candidates:
            return "No replacement candidates identified"

        lines = []
        for cand in candidates:
            alt_name = cand.get('alternative_name', 'Alternative needed')
            savings = cand.get('cost_savings_percentage', 0)
            lines.append(
                f"- {cand.get('software_name', 'Unknown')}: ${cand.get('total_annual_cost', 0):,.2f} "
                f"→ {alt_name} (Save {savings:.1f}%) | Priority: {cand.get('replacement_priority', 'Low')}"
            )

        return "\n".join(lines)

    def _format_cost_optimizations(self, optimizations: List[Dict[str, Any]]) -> str:
        """Format cost optimizations for prompt"""
        if not optimizations:
            return "No optimization opportunities identified"

        lines = []
        for opt in optimizations:
            lines.append(
                f"- {opt.get('software_name', 'Unknown')}: ${opt.get('waste_amount', 0):,.2f} waste "
                f"| Utilization: {opt.get('utilization_percentage', 0):.1f}% "
                f"| Opportunity: {opt.get('optimization_opportunity', 'N/A')}"
            )

        return "\n".join(lines)

    def _format_high_risk_vendors(self, vendors: List[Dict[str, Any]]) -> str:
        """Format high-risk vendors for prompt"""
        if not vendors:
            return "No high-risk vendors identified"

        lines = []
        for vendor in vendors:
            lines.append(
                f"- {vendor.get('vendor_name', 'Unknown')}: Risk Score {vendor.get('financial_risk_score', 0):.2f} "
                f"| Total Spend: ${vendor.get('total_spend', 0):,.2f}"
            )

        return "\n".join(lines)

    def _format_renewals(self, renewals: List[Dict[str, Any]]) -> str:
        """Format upcoming renewals for prompt"""
        if not renewals:
            return "No renewals in next 90 days"

        lines = []
        for renewal in renewals:
            lines.append(
                f"- {renewal.get('software_name', 'Unknown')} ({renewal.get('vendor_name', 'Unknown')}): "
                f"${renewal.get('total_annual_cost', 0):,.2f} "
                f"| Renews in {renewal.get('days_to_renewal', 0)} days ({renewal.get('renewal_date', 'Unknown')})"
            )

        return "\n".join(lines)
