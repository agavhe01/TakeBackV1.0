from fastapi import FastAPI, HTTPException, Depends, Header
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
    date_of_birth: str  # Will be converted to DATE
    address: str
    zip_code: str
    ssn: str
    phone: str
    email: str
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
    date_of_birth: str
    address: str
    zip_code: str
    phone: str
    email: str
    organization_legal_name: str
    orginazation_ein_number: str
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

class CardCreate(BaseModel):
    name: str
    status: str = "issued"  # 'issued', 'frozen', 'cancelled'
    balance: float = 0
    cardholder_name: str
    cvv: str
    expiry: str
    zipcode: str
    address: str
    budget_id: Optional[str] = None

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
    budget_id: Optional[str]
    created_at: str

class TransactionCreate(BaseModel):
    card_id: str
    amount: float
    name: str

class TransactionResponse(BaseModel):
    id: str
    card_id: str
    amount: float
    name: str
    date: str

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
            
            # Insert into public.accounts table with new schema
            account_data = {
                "id": auth_response.user.id,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "date_of_birth": user_data.date_of_birth,
                "address": user_data.address,
                "zip_code": user_data.zip_code,
                "ssn": user_data.ssn,
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
                    "organization_legal_name": user_data.organization_legal_name
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
    
    if not supabase:
        print("DEBUG: Supabase not configured - returning error")
        raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
    
    try:
        print("DEBUG: Attempting to authenticate user with Supabase...")
        
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        print(f"DEBUG: Supabase auth response: {auth_response}")
        
        if auth_response.user:
            print(f"DEBUG: User authenticated successfully: {auth_response.user.id}")
            
            token_data = {
                "sub": auth_response.user.id,
                "email": user_data.email
            }
            access_token = create_access_token(token_data)
            
            print(f"DEBUG: Login successful for user: {user_data.email}")
            
            return {
                "success": True,
                "access_token": access_token,
                "user": {
                    "id": auth_response.user.id,
                    "email": user_data.email
                }
            }
        else:
            print("DEBUG: Authentication failed - invalid credentials")
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        print(f"DEBUG: Login error: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=401, detail=str(e))

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
        
        response = supabase.table("budgets").select("*").eq("account_id", user_id).execute()
        
        return [BudgetResponse(**budget) for budget in response.data]
        
    except Exception as e:
        print(f"DEBUG: Get budgets error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Card endpoints
@app.post("/api/cards", response_model=CardResponse)
async def create_card(card_data: CardCreate, token: str = Depends(security)):
    print(f"=== CREATE CARD ===")
    print(f"DEBUG: Received card creation request")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
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
            "budget_id": card_data.budget_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("cards").insert(card_insert_data).execute()
        
        if response.data:
            return CardResponse(**response.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create card")
            
    except Exception as e:
        print(f"DEBUG: Card creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/cards", response_model=list[CardResponse])
async def get_cards(token: str = Depends(security)):
    print(f"=== GET CARDS ===")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        response = supabase.table("cards").select("*").eq("account_id", user_id).execute()
        
        return [CardResponse(**card) for card in response.data]
        
    except Exception as e:
        print(f"DEBUG: Get cards error: {str(e)}")
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
        
        # Verify the card belongs to the user
        card_response = supabase.table("cards").select("account_id").eq("id", transaction_data.card_id).execute()
        
        if not card_response.data or card_response.data[0]["account_id"] != user_id:
            raise HTTPException(status_code=403, detail="Card not found or access denied")
        
        transaction_insert_data = {
            "card_id": transaction_data.card_id,
            "amount": transaction_data.amount,
            "name": transaction_data.name,
            "date": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("transactions").insert(transaction_insert_data).execute()
        
        if response.data:
            return TransactionResponse(**response.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create transaction")
            
    except Exception as e:
        print(f"DEBUG: Transaction creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/transactions", response_model=list[TransactionResponse])
async def get_transactions(token: str = Depends(security)):
    print(f"=== GET TRANSACTIONS ===")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        
        # Get all cards for the user first
        cards_response = supabase.table("cards").select("id").eq("account_id", user_id).execute()
        card_ids = [card["id"] for card in cards_response.data]
        
        if not card_ids:
            return []
        
        # Get transactions for all user's cards
        response = supabase.table("transactions").select("*").in_("card_id", card_ids).execute()
        
        return [TransactionResponse(**transaction) for transaction in response.data]
        
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