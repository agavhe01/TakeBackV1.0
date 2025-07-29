#!/usr/bin/env python3
"""
Deployment script for TakeBack Backend
This script handles the Vercel serverless function deployment
"""

import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

# Import the FastAPI app
from app.main import app

# For Vercel serverless deployment
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000))) 