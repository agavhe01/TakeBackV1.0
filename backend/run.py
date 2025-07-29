import uvicorn
import sys
import traceback

if __name__ == "__main__":
    try:
        print("=== Starting TakeBack Backend Server ===")
        print(f"DEBUG: Server will run on http://0.0.0.0:8000")
        print(f"DEBUG: API documentation will be available at http://localhost:8000/docs")
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"DEBUG: Failed to start server: {e}")
        traceback.print_exc()
        sys.exit(1) 