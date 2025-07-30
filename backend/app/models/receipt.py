from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReceiptCreate(BaseModel):
    name: str
    type: str  # "image" or "document"
    description: Optional[str] = None
    amount: Optional[float] = None
    date_of_purchase: Optional[str] = None

class ReceiptResponse(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    amount: Optional[float] = None
    url: str
    date_added: str
    date_of_purchase: str
    account_id: str

class ReceiptUploadResponse(BaseModel):
    success: bool
    message: str
    receipt_id: Optional[str] = None
    url: Optional[str] = None 