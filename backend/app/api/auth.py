from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from ..models.auth import UserSignup, UserLogin, UserResponse, UserProfileUpdate
from ..services.auth_service import AuthService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/signup")
async def signup(user_data: UserSignup):
    """User signup endpoint"""
    return await AuthService.signup(user_data)

@router.post("/login")
async def login(user_data: UserLogin):
    """User login endpoint"""
    return await AuthService.login(user_data)

@router.get("/profile")
async def get_profile(token: str = Depends(security)):
    """Get user profile endpoint"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await AuthService.get_profile(user_id)

@router.put("/update-profile")
async def update_profile(profile_data: UserProfileUpdate, token: str = Depends(security)):
    """Update user profile endpoint"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await AuthService.update_profile(user_id, profile_data) 