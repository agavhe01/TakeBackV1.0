from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer
from ..models.transaction import TransactionCreate, TransactionResponse
from ..services.transaction_service import TransactionService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])
security = HTTPBearer()

@router.post("/", response_model=TransactionResponse)
async def create_transaction(transaction_data: TransactionCreate, token: str = Depends(security)):
    """Create a new transaction"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await TransactionService.create_transaction(user_id, transaction_data)

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(transaction_id: str, transaction_data: TransactionCreate, token: str = Depends(security)):
    """Update a transaction"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await TransactionService.update_transaction(user_id, transaction_id, transaction_data)

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str, token: str = Depends(security)):
    """Delete a transaction"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await TransactionService.delete_transaction(user_id, transaction_id)

@router.get("/", response_model=list[TransactionResponse])
async def get_transactions(
    token: str = Depends(security),
    card_id: str = Query(None),
    budget_id: str = Query(None),
    card_budget_id: str = Query(None)
):
    """Get transactions with optional filters"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await TransactionService.get_transactions(user_id, card_id, budget_id, card_budget_id) 