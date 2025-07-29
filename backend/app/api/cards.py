from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from ..models.card import CardCreate, CardResponse
from ..services.card_service import CardService
from ..services.analytics_service import AnalyticsService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/cards", tags=["Cards"])
security = HTTPBearer()

@router.get("/", response_model=list[CardResponse])
async def get_cards(token: str = Depends(security)):
    """Get all cards for the user"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await CardService.get_cards(user_id)

@router.post("/", response_model=CardResponse)
async def create_card(card_data: CardCreate, token: str = Depends(security)):
    """Create a new card"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await CardService.create_card(user_id, card_data)

@router.put("/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, card_data: CardCreate, token: str = Depends(security)):
    """Update a card"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await CardService.update_card(user_id, card_id, card_data)

@router.delete("/{card_id}")
async def delete_card(card_id: str, token: str = Depends(security)):
    """Delete a card"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await CardService.delete_card(user_id, card_id)

@router.get("/{card_id}/balance")
async def get_card_balance(card_id: str, period: str = "month", token: str = Depends(security)):
    """Get balance information for a specific card"""
    payload = verify_token(token.credentials)
    user_id = payload.get("sub")
    return await CardService.get_card_balance(user_id, card_id, period) 