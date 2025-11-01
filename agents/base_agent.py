"""
PRISM Base Agent Class
All agents inherit from this
"""
import anthropic
from typing import Dict, Any, List
from config.settings import ANTHROPIC_API_KEY, CLAUDE_MODEL, MAX_TOKENS
from database.db import Database


class BaseAgent:
    """Base class for all PRISM agents"""
    
    def __init__(self, name: str):
        self.name = name
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        self.db = Database()
        self.model = CLAUDE_MODEL
    
    def call_claude(self, prompt: str, system_prompt: str = None) -> str:
        """
        Call Claude API with a prompt
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            
        Returns:
            Claude's response text
        """
        messages = [{"role": "user", "content": prompt}]
        
        kwargs = {
            "model": self.model,
            "max_tokens": MAX_TOKENS,
            "messages": messages
        }
        
        if system_prompt:
            kwargs["system"] = system_prompt
        
        try:
            response = self.client.messages.create(**kwargs)
            return response.content[0].text
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            raise
    
    def log(self, message: str):
        """Log a message"""
        print(f"[{self.name}] {message}")
    
    def save_analysis(self, 
                     software_id: str,
                     analysis_type: str,
                     raw_findings: str,
                     structured_findings: Dict[str, Any],
                     key_insights: List[str],
                     recommendations: List[str],
                     confidence_score: float) -> str:
        """Save analysis results to database"""
        return self.db.save_agent_analysis(
            software_id=software_id,
            agent_name=self.name,
            analysis_type=analysis_type,
            raw_findings=raw_findings,
            structured_findings=structured_findings,
            key_insights=key_insights,
            recommendations=recommendations,
            confidence_score=confidence_score
        )
