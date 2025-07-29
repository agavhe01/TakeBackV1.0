from pydantic import BaseModel
from typing import List, Optional
from .budget import BudgetBalance
from .card import CardBalance

class SpendingAnalyticsResponse(BaseModel):
    budget_id: str
    budget_name: str
    total_spent: float
    percentage: float
    color: str

class RecentTransactionResponse(BaseModel):
    id: str
    name: str
    amount: float
    date: str
    card_name: str
    budget_name: str
    category: Optional[str] = None
    merchant: Optional[str] = None

class BalanceResponse(BaseModel):
    card_balances: List[CardBalance]
    total_spent: float
    total_limit: float
    total_remaining: float 