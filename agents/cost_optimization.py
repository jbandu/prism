"""
PRISM Cost Optimization Agent
Finds immediate savings without replacement
"""
from typing import Dict, Any, List
from agents.base_agent import BaseAgent
import json
import re


class CostOptimizationAgent(BaseAgent):
    """Agent 2A: Identify cost optimization opportunities"""
    
    def __init__(self):
        super().__init__("Cost Optimization Agent")
    
    def analyze_costs(self, software_id: str) -> Dict[str, Any]:
        """
        Analyze software for cost optimization opportunities
        
        Args:
            software_id: ID of software to analyze
            
        Returns:
            Cost optimization recommendations
        """
        # Get software and usage data
        software = self.db.get_software_by_id(software_id)
        if not software:
            raise ValueError(f"Software not found: {software_id}")
        
        self.log(f"Analyzing costs for: {software['software_name']}")
        
        # Get usage data if available
        usage_query = """
            SELECT * FROM usage_analytics 
            WHERE software_id = %s 
            ORDER BY analysis_date DESC 
            LIMIT 1
        """
        usage_data = self.db.execute_query(usage_query, (software_id,))
        usage = usage_data[0] if usage_data else None
        
        # Create optimization prompt
        prompt = self._create_optimization_prompt(software, usage)
        
        system_prompt = """You are an expert enterprise software cost analyst.

Your job is to find immediate cost savings WITHOUT replacing the software, through:
1. License right-sizing (removing unused licenses)
2. Feature tier optimization (downgrading to cheaper tier)
3. Contract renegotiation leverage
4. Usage pattern optimization
5. Consolidation opportunities

Be specific about savings amounts and implementation steps."""

        # Get Claude's analysis
        response = self.call_claude(prompt, system_prompt)
        
        # Parse optimization recommendations
        optimization = self._parse_optimization(response, software, usage)
        
        # Save to database
        if usage:
            self._update_usage_analytics(software_id, optimization)
        
        total_savings = optimization.get('total_savings', {}).get('total', 0) or 0
        self.log(f"Identified ${total_savings:,.0f} in potential savings")
        
        return optimization
    
    def _create_optimization_prompt(self, software: Dict[str, Any], usage: Dict[str, Any]) -> str:
        """Create cost optimization prompt"""
        
        # Safely format usage info
        usage_info = "No usage data available"
        if usage:
            usage_info = f"""
**Usage Analytics:**
- Licenses Purchased: {usage.get('licenses_purchased', 'N/A')}
- Licenses Active: {usage.get('licenses_active', 'N/A')}
- Utilization Rate: {usage.get('utilization_percentage', 'N/A')}%
- Daily Active Users: {usage.get('daily_active_users', 'N/A')}
- Monthly Active Users: {usage.get('monthly_active_users', 'N/A')}
- Features Used: {usage.get('features_used', 'N/A')} / {usage.get('features_available', 'N/A')}
- Current Waste: ${usage.get('waste_amount', 0):,.2f}
- Usage Trend: {usage.get('usage_trend', 'Unknown')}
"""
        
        prompt = f"""Analyze this software for cost optimization opportunities:

**Software Details:**
- Name: {software['software_name']}
- Vendor: {software['vendor_name']}
- Current Annual Cost: ${software['total_annual_cost']:,.2f}
- License Type: {software['license_type']}
- Total Licenses: {software.get('total_licenses', 'N/A')}
- Active Users: {software.get('active_users', 'N/A')}
- Utilization Rate: {software.get('utilization_rate', 'N/A')}%

{usage_info}

**Task:** Identify immediate cost savings opportunities WITHOUT replacing the software.

Analyze these areas:

1. **License Right-Sizing**
   - How many unused licenses can be removed?
   - What's the optimal license count?
   - Immediate savings from license reduction?

2. **Feature Tier Optimization**
   - Are we on the right tier?
   - Any underutilized premium features?
   - Could we downgrade tiers and save money?

3. **Usage Pattern Improvements**
   - Can we reduce costs through better usage practices?
   - Training needs to improve utilization?

4. **Contract Negotiation Points**
   - Leverage points for renewal negotiation
   - Expected discount percentage
   - Best timing for negotiation

5. **Total Savings Opportunity**
   - Immediate savings (license reduction)
   - Annual recurring savings
   - One-time savings
   - Negotiation savings potential

Return ONLY valid JSON with this structure (no markdown, no explanations):

{{
  "license_optimization": {{
    "current_licenses": 100,
    "recommended_licenses": 75,
    "licenses_to_remove": 25,
    "immediate_savings": 50000
  }},
  "tier_optimization": {{
    "current_tier": "Enterprise",
    "recommended_tier": "Professional",
    "annual_savings": 30000
  }},
  "negotiation_leverage": {{
    "leverage_points": ["usage decline", "competitive alternatives"],
    "target_discount_percentage": 20,
    "estimated_savings": 40000
  }},
  "total_savings": {{
    "immediate": 50000,
    "annual_recurring": 30000,
    "negotiation_potential": 40000,
    "total": 120000
  }},
  "recommendations": [
    "Reduce licenses from 100 to 75",
    "Downgrade to Professional tier",
    "Negotiate 20% discount at renewal"
  ],
  "implementation_steps": [
    "Step 1: Audit current license usage",
    "Step 2: Remove inactive users",
    "Step 3: Contact vendor for tier change"
  ]
}}"""

        return prompt
    
    def _parse_optimization(self, response: str, software: Dict[str, Any], usage: Dict[str, Any]) -> Dict[str, Any]:
        """Parse optimization recommendations"""
        try:
            # Clean up response
            response = response.strip()
            
            # Remove markdown if present
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            
            # Find JSON object
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = response
            
            optimization = json.loads(json_str)
            return optimization
            
        except Exception as e:
            self.log(f"Error parsing optimization: {e}")

            # Return fallback optimization structure
            return {
                "license_optimization": {
                    "current_licenses": software.get('total_licenses', 0),
                    "recommended_licenses": software.get('active_users', 0),
                    "licenses_to_remove": 0,
                    "immediate_savings": 0
                },
                "tier_optimization": {
                    "current_tier": "Unknown",
                    "recommended_tier": "Unknown",
                    "annual_savings": 0
                },
                "negotiation_leverage": {
                    "leverage_points": [],
                    "target_discount_percentage": 0,
                    "estimated_savings": 0
                },
                "total_savings": {
                    "immediate": 0,
                    "annual_recurring": 0,
                    "negotiation_potential": 0,
                    "total": 0
                },
                "recommendations": [],
                "implementation_steps": []
            }

    def _update_usage_analytics(self, software_id: str, optimization: Dict[str, Any]) -> None:
        """Update usage analytics with optimization data"""
        try:
            total_savings = optimization.get('total_savings', {}).get('total', 0)

            update_query = """
                UPDATE usage_analytics ua
                SET optimization_savings = %s,
                    optimization_recommendations = %s,
                    analysis_date = CURRENT_TIMESTAMP
                FROM (
                    SELECT usage_id FROM usage_analytics
                    WHERE software_id = %s
                    ORDER BY analysis_date DESC
                    LIMIT 1
                ) latest
                WHERE ua.usage_id = latest.usage_id
            """

            recommendations = json.dumps(optimization.get('recommendations', []))
            self.db.execute_query(
                update_query,
                (total_savings, recommendations, software_id)
            )

        except Exception as e:
            self.log(f"Error updating usage analytics: {e}")
