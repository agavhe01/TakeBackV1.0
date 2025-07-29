from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from ..models.budget import BudgetCreate, BudgetResponse
from ..services.budget_service import BudgetService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])
security = HTTPBearer()

@router.post("/", response_model=BudgetResponse)
async def create_budget(budget_data: BudgetCreate, token: str = Depends(security)):
    """Create a new budget"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await BudgetService.create_budget(user_id, budget_data)

@router.get("/", response_model=list[BudgetResponse])
async def get_budgets(token: str = Depends(security)):
    """Get all budgets for the user"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await BudgetService.get_budgets(user_id)

@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(budget_id: str, budget_data: BudgetCreate, token: str = Depends(security)):
    """Update a budget"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await BudgetService.update_budget(user_id, budget_id, budget_data)

@router.delete("/{budget_id}")
async def delete_budget(budget_id: str, token: str = Depends(security)):
    """Delete a budget"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await BudgetService.delete_budget(user_id, budget_id) 