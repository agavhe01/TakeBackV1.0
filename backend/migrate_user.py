#!/usr/bin/env python3
"""
Migration script to update existing users from old schema to new schema
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def migrate_user():
    print("=== USER MIGRATION SCRIPT ===")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        return
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
        
        # Get the user ID from the logs
        user_id = "9b4e3eda-22e8-4b9b-a56b-68ab0c545464"
        email = "agavhera@gmail.com"
        
        print(f"🔍 Looking for user: {email}")
        
        # Check if user exists in accounts table
        response = supabase.table("accounts").select("*").eq("id", user_id).execute()
        
        if response.data:
            print("❌ User already exists in accounts table with new schema")
            print(f"Current data: {response.data[0]}")
            return
        
        print("✅ User not found in accounts table, creating with new schema...")
        
        # Create user with new schema using data from Supabase Auth metadata
        # We'll use placeholder data for the new required fields
        new_user_data = {
            "id": user_id,
            "first_name": "Anesu",  # From auth metadata
            "last_name": "Gavhera",  # From auth metadata
            "phone": "6177646161",   # From auth metadata
            "email": email,
            "organization_legal_name": "Full Stack Solutions",  # From old nonprofit_name
            "orginazation_ein_number": "0000000000",  # From old ein
            "created_at": "2025-07-28T18:33:48.000Z"
        }
        
        print(f"📝 Inserting user data: {new_user_data}")
        
        result = supabase.table("accounts").insert(new_user_data).execute()
        
        if result.data:
            print("✅ User successfully migrated to new schema!")
            print(f"New user data: {result.data[0]}")
        else:
            print("❌ Failed to insert user data")
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate_user() 