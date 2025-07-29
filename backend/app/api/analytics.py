from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer
from ..models.analytics import SpendingAnalyticsResponse, RecentTransactionResponse, BalanceResponse
from ..services.analytics_service import AnalyticsService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
security = HTTPBearer()

@router.get("/spending", response_model=list[SpendingAnalyticsResponse])
async def get_spending_analytics(
    token: str = Depends(security),
    period: str = Query("month", description="Time period: week, month, quarter, year")
):
    """Get spending analytics for the user"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await AnalyticsService.get_spending_analytics(user_id, period)

@router.get("/transactions/recent", response_model=list[RecentTransactionResponse])
async def get_recent_transactions(
    token: str = Depends(security),
    limit: int = Query(10, description="Number of recent transactions to return")
):
    """Get recent transactions for the user"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await AnalyticsService.get_recent_transactions(user_id, limit)

@router.get("/balances", response_model=BalanceResponse)
async def get_balances(
    token: str = Depends(security),
    period: str = Query("month", description="Time period: week, month, quarter, year")
):
    """Get balance information for the user"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await AnalyticsService.get_balances(user_id, period) 