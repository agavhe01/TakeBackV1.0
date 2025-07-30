from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Handle imports for different execution contexts
try:
    from .config.settings import settings
    from .api import auth, budgets, cards, transactions, policies, analytics, card_budgets, receipts
except ImportError:
    # When running from backend root
    from app.config.settings import settings
    from app.api import auth, budgets, cards, transactions, policies, analytics, card_budgets, receipts

# Create FastAPI app
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Add CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS middleware configured successfully")

# Include routers
app.include_router(auth.router)
app.include_router(budgets.router)
app.include_router(cards.router)
app.include_router(transactions.router)
app.include_router(policies.router)
app.include_router(analytics.router)
app.include_router(card_budgets.router)
app.include_router(receipts.router)

@app.get("/")
async def root():
    """Health check endpoint"""
    print("DEBUG: Health check endpoint accessed")
    return {"message": "TakeBack API is running", "status": "healthy"}

@app.get("/debug/config")
async def debug_config():
    """Debug endpoint to check configuration"""
    print("DEBUG: Config debug endpoint accessed")
    try:
        from .config.database import supabase
    except ImportError:
        from app.config.database import supabase
    
    return {
        "supabase_configured": supabase is not None,
        "supabase_url": settings.SUPABASE_URL if settings.SUPABASE_URL != "https://placeholder.supabase.co" else "NOT_SET",
        "jwt_secret_configured": settings.JWT_SECRET != "placeholder_secret",
        "environment": "development"
    }

@app.get("/debug/user/{email}")
async def debug_user(email: str):
    """Debug endpoint to check if a user exists in the database"""
    print(f"=== DEBUG USER CHECK ===")
    print(f"DEBUG: Checking for user with email: {email}")
    
    try:
        from .config.database import supabase
    except ImportError:
        from app.config.database import supabase
    
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