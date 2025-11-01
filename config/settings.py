"""
PRISM Configuration Settings
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Anthropic API
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CLAUDE_MODEL = "claude-sonnet-4-20250514"  # Latest model
MAX_TOKENS = 4096

# Database
DATABASE_URL = os.getenv("DATABASE_URL")

# Agent Settings
AGENT_TIMEOUT = 120  # seconds
MAX_RETRIES = 3

# Logging
LOG_LEVEL = "INFO"

# Validate required settings
if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY environment variable is required")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
