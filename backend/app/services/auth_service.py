from fastapi import HTTPException
from datetime import datetime
from ..config.database import supabase
from ..models.auth import UserSignup, UserLogin, UserResponse, UserProfileUpdate
from ..utils.jwt import create_access_token
import traceback

class AuthService:
    @staticmethod
    async def signup(user_data: UserSignup):
        """Handle user signup"""
        print(f"=== SIGNUP REQUEST ===")
        print(f"DEBUG: Received signup request for email: {user_data.email}")
        print(f"DEBUG: User data: {user_data.dict()}")
        
        if not supabase:
            print("DEBUG: Supabase not configured - returning error")
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
        
        try:
            print("DEBUG: Attempting to create user in Supabase Auth...")
            
            # Create user in Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "first_name": user_data.first_name,
                        "last_name": user_data.last_name,
                        "phone": user_data.phone,
                        "organization_legal_name": user_data.organization_legal_name
                    }
                }
            })
            
            print(f"DEBUG: Supabase auth response: {auth_response}")
            
            if auth_response.user:
                print(f"DEBUG: User created successfully in Supabase Auth with ID: {auth_response.user.id}")
                
                # Insert into public.accounts table with simplified schema
                account_data = {
                    "id": auth_response.user.id,
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "phone": user_data.phone,
                    "email": user_data.email,
                    "organization_legal_name": user_data.organization_legal_name,
                    "orginazation_ein_number": user_data.orginazation_ein_number,
                    "created_at": datetime.utcnow().isoformat()
                }
                
                print(f"DEBUG: Inserting account data into database: {account_data}")
                
                db_response = supabase.table("accounts").insert(account_data).execute()
                print(f"DEBUG: Database insert response: {db_response}")
                
                # Create access token
                token_data = {
                    "sub": auth_response.user.id,
                    "email": user_data.email
                }
                access_token = create_access_token(token_data)
                
                print(f"DEBUG: Signup successful for user: {user_data.email}")
                
                return {
                    "success": True,
                    "message": "User created successfully",
                    "access_token": access_token,
                    "user": {
                        "id": auth_response.user.id,
                        "email": user_data.email,
                        "first_name": user_data.first_name,
                        "last_name": user_data.last_name,
                        "phone": user_data.phone,
                        "organization_legal_name": user_data.organization_legal_name,
                        "orginazation_ein_number": user_data.orginazation_ein_number
                    }
                }
            else:
                print("DEBUG: Failed to create user in Supabase Auth")
                raise HTTPException(status_code=400, detail="Failed to create user")
                
        except Exception as e:
            print(f"DEBUG: Signup error: {str(e)}")
            print(f"DEBUG: Error type: {type(e)}")
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def login(user_data: UserLogin):
        """Handle user login"""
        print(f"=== LOGIN REQUEST ===")
        print(f"DEBUG: Received login request for email: {user_data.email}")
        print(f"DEBUG: User data: {user_data.dict()}")
        
        if not supabase:
            print("DEBUG: Supabase not configured - returning error")
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
        
        try:
            print("DEBUG: Attempting to authenticate user with Supabase...")
            
            print(f"DEBUG: Attempting Supabase authentication with email: {user_data.email}")
            auth_response = supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
            
            print(f"DEBUG: Supabase auth response type: {type(auth_response)}")
            print(f"DEBUG: Supabase auth response: {auth_response}")
            print(f"DEBUG: Auth response has user: {hasattr(auth_response, 'user')}")
            if hasattr(auth_response, 'user'):
                print(f"DEBUG: User object: {auth_response.user}")
                print(f"DEBUG: User ID: {auth_response.user.id if auth_response.user else 'None'}")
            
            if auth_response.user:
                print(f"DEBUG: User authenticated successfully: {auth_response.user.id}")
                
                # Get user profile from database
                print("DEBUG: Fetching user profile from database...")
                profile_response = supabase.table("accounts").select("*").eq("id", auth_response.user.id).execute()
                
                print(f"DEBUG: Profile response: {profile_response}")
                
                if profile_response.data:
                    user_profile = profile_response.data[0]
                    print(f"DEBUG: User profile found: {user_profile}")
                    
                    token_data = {
                        "sub": auth_response.user.id,
                        "email": user_data.email
                    }
                    access_token = create_access_token(token_data)
                    
                    print(f"DEBUG: Login successful for user: {user_data.email}")
                    print(f"DEBUG: Returning user data: {user_profile}")
                    
                    return {
                        "success": True,
                        "access_token": access_token,
                        "user": {
                            "id": auth_response.user.id,
                            "email": user_data.email,
                            "first_name": user_profile.get("first_name"),
                            "last_name": user_profile.get("last_name"),
                            "organization_legal_name": user_profile.get("organization_legal_name")
                        }
                    }
                else:
                    print("DEBUG: User profile not found in database")
                    raise HTTPException(status_code=404, detail="User profile not found")
            else:
                print("DEBUG: Authentication failed - invalid credentials")
                raise HTTPException(status_code=401, detail="Invalid credentials")
                
        except Exception as e:
            print(f"DEBUG: Login error: {str(e)}")
            print(f"DEBUG: Error type: {type(e)}")
            print(f"DEBUG: Error details: {getattr(e, 'detail', 'No detail')}")
            print(f"DEBUG: Error message: {getattr(e, 'message', 'No message')}")
            traceback.print_exc()
            
            # Provide more specific error messages
            if "Invalid login credentials" in str(e):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            elif "User not found" in str(e):
                raise HTTPException(status_code=404, detail="User not found. Please sign up first.")
            else:
                raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

    @staticmethod
    async def get_profile(user_id: str):
        """Get user profile"""
        print(f"=== GET USER PROFILE ===")
        print(f"DEBUG: Received profile request with user ID: {user_id}")
        
        if not supabase:
            print("DEBUG: Supabase not configured - returning error")
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Get user from public.accounts table
            print("DEBUG: Fetching user profile from database...")
            response = supabase.table("accounts").select("*").eq("id", user_id).execute()
            
            print(f"DEBUG: Database response: {response}")
            
            if response.data:
                print(f"DEBUG: User profile found: {response.data[0]}")
                return UserResponse(**response.data[0])
            else:
                print("DEBUG: User profile not found in database")
                raise HTTPException(status_code=404, detail="User not found")
                
        except Exception as e:
            print(f"DEBUG: Profile fetch error: {str(e)}")
            print(f"DEBUG: Error type: {type(e)}")
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def update_profile(user_id: str, profile_data: UserProfileUpdate):
        """Update user profile"""
        print(f"=== UPDATE USER PROFILE ===")
        print(f"DEBUG: Received profile update request")
        
        if not supabase:
            print("DEBUG: Supabase not configured - returning error")
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Update user profile in public.accounts table
            update_data = {}
            
            # Only include fields that are provided (not None)
            if profile_data.first_name is not None:
                update_data["first_name"] = profile_data.first_name
            if profile_data.last_name is not None:
                update_data["last_name"] = profile_data.last_name
            if profile_data.date_of_birth is not None:
                update_data["date_of_birth"] = profile_data.date_of_birth
            if profile_data.phone is not None:
                update_data["phone"] = profile_data.phone
            if profile_data.organization_legal_name is not None:
                update_data["organization_legal_name"] = profile_data.organization_legal_name
            if profile_data.orginazation_ein_number is not None:
                update_data["orginazation_ein_number"] = profile_data.orginazation_ein_number
            if profile_data.ssn is not None:
                update_data["ssn"] = profile_data.ssn
            if profile_data.address is not None:
                update_data["address"] = profile_data.address
            if profile_data.zip_code is not None:
                update_data["zip_code"] = profile_data.zip_code
            
            print(f"DEBUG: Updating profile data: {update_data}")
            
            response = supabase.table("accounts").update(update_data).eq("id", user_id).execute()
            
            print(f"DEBUG: Update response: {response}")
            
            if response.data:
                print(f"DEBUG: Profile updated successfully")
                return {
                    "success": True,
                    "message": "Profile updated successfully",
                    "user": response.data[0]
                }
            else:
                print("DEBUG: Failed to update profile")
                raise HTTPException(status_code=400, detail="Failed to update profile")
                
        except Exception as e:
            print(f"DEBUG: Profile update error: {str(e)}")
            print(f"DEBUG: Error type: {type(e)}")
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=str(e)) 