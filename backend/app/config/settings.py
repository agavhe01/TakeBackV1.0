import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=== TakeBack Backend Starting ===")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

class Settings:
    # Supabase Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://placeholder.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "placeholder_key")
    
    # JWT Configuration
    JWT_SECRET = os.getenv("JWT_SECRET", "placeholder_secret")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_DAYS = 7
    
    # CORS Configuration
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "https://takeback-agavhera.vercel.app",
        "https://takeback.vercel.app",
        "https://takeback-agavhera.vercel.app/",
        "https://takeback.vercel.app/",
        "*"  # Allow all origins for now (minimal security)
    ]
    
    # API Configuration
    API_V1_STR = "/api"
    PROJECT_NAME = "TakeBack API"
    VERSION = "1.0.0"

    def __init__(self):
        print(f"DEBUG: SUPABASE_URL configured: {'Yes' if self.SUPABASE_URL != 'https://placeholder.supabase.co' else 'No (using placeholder)'}")
        print(f"DEBUG: SUPABASE_KEY configured: {'Yes' if self.SUPABASE_KEY != 'placeholder_key' else 'No (using placeholder)'}")
        print(f"DEBUG: JWT_SECRET configured: {'Yes' if self.JWT_SECRET != 'placeholder_secret' else 'No (using placeholder)'}")

settings = Settings() 