"""
PRISM Vendor Intelligence Agent
Researches vendors for risk, market position, and negotiation leverage
"""
from typing import Dict, Any, List
from agents.base_agent import BaseAgent
import json


class VendorIntelligenceAgent(BaseAgent):
    """Agent 1A: Deep research on software vendors"""
    
    def __init__(self):
        super().__init__("Vendor Intelligence Agent")
    
    def analyze_vendor(self, vendor_name: str) -> Dict[str, Any]:
        """
        Comprehensive vendor analysis
        
        Args:
            vendor_name: Name of vendor to analyze
            
        Returns:
            Analysis results with risk scores and insights
        """
        self.log(f"Analyzing vendor: {vendor_name}")
        
        # Check if we already have vendor data
        existing_vendor = self.db.get_vendor_by_name(vendor_name)
        
        # Build context
        context = self._build_vendor_context(vendor_name, existing_vendor)
        
        # Create analysis prompt
        prompt = self._create_analysis_prompt(vendor_name, context)
        
        system_prompt = """You are an expert enterprise software analyst specializing in vendor risk assessment and market intelligence. 

Your job is to analyze software vendors from multiple angles:
1. Financial health and stability
2. Market position and competitive landscape
3. Acquisition and technology risk
4. Customer satisfaction and support quality
5. Negotiation leverage points

Provide structured, actionable insights that help enterprise buyers make informed decisions and negotiate better deals."""

        # Get Claude's analysis
        response = self.call_claude(prompt, system_prompt)
        
        # Parse and structure the response
        analysis = self._parse_analysis(response)
        
        # Update database
        self._update_vendor_intelligence(vendor_name, analysis)
        
        self.log(f"Completed analysis for {vendor_name}")
        
        return analysis
    
    def _build_vendor_context(self, vendor_name: str, existing_data: Dict[str, Any]) -> str:
        """Build context about vendor from existing data"""
        if not existing_data:
            return f"No existing data for {vendor_name}. Conduct fresh research."
        
        context = f"""
Existing vendor data for {vendor_name}:
- Founded: {existing_data.get('founded_year')}
- Employees: {existing_data.get('employee_count')}
- Status: {existing_data.get('company_status')}
- Annual Revenue: ${existing_data.get('annual_revenue', 0):,.0f}
- Market Position: {existing_data.get('market_position')}
- Financial Risk Score: {existing_data.get('financial_risk_score')}
- Last Researched: {existing_data.get('last_researched_date')}

Update this analysis with current information.
"""
        return context
    
    def _create_analysis_prompt(self, vendor_name: str, context: str) -> str:
        """Create comprehensive analysis prompt"""
        prompt = f"""Analyze the software vendor "{vendor_name}" for enterprise procurement decision-making.

{context}

Provide a comprehensive vendor intelligence report with the following sections:

1. **Company Overview**
   - Current status, ownership, headquarters
   - Size, revenue, growth trajectory
   - Recent news (acquisitions, layoffs, leadership changes)

2. **Financial Health Assessment**
   - Revenue trends and profitability
   - Funding status and runway
   - Financial risk score (0-1 scale, where 1 = highest risk)
   - Likelihood of company failure or acquisition

3. **Market Position**
   - Position in market (leader/challenger/niche/declining)
   - Top 3 competitors
   - Customer count and notable customers
   - Technology risk (is the product becoming obsolete?)

4. **Customer Satisfaction**
   - Support quality (1-5 scale)
   - Common complaints
   - Customer satisfaction trends

5. **Negotiation Intelligence**
   - Are they desperate for deals? (desperate/willing/inflexible)
   - When is their fiscal year/quarter end?
   - Recent customer losses
   - Pressure points for negotiation
   - Typical discount ranges

6. **Risk Flags**
   - Any concerning trends or red flags
   - Vendor lock-in severity (severe/moderate/low)
   - Security incidents or compliance issues

7. **Bottom Line Recommendation**
   - Should we renew, negotiate hard, or replace?
   - Key action items

Format your response as structured JSON with these exact keys:
{{
  "company_overview": {{}},
  "financial_health": {{
    "revenue": number,
    "profitability": "profitable|break-even|burning-cash",
    "risk_score": float (0-1)
  }},
  "market_position": {{
    "position": "leader|challenger|niche|declining",
    "competitors": [],
    "customer_count": number
  }},
  "negotiation_intel": {{
    "vendor_eagerness": "desperate|willing|inflexible",
    "quarter_end": "date",
    "pressure_points": [],
    "typical_discount_percentage": float
  }},
  "risk_flags": [],
  "key_insights": [],
  "recommendations": []
}}"""
        return prompt
    
    def _parse_analysis(self, response: str) -> Dict[str, Any]:
        """Parse Claude's response into structured format"""
        try:
            # Try to extract JSON from response
            # Claude might wrap it in markdown code blocks
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
            
            analysis = json.loads(json_str)
            return analysis
        except Exception as e:
            self.log(f"Error parsing response: {e}")
            # Return raw response if parsing fails
            return {
                "raw_response": response,
                "parse_error": str(e)
            }
    
    def _update_vendor_intelligence(self, vendor_name: str, analysis: Dict[str, Any]):
        """Update vendor_intelligence table with analysis results"""
        try:
            financial = analysis.get("financial_health", {})
            market = analysis.get("market_position", {})
            negotiation = analysis.get("negotiation_intel", {})
            
            query = """
                INSERT INTO vendor_intelligence (
                    vendor_name, 
                    annual_revenue, 
                    profitability,
                    financial_risk_score,
                    market_position,
                    customer_count,
                    last_researched_date,
                    research_summary
                ) VALUES (%s, %s, %s, %s, %s, %s, CURRENT_DATE, %s)
                ON CONFLICT (vendor_name) 
                DO UPDATE SET
                    annual_revenue = EXCLUDED.annual_revenue,
                    profitability = EXCLUDED.profitability,
                    financial_risk_score = EXCLUDED.financial_risk_score,
                    market_position = EXCLUDED.market_position,
                    customer_count = EXCLUDED.customer_count,
                    last_researched_date = EXCLUDED.last_researched_date,
                    research_summary = EXCLUDED.research_summary,
                    updated_at = NOW()
            """
            
            summary = "\n".join(analysis.get("key_insights", []))
            
            self.db.execute_update(query, (
                vendor_name,
                financial.get("revenue"),
                financial.get("profitability"),
                financial.get("risk_score"),
                market.get("position"),
                market.get("customer_count"),
                summary
            ))
            
            self.log(f"Updated vendor intelligence for {vendor_name}")
        except Exception as e:
            self.log(f"Error updating vendor intelligence: {e}")
