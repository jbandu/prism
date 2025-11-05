#!/bin/bash

echo "Setting up PRISM project structure..."

# Create directories
mkdir -p agents config database utils

# Create __init__.py files
touch agents/__init__.py
touch config/__init__.py
touch database/__init__.py
touch utils/__init__.py

echo "✅ Directory structure created!"
echo ""
echo "📁 Project structure:"
tree -L 2
