from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from ..models.policy import PolicyCreate, PolicyResponse
from ..services.policy_service import PolicyService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/policies", tags=["Policies"])
security = HTTPBearer()

@router.post("/", response_model=PolicyResponse)
async def create_policy(policy_data: PolicyCreate, token: str = Depends(security)):
    """Create a new policy"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await PolicyService.create_policy(user_id, policy_data)

@router.get("/", response_model=list[PolicyResponse])
async def get_policies(token: str = Depends(security)):
    """Get all policies for the user"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await PolicyService.get_policies(user_id) 