"""
PRISM Database Connection Handler
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import List, Dict, Any
from config.settings import DATABASE_URL


class Database:
    """Database connection and query handler"""
    
    def __init__(self):
        self.connection_string = DATABASE_URL
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = psycopg2.connect(self.connection_string)
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results as list of dicts"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                return [dict(row) for row in cursor.fetchall()]
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute an INSERT/UPDATE/DELETE query and return affected rows"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.rowcount
    
    def get_software_by_id(self, software_id: str) -> Dict[str, Any]:
        """Get software asset by ID"""
        query = """
            SELECT * FROM software_assets 
            WHERE id = %s
        """
        results = self.execute_query(query, (software_id,))
        return results[0] if results else None
    
    def get_all_software(self) -> List[Dict[str, Any]]:
        """Get all software assets"""
        query = "SELECT * FROM software_assets ORDER BY total_annual_cost DESC"
        return self.execute_query(query)
    
    def get_replacement_candidates(self) -> List[Dict[str, Any]]:
        """Get software marked for replacement"""
        query = """
            SELECT * FROM software_assets 
            WHERE ai_replacement_candidate = true 
               OR replacement_priority IN ('immediate', 'high')
            ORDER BY 
                CASE replacement_priority 
                    WHEN 'immediate' THEN 1 
                    WHEN 'high' THEN 2 
                    ELSE 3 
                END,
                total_annual_cost DESC
        """
        return self.execute_query(query)
    
    def get_vendor_by_name(self, vendor_name: str) -> Dict[str, Any]:
        """Get vendor intelligence by name"""
        query = "SELECT * FROM vendor_intelligence WHERE vendor_name = %s"
        results = self.execute_query(query, (vendor_name,))
        return results[0] if results else None
    
    def save_agent_analysis(self, 
                           software_id: str,
                           agent_name: str,
                           analysis_type: str,
                           raw_findings: str,
                           structured_findings: Dict[str, Any],
                           key_insights: List[str],
                           recommendations: List[str],
                           confidence_score: float) -> str:
        """Save agent analysis to database"""
        query = """
            INSERT INTO ai_agent_analyses (
                software_id, agent_name, analysis_type, 
                raw_findings, structured_findings, 
                key_insights, recommendations, confidence_score
            ) VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s)
            RETURNING id
        """
        import json
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (
                    software_id, agent_name, analysis_type,
                    raw_findings, json.dumps(structured_findings),
                    key_insights, recommendations, confidence_score
                ))
                return cursor.fetchone()[0]
