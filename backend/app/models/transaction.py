from pydantic import BaseModel
from typing import Optional

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