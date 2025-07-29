#!/usr/bin/env python3
"""
TakeBack Backend - Development Server Entry Point
================================================

This file serves as the primary entry point for running the TakeBack backend
in development mode. It provides a clean interface for starting the FastAPI
server with development-friendly settings.

Key Features:
- Auto-reload enabled for development
- Comprehensive error handling and debugging
- Clear startup messages and status information
- Proper exit codes for CI/CD integration

Usage:
    python3 run.py                    # Start development server
    uvicorn app.main:app --reload    # Alternative direct command
"""

import uvicorn
import sys
import traceback

if __name__ == "__main__":
    try:
        # Display startup information
        print("=== Starting TakeBack Backend Server ===")
        print(f"DEBUG: Server will run on http://0.0.0.0:8000")
        print(f"DEBUG: API documentation will be available at http://localhost:8000/docs")
        
        # Start the FastAPI server with development settings
        # - host="0.0.0.0": Bind to all network interfaces (accessible from other devices)
        # - port=8000: Standard development port
        # - reload=True: Enable auto-reload when code changes (development only)
        # - "app.main:app": Import the FastAPI app from app.main module
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
        
    except Exception as e:
        # Comprehensive error handling for development debugging
        print(f"DEBUG: Failed to start server: {e}")
        traceback.print_exc()  # Print full stack trace for debugging
        sys.exit(1)  # Exit with error code for CI/CD systems 