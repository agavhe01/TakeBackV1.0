#!/usr/bin/env python3
"""
TakeBack Backend - Entry Point for Vercel Deployment
This file serves as the entry point for Vercel Functions and provides
backward compatibility for local development.
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Import the FastAPI app from the modular structure
try:
    from app.main import app
    print("DEBUG: Successfully imported FastAPI app from modular structure")
except ImportError as e:
    print(f"ERROR: Failed to import FastAPI app: {e}")
    sys.exit(1)

# Vercel requires either a 'handler' or 'app' variable to be defined
# We're using the FastAPI app directly, which is supported by Vercel's Python runtime
# The 'app' variable is now available for Vercel to use

if __name__ == "__main__":
    print("=== TakeBack Backend - Development Mode ===")
    print("DEBUG: Starting development server...")
    print("DEBUG: Server will run on http://0.0.0.0:8000")
    print("DEBUG: API documentation will be available at http://localhost:8000/docs")
    
    try:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
        
    except Exception as e:
        print(f"ERROR: Failed to start server: {e}")
        print("DEBUG: Check your environment variables and dependencies")
        sys.exit(1) 