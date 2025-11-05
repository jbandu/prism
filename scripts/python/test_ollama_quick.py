#!/usr/bin/env python3
"""
Quick test of Ollama enrichment with a single product
"""

import requests
import json

OLLAMA_API = "http://localhost:11434/api/generate"

def test_ollama():
    print("🧪 Testing Ollama connection and enrichment...\n")

    # Simple test prompt
    prompt = """Categorize this software and return JSON:

Software: Salesforce CRM
Vendor: Salesforce
Cost: $120,000/year

Return JSON with: category, features (array), use_cases (array)"""

    payload = {
        "model": "llama3.1:8b",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 500
        }
    }

    print("Sending request to Ollama...")
    print(f"Model: {payload['model']}\n")

    try:
        response = requests.post(OLLAMA_API, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        response_text = result.get('response', '')

        print("✅ Ollama Response:\n")
        print(response_text)
        print(f"\n⏱️  Time: {result.get('total_duration', 0) / 1e9:.1f} seconds")
        print(f"📊 Tokens: {result.get('eval_count', 0)}")

        return True

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama at http://localhost:11434")
        print("\nTroubleshooting:")
        print("1. Check if Ollama is running: sudo systemctl status ollama")
        print("2. Or start it: sudo systemctl start ollama")
        print("3. Or run directly: ollama serve")
        return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    test_ollama()
