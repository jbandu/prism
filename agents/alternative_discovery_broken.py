"""
PRISM Alternative Discovery Agent
Finds replacement options for software
"""
from typing import Dict, Any, List
from agents.base_agent import BaseAgent
import json
import re


class AlternativeDiscoveryAgent(BaseAgent):
    """Agent 1B: Find replacement alternatives"""
    
    def __init__(self):
        super().__init__("Alternative Discovery Agent")
    
    def find_alternatives(self, software_id: str) -> List[Dict[str, Any]]:
        """
        Find alternative solutions for a software product
        
        Args:
            software_id: ID of software to find alternatives for
            
        Returns:
            List of alternative solutions with analysis
        """
        # Get software details
        software = self.db.get_software_by_id(software_id)
        if not software:
            raise ValueError(f"Software not found: {software_id}")
        
        self.log(f"Finding alternatives for: {software['software_name']}")
        
        # Create discovery prompt
        prompt = self._create_discovery_prompt(software)
        
        system_prompt = """You are an expert enterprise software analyst specializing in finding replacement solutions.

Your job is to identify viable alternatives to existing enterprise software, considering:
1. Commercial alternatives (competitors)
2. Open-source solutions
3. AI-powered alternatives (using Claude API, etc.)
4. Custom-built options

For each alternative, assess:
- Cost comparison and savings
- Feature parity
- Implementation complexity
- Integration compatibility
- Risk level

Prioritize practical, proven solutions over experimental ones."""

        # Get Claude's recommendations
        response = self.call_claude(prompt, system_prompt)
        
        # Parse alternatives
        alternatives = self._parse_alternatives(response, software)
        
        # Save to database
        self._save_alternatives(software_id, alternatives)
        
        self.log(f"Found {len(alternatives)} alternatives for {software['software_name']}")
        
        return alternatives
    
    def _create_discovery_prompt(self, software: Dict[str, Any]) -> str:
        """Create alternative discovery prompt"""
        prompt = f"""Find the best replacement alternatives for this enterprise software:

**Current Software:**
- Name: {software['software_name']}
- Vendor: {software['vendor_name']}
- Category: {software['category']}
- Current Cost: ${software['total_annual_cost']:,.2f}/year
- Users: {software.get('total_licenses', 'N/A')}
- Use Case: {software.get('primary_use_case', 'Not specified')}
- Business Criticality: {software['business_criticality']}
- Integration Complexity: {software.get('integration_complexity', 'Unknown')}

**Requirements:**
Find 3-5 alternative solutions including:
1. At least one commercial competitor
2. At least one open-source option (if viable)
3. One AI-powered or custom-built option (using Claude API, n8n, Python, etc.)

For each alternative, provide a JSON object with these EXACT fields:

{{
  "name": "Alternative Name",
  "vendor": "Vendor Name or 'Self-hosted'",
  "type": "commercial|open-source|ai-powered|custom-built",
  "annual_cost": 50000,
  "cost_savings_percentage": 75.5,
  "feature_parity_score": 0.85,
  "missing_features": ["feature1", "feature2"],
  "additional_capabilities": ["capability1"],
  "implementation_complexity": "low|medium|high",
  "migration_time_weeks": 8,
  "migration_cost": 45000,
  "integration_compatibility": 0.90,
  "api_quality": "excellent|good|limited|none",
  "replacement_risk": 0.35,
  "rollback_difficulty": "easy|moderate|difficult",
  "recommendation_status": "strongly-recommend|recommend|consider|not-recommended",
  "reasoning": "2-3 sentence explanation",
  "pilot_feasibility": "ideal|possible|difficult",
  "payback_period_months": 6
}}

Return ONLY a JSON array of alternatives. No markdown, no explanations, just valid JSON array.

Example:
[
  {{ "name": "Alternative 1", "vendor": "Vendor A", ... }},
  {{ "name": "Alternative 2", "vendor": "Vendor B", ... }}
]"""

        return prompt
    
    def _parse_alternatives(self, response: str, software: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Claude's alternative recommendations"""
        try:
            # Clean up the response
            response = response.strip()
            
            # Remove markdown code blocks if present
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            
            # Try to find JSON array in the response
            # Look for pattern: [ ... ]
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = response
            
            alternatives = json.loads(json_str)
            
            # Ensure it's a list
            if isinstance(alternatives, dict):
                alternatives = [alternatives]
            
            # Validate and normalize each alternative
            normalized = []
            for alt in alternatives:
                if isinstance(alt, dict) and alt.get('name'):
                    normalized.append(self._normalize_alternative(alt))
            
            return normalized
            
        except Exception as e:
            self.log(f"Error parsing alternatives: {e}")
            self.log(f"Raw response: {response[:500]}")
            return []
    
    def _normalize_alternative(self, alt: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize alternative fields to match database schema"""
        return {
            'name': alt.get('name'),
            'vendor': alt.get('vendor'),
            'type': alt.get('type'),
            'annual_cost': alt.get('annual_cost'),
            'cost_savings_percentage': alt.get('cost_savings_percentage'),
            'feature_parity_score': alt.get('feature_pa
