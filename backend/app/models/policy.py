from pydantic import BaseModel
from typing import Optional

class PolicyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    memo_threshold: Optional[float] = None
    memo_prompt: Optional[str] = None

class PolicyResponse(BaseModel):
    id: str
    account_id: str
    name: str
    description: Optional[str]
    memo_threshold: Optional[float]
    memo_prompt: Optional[str]
    created_at: str 