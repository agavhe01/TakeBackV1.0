from supabase import create_client, Client
from .settings import settings

def get_supabase_client() -> Client:
    """Initialize and return Supabase client"""
    if (settings.SUPABASE_URL == "https://placeholder.supabase.co" or 
        settings.SUPABASE_KEY == "placeholder_key"):
        print("DEBUG: Supabase client not initialized - using placeholder credentials")
        return None
    
    try:
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("DEBUG: Supabase client initialized successfully")
        return client
    except Exception as e:
        print(f"DEBUG: Failed to initialize Supabase client: {e}")
        return None

# Global supabase client instance
supabase = get_supabase_client() 