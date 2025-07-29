from pydantic import BaseModel
from typing import List
from .budget import BudgetBalance

class CardCreate(BaseModel):
    name: str
    status: str = "issued"  # 'issued', 'frozen', 'cancelled'
    balance: float = 0
    cardholder_name: str
    cvv: str
    expiry: str
    zipcode: str
    address: str
    budget_ids: List[str] = []  # List of budget IDs to associate with the card

class CardResponse(BaseModel):
    id: str
    account_id: str
    name: str
    status: str
    balance: float
    cardholder_name: str
    cvv: str
    expiry: str
    zipcode: str
    address: str
    budget_ids: List[str] = []  # List of associated budget IDs
    created_at: str

class CardBalance(BaseModel):
    card_id: str
    card_name: str
    total_spent: float
    total_limit: float
    remaining_amount: float
    budget_balances: List[BudgetBalance] 