from pydantic import BaseModel

class BudgetCreate(BaseModel):
    name: str
    limit_amount: float
    period: str  # 'monthly', 'weekly', 'quarterly'
    require_receipts: bool = False

class BudgetResponse(BaseModel):
    id: str
    account_id: str
    name: str
    limit_amount: float
    period: str
    require_receipts: bool
    created_at: str

class BudgetBalance(BaseModel):
    budget_id: str
    budget_name: str
    limit_amount: float
    spent_amount: float
    remaining_amount: float
    period: str

class CardBudgetCreate(BaseModel):
    card_id: str
    budget_id: str

class CardBudgetResponse(BaseModel):
    id: str
    card_id: str
    budget_id: str
    created_at: str 