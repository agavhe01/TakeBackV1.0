from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from ..services.card_budget_service import CardBudgetService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/card-budgets", tags=["Card Budgets"])
security = HTTPBearer()

@router.get("/")
async def get_card_budgets(token: str = Depends(security)):
    """Get all card-budget combinations for the user"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await CardBudgetService.get_card_budgets(user_id) 