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
        software = self.db.get_software_by_id(software_id)
        if not software:
            raise ValueError(f"Software not found: {software_id}")
        
        self.log(f"Finding alternatives for: {software['software_name']}")
        
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

        response = self.call_claude(prompt, system_prompt)
        alternatives = self._parse_alternatives(response, software)
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

For each alternative, provide a JSON object with these EXACT fields.

Return ONLY a JSON array of alternatives. No markdown, no explanations, just valid JSON array.

Example format:
[
  {{
    "name": "Alternative Name",
    "vendor": "Vendor Name",
    "type": "commercial",
    "annual_cost": 50000,
    "cost_savings_percentage": 75.5,
    "feature_parity_score": 0.85,
    "missing_features": ["feature1"],
    "additional_capabilities": ["capability1"],
    "implementation_complexity": "medium",
    "migration_time_weeks": 8,
    "migration_cost": 45000,
    "integration_compatibility": 0.90,
    "api_quality": "excellent",
    "replacement_risk": 0.35,
    "rollback_difficulty": "moderate",
    "recommendation_status": "strongly-recommend",
    "reasoning": "Great alternative with 75% savings",
    "pilot_feasibility": "ideal",
    "payback_period_months": 6
  }}
]"""
        return prompt
    
    def _parse_alternatives(self, response: str, software: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Claude's alternative recommendations"""
        try:
            response = response.strip()
            
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = response
            
            alternatives = json.loads(json_str)
            
            if isinstance(alternatives, dict):
                alternatives = [alternatives]
            
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
            'feature_parity_score': alt.get('feature_parity_score'),
            'missing_features': alt.get('missing_features', []),
            'additional_capabilities': alt.get('additional_capabilities', []),
            'implementation_complexity': alt.get('implementation_complexity'),
            'migration_time_weeks': alt.get('migration_time_weeks'),
            'migration_cost': alt.get('migration_cost'),
            'integration_compatibility': alt.get('integration_compatibility'),
            'api_quality': alt.get('api_quality'),
            'replacement_risk': alt.get('replacement_risk'),
            'rollback_difficulty': alt.get('rollback_difficulty'),
            'recommendation_status': alt.get('recommendation_status'),
            'reasoning': alt.get('reasoning'),
            'pilot_feasibility': alt.get('pilot_feasibility'),
            'payback_period_months': alt.get('payback_period_months')
        }
    
    def _save_alternatives(self, software_id: str, alternatives: List[Dict[str, Any]]):
        """Save alternatives to database"""
        for alt in alternatives:
            try:
                if not alt.get('name'):
                    self.log("Skipping alternative with no name")
                    continue
                
                query = """
                    INSERT INTO alternative_solutions (
                        original_software_id, alternative_name, alternative_vendor,
                        alternative_type, cost_comparison, cost_savings_percentage,
                        feature_parity_score, implementation_complexity,
                        estimated_migration_time_weeks, estimated_migration_cost,
                        integration_compatibility_score, api_quality,
                        replacement_risk_score, rollback_difficulty,
                        recommendation_status, recommendation_reasoning,
                        pilot_feasibility, payback_period_months
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """
                
                self.db.execute_update(query, (
                    software_id,
                    alt.get('name'),
                    alt.get('vendor'),
                    alt.get('type'),
                    alt.get('annual_cost'),
                    alt.get('cost_savings_percentage'),
                    alt.get('feature_parity_score'),
                    alt.get('implementation_complexity'),
                    alt.get('migration_time_weeks'),
                    alt.get('migration_cost'),
                    alt.get('integration_compatibility'),
                    alt.get('api_quality'),
                    alt.get('replacement_risk'),
                    alt.get('rollback_difficulty'),
                    alt.get('recommendation_status'),
                    alt.get('reasoning'),
                    alt.get('pilot_feasibility'),
                    alt.get('payback_period_months')
                ))
                
                self.log(f"✓ Saved alternative: {alt.get('name')}")
            except Exception as e:
                self.log(f"✗ Error saving alternative: {e}")
