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

    def _create_report_prompt(self, portfolio_data: Dict[str, Any]) -> str:
        """Create prompt for executive report generation"""

        overview = portfolio_data.get('overview', {})
        top_expensive = portfolio_data.get('top_expensive', [])
        replacement_candidates = portfolio_data.get('replacement_candidates', [])
        cost_optimizations = portfolio_data.get('cost_optimizations', [])
        high_risk_vendors = portfolio_data.get('high_risk_vendors', [])
        upcoming_renewals = portfolio_data.get('upcoming_renewals', [])

        prompt = f"""Generate an executive report for our software portfolio based on the following data:

**PORTFOLIO OVERVIEW:**
- Total Software Count: {overview.get('total_software', 0)}
- Total Annual Spend: ${overview.get('total_spend', 0):,.2f}
- Average Utilization: {overview.get('avg_utilization', 0):.1f}%
- Replacement Candidates: {overview.get('replacement_candidates', 0)}

**TOP 10 MOST EXPENSIVE SOFTWARE:**
{self._format_software_list(top_expensive)}

**REPLACEMENT CANDIDATES (Top 10):**
{self._format_replacement_candidates(replacement_candidates)}

**COST OPTIMIZATION OPPORTUNITIES (Top 10):**
{self._format_cost_optimizations(cost_optimizations)}

**HIGH-RISK VENDORS:**
{self._format_high_risk_vendors(high_risk_vendors)}

**UPCOMING RENEWALS (Next 90 Days):**
{self._format_renewals(upcoming_renewals)}

**TASK:** Create a comprehensive executive report with:

1. **Executive Summary** (2-3 paragraphs)
   - Overall portfolio health
   - Total savings opportunity
   - Top 3 action items

2. **Key Findings**
   - Major cost drivers
   - Underutilization issues
   - Risk areas

3. **Savings Opportunities**
   - Immediate optimizations
   - Strategic replacements
   - Total potential savings

4. **Risk Assessment**
   - Vendor concentration
   - Financial risks
   - Renewal pressure points

5. **Recommended Actions**
   - Prioritized list of next steps
   - Quick wins (30 days)
   - Strategic initiatives (90+ days)

Format in markdown for easy reading."""

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
