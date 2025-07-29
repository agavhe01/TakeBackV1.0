#!/usr/bin/env python3
"""
TakeBack Backend - Legacy Entry Point
This file provides backward compatibility for the old main.py structure.
It redirects to the new modular structure using run.py
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    print("=== TakeBack Backend - Legacy Entry Point ===")
    print("DEBUG: Redirecting to new modular structure...")
    print("DEBUG: Use 'python3 run.py' for direct access to new structure")
    
    try:
        # Import and run the new modular app
        from app.main import app
        import uvicorn
        
        print("DEBUG: Starting server with new modular structure")
        print("DEBUG: Server will run on http://0.0.0.0:8000")
        print("DEBUG: API documentation will be available at http://localhost:8000/docs")
        
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
        
    except ImportError as e:
        print(f"ERROR: Failed to import new modular structure: {e}")
        print("DEBUG: Make sure you're running from the backend directory")
        print("DEBUG: Try running 'python3 run.py' instead")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to start server: {e}")
        print("DEBUG: Check your environment variables and dependencies")
        sys.exit(1) 