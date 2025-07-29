from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional
import os
import jwt
from datetime import datetime, timedelta
import httpx
from supabase import create_client, Client
import sys
import traceback

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

print("=== TakeBack Backend Starting ===")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

app = FastAPI(title="TakeBack API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS middleware configured successfully")

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://placeholder.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "placeholder_key")
JWT_SECRET = os.getenv("JWT_SECRET", "placeholder_secret")

print(f"DEBUG: SUPABASE_URL configured: {'Yes' if SUPABASE_URL != 'https://placeholder.supabase.co' else 'No (using placeholder)'}")
print(f"DEBUG: SUPABASE_KEY configured: {'Yes' if SUPABASE_KEY != 'placeholder_key' else 'No (using placeholder)'}")
print(f"DEBUG: JWT_SECRET configured: {'Yes' if JWT_SECRET != 'placeholder_secret' else 'No (using placeholder)'}")

# Initialize Supabase client only if credentials are provided
supabase: Client = None
if SUPABASE_URL != "https://placeholder.supabase.co" and SUPABASE_KEY != "placeholder_key":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("DEBUG: Supabase client initialized successfully")
    except Exception as e:
        print(f"DEBUG: Failed to initialize Supabase client: {e}")
        supabase = None
else:
    print("DEBUG: Supabase client not initialized - using placeholder credentials")

# Security
security = HTTPBearer()

# Pydantic models
class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    password: str
    organization_legal_name: str
    orginazation_ein_number: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: str
    email: str
    organization_legal_name: str
    orginazation_ein_number: str
    date_of_birth: Optional[str] = None
    ssn: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    created_at: str

# New models for the updated schema
class BudgetCreate(BaseModel):
    name: str
    limit_amount: float
    period: str  # 'monthly', 'weekly', 'quarterly'
    require_receipts: bool = False

class BudgetResponse(BaseModel):
    id: str
    account_id: str
    name: str
    limit_amount: float
    period: str
    require_receipts: bool
    created_at: str

class CardBudgetCreate(BaseModel):
    card_id: str
    budget_id: str

class CardBudgetResponse(BaseModel):
    id: str
    card_id: str
    budget_id: str
    created_at: str

class CardCreate(BaseModel):
    name: str
    status: str = "issued"  # 'issued', 'frozen', 'cancelled'
    balance: float = 0
    cardholder_name: str
    cvv: str
    expiry: str
    zipcode: str
    address: str
    budget_ids: list[str] = []  # List of budget IDs to associate with the card

class CardResponse(BaseModel):
    id: str
    account_id: str
    name: str
    status: str
    balance: float
    cardholder_name: str
    cvv: str
    expiry: str
    zipcode: str
    address: str
    budget_ids: list[str] = []  # List of associated budget IDs
    created_at: str

class TransactionCreate(BaseModel):
    card_budget_id: str
    amount: float
    name: str
    date: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    card_budget_id: str
    amount: float
    name: str
    date: str
    description: Optional[str] = None
    category: Optional[str] = None
    # Optionally include related card and budget info for frontend enrichment
    card_id: Optional[str] = None
    budget_id: Optional[str] = None

class PolicyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    memo_threshold: Optional[float] = None
    memo_prompt: Optional[str] = None

class PolicyResponse(BaseModel):
    id: str
    account_id: str
    name: str
    description: Optional[str]
    memo_threshold: Optional[float]
    memo_prompt: Optional[str]
    created_at: str

# New models for balance calculations
class BudgetBalance(BaseModel):
    budget_id: str
    budget_name: str
    limit_amount: float
    spent_amount: float
    remaining_amount: float
    period: str

class CardBalance(BaseModel):
    card_id: str
    card_name: str
    total_spent: float
    total_limit: float
    remaining_amount: float
    budget_balances: list[BudgetBalance]

class BalanceResponse(BaseModel):
    card_balances: list[CardBalance]
    total_spent: float
    total_limit: float
    total_remaining: float

# JWT token functions
def create_access_token(data: dict):
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=7)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
        print(f"DEBUG: JWT token created successfully for user: {data.get('email', 'unknown')}")
        return encoded_jwt
    except Exception as e:
        print(f"DEBUG: Failed to create JWT token: {e}")
        raise e

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print(f"DEBUG: JWT token verified successfully for user: {payload.get('email', 'unknown')}")
        return payload
    except jwt.ExpiredSignatureError:
        print("DEBUG: JWT token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError as e:
        print(f"DEBUG: JWT token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.post("/api/auth/signup")
async def signup(user_data: UserSignup):
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

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
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

@app.get("/api/user/profile")
async def get_profile(token: str = Depends(security)):
    print(f"=== GET USER PROFILE ===")
    print(f"DEBUG: Received profile request with token: {token.credentials[:20]}...")
    
    if not supabase:
        print("DEBUG: Supabase not configured - returning error")
        raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
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

# Profile update endpoint
class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    organization_legal_name: Optional[str] = None
    orginazation_ein_number: Optional[str] = None
    ssn: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None

@app.put("/api/user/update-profile")
async def update_profile(profile_data: UserProfileUpdate, token: str = Depends(security)):
    print(f"=== UPDATE USER PROFILE ===")
    print(f"DEBUG: Received profile update request")
    
    if not supabase:
        print("DEBUG: Supabase not configured - returning error")
        raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
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

# Budget endpoints
@app.post("/api/budgets", response_model=BudgetResponse)
async def create_budget(budget_data: BudgetCreate, token: str = Depends(security)):
    print(f"=== CREATE BUDGET ===")
    print(f"DEBUG: Received budget creation request")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        budget_insert_data = {
            "account_id": user_id,
            "name": budget_data.name,
            "limit_amount": budget_data.limit_amount,
            "period": budget_data.period,
            "require_receipts": budget_data.require_receipts,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("budgets").insert(budget_insert_data).execute()
        
        if response.data:
            return BudgetResponse(**response.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create budget")
            
    except Exception as e:
        print(f"DEBUG: Budget creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/budgets", response_model=list[BudgetResponse])
async def get_budgets(token: str = Depends(security)):
    print(f"=== GET BUDGETS ===")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        response = supabase.table("budgets").select("*").eq("account_id", user_id).order("created_at", desc=True).execute()
        
        return [BudgetResponse(**budget) for budget in response.data]
        
    except Exception as e:
        print(f"DEBUG: Get budgets error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/budgets/{budget_id}", response_model=BudgetResponse)
async def update_budget(budget_id: str, budget_data: BudgetCreate, token: str = Depends(security)):
    print(f"=== UPDATE BUDGET ===")
    print(f"DEBUG: Received budget update request for budget ID: {budget_id}")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Token verified, user ID: {user_id}")
        
        # Verify the budget belongs to the user
        budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
        
        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Budget not found")
        
        budget_update_data = {
            "name": budget_data.name,
            "limit_amount": budget_data.limit_amount,
            "period": budget_data.period,
            "require_receipts": budget_data.require_receipts
        }
        
        print(f"DEBUG: Updating budget with data: {budget_update_data}")
        
        response = supabase.table("budgets").update(budget_update_data).eq("id", budget_id).execute()
        
        print(f"DEBUG: Update budget response: {response}")
        
        if response.data:
            return BudgetResponse(**response.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to update budget")
            
    except Exception as e:
        print(f"DEBUG: Update budget error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/budgets/{budget_id}")
async def delete_budget(budget_id: str, token: str = Depends(security)):
    print(f"=== DELETE BUDGET ===")
    print(f"DEBUG: Received budget deletion request for budget ID: {budget_id}")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Token verified, user ID: {user_id}")
        
        # Verify the budget belongs to the user
        budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
        
        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Budget not found")
        
        print(f"DEBUG: Deleting budget with ID: {budget_id}")
        
        response = supabase.table("budgets").delete().eq("id", budget_id).execute()
        
        print(f"DEBUG: Delete budget response: {response}")
        
        if response.data:
            return {"message": "Budget deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete budget")
            
    except Exception as e:
        print(f"DEBUG: Delete budget error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Card endpoints
@app.get("/api/cards", response_model=list[CardResponse])
async def get_cards(token: str = Depends(security)):
    print(f"=== GET CARDS ===")
    print(f"DEBUG: Received get cards request")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Token verified, user ID: {user_id}")
        
        # Get all cards for the user with their associated budgets
        cards_response = supabase.table("cards").select("*").eq("account_id", user_id).execute()
        
        print(f"DEBUG: Cards response: {cards_response}")
        
        if cards_response.data:
            cards_with_budgets = []
            for card in cards_response.data:
                # Get associated budgets for this card
                card_budgets_response = supabase.table("card_budgets").select("budget_id").eq("card_id", card["id"]).execute()
                budget_ids = [cb["budget_id"] for cb in card_budgets_response.data] if card_budgets_response.data else []
                
                card_with_budgets = {**card, "budget_ids": budget_ids}
                cards_with_budgets.append(CardResponse(**card_with_budgets))
            
            return cards_with_budgets
        else:
            return []
            
    except Exception as e:
        print(f"DEBUG: Get cards error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/cards", response_model=CardResponse)
async def create_card(card_data: CardCreate, token: str = Depends(security)):
    print(f"=== CREATE CARD ===")
    print(f"DEBUG: Received card creation request")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Token verified, user ID: {user_id}")
        
        card_insert_data = {
            "account_id": user_id,
            "name": card_data.name,
            "status": card_data.status,
            "balance": card_data.balance,
            "cardholder_name": card_data.cardholder_name,
            "cvv": card_data.cvv,
            "expiry": card_data.expiry,
            "zipcode": card_data.zipcode,
            "address": card_data.address,
            "created_at": datetime.utcnow().isoformat()
        }
        
        print(f"DEBUG: Creating card with data: {card_insert_data}")
        
        response = supabase.table("cards").insert(card_insert_data).execute()
        
        print(f"DEBUG: Create card response: {response}")
        
        if response.data:
            created_card = response.data[0]
            
            # Associate budgets with the card if provided
            if card_data.budget_ids:
                for budget_id in card_data.budget_ids:
                    # Verify the budget belongs to the user
                    budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
                    if budget_response.data:
                        card_budget_data = {
                            "card_id": created_card["id"],
                            "budget_id": budget_id,
                            "created_at": datetime.utcnow().isoformat()
                        }
                        supabase.table("card_budgets").insert(card_budget_data).execute()
            
            return CardResponse(**{**created_card, "budget_ids": card_data.budget_ids})
        else:
            raise HTTPException(status_code=400, detail="Failed to create card")
            
    except Exception as e:
        print(f"DEBUG: Create card error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, card_data: CardCreate, token: str = Depends(security)):
    print(f"=== UPDATE CARD ===")
    print(f"DEBUG: Received card update request for card ID: {card_id}")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Token verified, user ID: {user_id}")
        
        # Verify the card belongs to the user
        card_response = supabase.table("cards").select("*").eq("id", card_id).eq("account_id", user_id).execute()
        
        if not card_response.data:
            raise HTTPException(status_code=404, detail="Card not found")
        
        card_update_data = {
            "name": card_data.name,
            "status": card_data.status,
            "balance": card_data.balance,
            "cardholder_name": card_data.cardholder_name,
            "cvv": card_data.cvv,
            "expiry": card_data.expiry,
            "zipcode": card_data.zipcode,
            "address": card_data.address,
        }
        
        print(f"DEBUG: Updating card with data: {card_update_data}")
        
        response = supabase.table("cards").update(card_update_data).eq("id", card_id).execute()
        
        print(f"DEBUG: Update card response: {response}")
        
        if response.data:
            updated_card = response.data[0]
            
            # Update budget associations
            # First, remove all existing budget associations
            supabase.table("card_budgets").delete().eq("card_id", card_id).execute()
            
            # Then add new budget associations
            if card_data.budget_ids:
                for budget_id in card_data.budget_ids:
                    # Verify the budget belongs to the user
                    budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
                    if budget_response.data:
                        card_budget_data = {
                            "card_id": card_id,
                            "budget_id": budget_id,
                            "created_at": datetime.utcnow().isoformat()
                        }
                        supabase.table("card_budgets").insert(card_budget_data).execute()
            
            return CardResponse(**{**updated_card, "budget_ids": card_data.budget_ids})
        else:
            raise HTTPException(status_code=400, detail="Failed to update card")
            
    except Exception as e:
        print(f"DEBUG: Update card error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/cards/{card_id}")
async def delete_card(card_id: str, token: str = Depends(security)):
    print(f"=== DELETE CARD ===")
    print(f"DEBUG: Received card deletion request for card ID: {card_id}")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Token verified, user ID: {user_id}")
        
        # Verify the card belongs to the user
        card_response = supabase.table("cards").select("*").eq("id", card_id).eq("account_id", user_id).execute()
        
        if not card_response.data:
            raise HTTPException(status_code=404, detail="Card not found")
        
        print(f"DEBUG: Deleting card with ID: {card_id}")
        
        response = supabase.table("cards").delete().eq("id", card_id).execute()
        
        print(f"DEBUG: Delete card response: {response}")
        
        if response.data:
            return {"message": "Card deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete card")
            
    except Exception as e:
        print(f"DEBUG: Delete card error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Transaction endpoints
@app.post("/api/transactions", response_model=TransactionResponse)
async def create_transaction(transaction_data: TransactionCreate, token: str = Depends(security)):
    print(f"=== CREATE TRANSACTION ===")
    print(f"DEBUG: Received transaction creation request")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        # Extract card_budget_id from the transaction_data
        card_budget_id = transaction_data.card_budget_id
        
        # Verify the card_budget_id belongs to the user
        card_budget_response = supabase.table("card_budgets").select("card_id, budget_id").eq("id", card_budget_id).execute()
        
        if not card_budget_response.data:
            raise HTTPException(status_code=403, detail="Card-Budget combination not found")
        
        # Get card and budget IDs from the verified card_budget_id
        card_id = card_budget_response.data[0]["card_id"]
        budget_id = card_budget_response.data[0]["budget_id"]
        
        # Verify the card belongs to the user
        card_response = supabase.table("cards").select("account_id").eq("id", card_id).execute()
        if not card_response.data or card_response.data[0]["account_id"] != user_id:
            raise HTTPException(status_code=403, detail="Card not found or access denied")
        
        transaction_insert_data = {
            "card_budget_id": card_budget_id,
            "amount": transaction_data.amount,
            "name": transaction_data.name,
            "date": transaction_data.date if transaction_data.date else datetime.utcnow().isoformat(),
            "description": transaction_data.description,
            "category": transaction_data.category
        }
        
        print(f"DEBUG: Inserting transaction data: {transaction_insert_data}")
        response = supabase.table("transactions").insert(transaction_insert_data).execute()
        
        print(f"DEBUG: Insert response: {response}")
        
        if response.data:
            # Enrich response with card and budget IDs
            transaction_data = response.data[0]
            return TransactionResponse(**transaction_data, card_id=card_id, budget_id=budget_id)
        else:
            print(f"DEBUG: No data returned from insert")
            raise HTTPException(status_code=400, detail="Failed to create transaction")
            
    except Exception as e:
        print(f"DEBUG: Transaction creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(transaction_id: str, transaction_data: TransactionCreate, token: str = Depends(security)):
    print(f"=== UPDATE TRANSACTION ===")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        # Validate card_budget_id ownership
        card_budget_response = supabase.table("card_budgets").select("card_id, budget_id").eq("id", transaction_data.card_budget_id).execute()
        if not card_budget_response.data:
            raise HTTPException(status_code=403, detail="Card or Budget not found or access denied")
        card_id = card_budget_response.data[0]["card_id"]
        # Check card ownership
        card_response = supabase.table("cards").select("account_id").eq("id", card_id).execute()
        if not card_response.data or card_response.data[0]["account_id"] != user_id:
            raise HTTPException(status_code=403, detail="Card not found or access denied")
        update_data = {
            "card_budget_id": transaction_data.card_budget_id,
            "amount": transaction_data.amount,
            "name": transaction_data.name,
            "date": transaction_data.date if transaction_data.date else datetime.utcnow().isoformat(),
            "description": transaction_data.description,
            "category": transaction_data.category
        }
        response = supabase.table("transactions").update(update_data).eq("id", transaction_id).execute()
        if response.data:
            # Enrich response
            card_budget_response = supabase.table("card_budgets").select("card_id, budget_id").eq("id", response.data[0]["card_budget_id"]).execute()
            card_id = card_budget_response.data[0]["card_id"] if card_budget_response.data else None
            budget_id = card_budget_response.data[0]["budget_id"] if card_budget_response.data else None
            return TransactionResponse(**response.data[0], card_id=card_id, budget_id=budget_id)
        else:
            raise HTTPException(status_code=400, detail="Failed to update transaction")
    except Exception as e:
        print(f"DEBUG: Update transaction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, token: str = Depends(security)):
    print(f"=== DELETE TRANSACTION ===")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        # Fetch transaction to validate ownership
        transaction_response = supabase.table("transactions").select("card_budget_id").eq("id", transaction_id).execute()
        if not transaction_response.data:
            raise HTTPException(status_code=404, detail="Transaction not found")
        card_budget_id = transaction_response.data[0]["card_budget_id"]
        card_budget_response = supabase.table("card_budgets").select("card_id").eq("id", card_budget_id).execute()
        if not card_budget_response.data:
            raise HTTPException(status_code=403, detail="Card or Budget not found or access denied")
        card_id = card_budget_response.data[0]["card_id"]
        card_response = supabase.table("cards").select("account_id").eq("id", card_id).execute()
        if not card_response.data or card_response.data[0]["account_id"] != user_id:
            raise HTTPException(status_code=403, detail="Card not found or access denied")
        # Delete transaction
        supabase.table("transactions").delete().eq("id", transaction_id).execute()
        return {"detail": "Transaction deleted successfully"}
    except Exception as e:
        print(f"DEBUG: Delete transaction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/transactions", response_model=list[TransactionResponse])
async def get_transactions(
    token: str = Depends(security),
    card_id: str = Query(None),
    budget_id: str = Query(None),
    card_budget_id: str = Query(None)
):
    print(f"=== GET TRANSACTIONS (with filters) ===")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        # Get all card_budgets for the user
        card_budgets_query = supabase.table("card_budgets").select("id, card_id, budget_id")
        card_budgets_response = card_budgets_query.execute()
        card_budget_map = {cb["id"]: cb for cb in card_budgets_response.data}
        # Filter card_budgets by user ownership
        user_card_ids = [c["id"] for c in supabase.table("cards").select("id, account_id").eq("account_id", user_id).execute().data]
        user_card_budget_ids = [cbid for cbid, cb in card_budget_map.items() if cb["card_id"] in user_card_ids]
        # Apply filters
        filtered_card_budget_ids = user_card_budget_ids
        if card_id:
            filtered_card_budget_ids = [cbid for cbid in filtered_card_budget_ids if card_budget_map[cbid]["card_id"] == card_id]
        if budget_id:
            filtered_card_budget_ids = [cbid for cbid in filtered_card_budget_ids if card_budget_map[cbid]["budget_id"] == budget_id]
        if card_budget_id:
            filtered_card_budget_ids = [cbid for cbid in filtered_card_budget_ids if cbid == card_budget_id]
        if not filtered_card_budget_ids:
            return []
        # Get transactions for filtered card_budget_ids
        response = supabase.table("transactions").select("*").in_("card_budget_id", filtered_card_budget_ids).execute()
        transactions_with_details = []
        for transaction in response.data:
            cb = card_budget_map.get(transaction["card_budget_id"])
            card_id = cb["card_id"] if cb else None
            budget_id = cb["budget_id"] if cb else None
            transactions_with_details.append({**transaction, "card_id": card_id, "budget_id": budget_id})
        return [TransactionResponse(**t) for t in transactions_with_details]
    except Exception as e:
        print(f"DEBUG: Get transactions error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Policy endpoints
@app.post("/api/policies", response_model=PolicyResponse)
async def create_policy(policy_data: PolicyCreate, token: str = Depends(security)):
    print(f"=== CREATE POLICY ===")
    print(f"DEBUG: Received policy creation request")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        policy_insert_data = {
            "account_id": user_id,
            "name": policy_data.name,
            "description": policy_data.description,
            "memo_threshold": policy_data.memo_threshold,
            "memo_prompt": policy_data.memo_prompt
        }
        
        response = supabase.table("policies").insert(policy_insert_data).execute()
        
        if response.data:
            return PolicyResponse(**response.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create policy")
            
    except Exception as e:
        print(f"DEBUG: Policy creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/policies", response_model=list[PolicyResponse])
async def get_policies(token: str = Depends(security)):
    print(f"=== GET POLICIES ===")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        response = supabase.table("policies").select("*").eq("account_id", user_id).execute()
        
        return [PolicyResponse(**policy) for policy in response.data]
        
    except Exception as e:
        print(f"DEBUG: Get policies error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Card-Budget endpoints
@app.get("/api/card-budgets")
async def get_card_budgets(token: str = Depends(security)):
    print(f"=== GET CARD BUDGETS ===")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        # Get all card_budgets for the user's cards
        response = supabase.table("card_budgets").select("id, card_id, budget_id").execute()
        
        if response.data:
            # Get card and budget details for each card_budget
            card_budgets_with_details = []
            for cb in response.data:
                # Get card details
                card_response = supabase.table("cards").select("name, account_id").eq("id", cb["card_id"]).execute()
                if card_response.data and card_response.data[0]["account_id"] == user_id:
                    # Get budget details
                    budget_response = supabase.table("budgets").select("name").eq("id", cb["budget_id"]).execute()
                    if budget_response.data:
                        card_budgets_with_details.append({
                            "id": cb["id"],
                            "card_id": cb["card_id"],
                            "budget_id": cb["budget_id"],
                            "card_name": card_response.data[0]["name"],
                            "budget_name": budget_response.data[0]["name"]
                        })
            
            return card_budgets_with_details
        else:
            return []
    except Exception as e:
        print(f"DEBUG: Get card budgets error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Balance calculation endpoints
@app.get("/api/balances", response_model=BalanceResponse)
async def get_balances(token: str = Depends(security)):
    print(f"=== GET BALANCES ===")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        # Get all cards for the user
        cards_response = supabase.table("cards").select("*").eq("account_id", user_id).execute()
        cards = cards_response.data
        
        card_balances = []
        total_spent = 0
        total_limit = 0
        
        for card in cards:
            # Get card-budget associations
            card_budgets_response = supabase.table("card_budgets").select("id, budget_id").eq("card_id", card["id"]).execute()
            card_budgets = card_budgets_response.data
            
            budget_balances = []
            card_total_spent = 0
            card_total_limit = 0
            
            for card_budget in card_budgets:
                # Get budget details
                budget_response = supabase.table("budgets").select("*").eq("id", card_budget["budget_id"]).execute()
                if budget_response.data:
                    budget = budget_response.data[0]
                    
                    # Calculate spent amount for this card-budget combination
                    transactions_response = supabase.table("transactions").select("amount").eq("card_budget_id", card_budget["id"]).execute()
                    spent_amount = sum(t["amount"] for t in transactions_response.data)
                    
                    remaining_amount = budget["limit_amount"] - spent_amount
                    
                    budget_balances.append(BudgetBalance(
                        budget_id=budget["id"],
                        budget_name=budget["name"],
                        limit_amount=budget["limit_amount"],
                        spent_amount=spent_amount,
                        remaining_amount=remaining_amount,
                        period=budget["period"]
                    ))
                    
                    card_total_spent += spent_amount
                    card_total_limit += budget["limit_amount"]
            
            card_remaining = card_total_limit - card_total_spent
            
            card_balances.append(CardBalance(
                card_id=card["id"],
                card_name=card["name"],
                total_spent=card_total_spent,
                total_limit=card_total_limit,
                remaining_amount=card_remaining,
                budget_balances=budget_balances
            ))
            
            total_spent += card_total_spent
            total_limit += card_total_limit
        
        total_remaining = total_limit - total_spent
        
        return BalanceResponse(
            card_balances=card_balances,
            total_spent=total_spent,
            total_limit=total_limit,
            total_remaining=total_remaining
        )
        
    except Exception as e:
        print(f"DEBUG: Get balances error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/cards/{card_id}/balance", response_model=CardBalance)
async def get_card_balance(card_id: str, token: str = Depends(security)):
    print(f"=== GET CARD BALANCE ===")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        # Verify card belongs to user
        card_response = supabase.table("cards").select("*").eq("id", card_id).eq("account_id", user_id).execute()
        if not card_response.data:
            raise HTTPException(status_code=404, detail="Card not found")
        
        card = card_response.data[0]
        
        # Get card-budget associations
        card_budgets_response = supabase.table("card_budgets").select("id, budget_id").eq("card_id", card_id).execute()
        card_budgets = card_budgets_response.data
        
        budget_balances = []
        card_total_spent = 0
        card_total_limit = 0
        
        for card_budget in card_budgets:
            # Get budget details
            budget_response = supabase.table("budgets").select("*").eq("id", card_budget["budget_id"]).execute()
            if budget_response.data:
                budget = budget_response.data[0]
                
                # Calculate spent amount for this card-budget combination
                transactions_response = supabase.table("transactions").select("amount").eq("card_budget_id", card_budget["id"]).execute()
                spent_amount = sum(t["amount"] for t in transactions_response.data)
                
                remaining_amount = budget["limit_amount"] - spent_amount
                
                budget_balances.append(BudgetBalance(
                    budget_id=budget["id"],
                    budget_name=budget["name"],
                    limit_amount=budget["limit_amount"],
                    spent_amount=spent_amount,
                    remaining_amount=remaining_amount,
                    period=budget["period"]
                ))
                
                card_total_spent += spent_amount
                card_total_limit += budget["limit_amount"]
        
        card_remaining = card_total_limit - card_total_spent
        
        return CardBalance(
            card_id=card["id"],
            card_name=card["name"],
            total_spent=card_total_spent,
            total_limit=card_total_limit,
            remaining_amount=card_remaining,
            budget_balances=budget_balances
        )
        
    except Exception as e:
        print(f"DEBUG: Get card balance error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/budgets/{budget_id}/balance", response_model=BudgetBalance)
async def get_budget_balance(budget_id: str, token: str = Depends(security)):
    print(f"=== GET BUDGET BALANCE ===")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        # Verify budget belongs to user
        budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Budget not found")
        
        budget = budget_response.data[0]
        
        # Get all card-budget associations for this budget
        card_budgets_response = supabase.table("card_budgets").select("id").eq("budget_id", budget_id).execute()
        card_budgets = card_budgets_response.data
        
        # Calculate total spent across all cards using this budget
        total_spent = 0
        for card_budget in card_budgets:
            transactions_response = supabase.table("transactions").select("amount").eq("card_budget_id", card_budget["id"]).execute()
            total_spent += sum(t["amount"] for t in transactions_response.data)
        
        remaining_amount = budget["limit_amount"] - total_spent
        
        return BudgetBalance(
            budget_id=budget["id"],
            budget_name=budget["name"],
            limit_amount=budget["limit_amount"],
            spent_amount=total_spent,
            remaining_amount=remaining_amount,
            period=budget["period"]
        )
        
    except Exception as e:
        print(f"DEBUG: Get budget balance error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
async def root():
    print("DEBUG: Health check endpoint accessed")
    return {"message": "TakeBack API is running", "status": "healthy"}

@app.get("/debug/config")
async def debug_config():
    """Debug endpoint to check configuration"""
    print("DEBUG: Config debug endpoint accessed")
    return {
        "supabase_configured": supabase is not None,
        "supabase_url": SUPABASE_URL if SUPABASE_URL != "https://placeholder.supabase.co" else "NOT_SET",
        "jwt_secret_configured": JWT_SECRET != "placeholder_secret",
        "environment": "development"
    }

@app.get("/debug/user/{email}")
async def debug_user(email: str):
    """Debug endpoint to check if a user exists in the database"""
    print(f"=== DEBUG USER CHECK ===")
    print(f"DEBUG: Checking for user with email: {email}")
    
    if not supabase:
        return {"error": "Supabase not configured"}
    
    try:
        # Check in accounts table
        response = supabase.table("accounts").select("*").eq("email", email).execute()
        print(f"DEBUG: Database response: {response}")
        
        if response.data:
            user_data = response.data[0]
            print(f"DEBUG: User found: {user_data}")
            return {
                "exists": True,
                "user_data": user_data,
                "message": "User found in database"
            }
        else:
            print("DEBUG: User not found in database")
            return {
                "exists": False,
                "message": "User not found in database"
            }
    except Exception as e:
        print(f"DEBUG: Error checking user: {str(e)}")
        return {
            "error": str(e),
            "message": "Error checking user"
        }

if __name__ == "__main__":
    try:
        import uvicorn
        print("=== Starting TakeBack Backend Server ===")
        print(f"DEBUG: Server will run on http://0.0.0.0:8000")
        print(f"DEBUG: API documentation will be available at http://localhost:8000/docs")
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        print(f"DEBUG: Failed to start server: {e}")
        traceback.print_exc()
        sys.exit(1) 