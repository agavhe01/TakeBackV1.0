from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer
from typing import Optional
from ..models.receipt import ReceiptCreate, ReceiptResponse, ReceiptUploadResponse
from ..services.receipt_service import ReceiptService
from ..utils.jwt import verify_token

router = APIRouter(prefix="/api/receipts", tags=["Receipts"])
security = HTTPBearer()

@router.post("/upload", response_model=ReceiptUploadResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    name: str = Form(...),
    type: str = Form(...),
    description: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    date_of_purchase: Optional[str] = Form(None),
    token: str = Depends(security)
):
    """Upload a receipt file and create database record"""
    print(f"=== UPLOAD RECEIPT API ENDPOINT ===")
    print(f"DEBUG: Received upload request")
    print(f"DEBUG: File: {file.filename}")
    print(f"DEBUG: Name: {name}")
    print(f"DEBUG: Type: {type}")
    print(f"DEBUG: Description: {description}")
    print(f"DEBUG: Amount: {amount}")
    print(f"DEBUG: Date of purchase: {date_of_purchase}")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Authenticated user ID: {user_id}")
        
        receipt_data = ReceiptCreate(
            name=name,
            type=type,
            description=description,
            amount=amount,
            date_of_purchase=date_of_purchase
        )
        print(f"DEBUG: Created receipt data object: {receipt_data}")
        
        result = await ReceiptService.upload_receipt_file(user_id, file, receipt_data)
        print(f"DEBUG: Upload completed successfully: {result}")
        return result
        
    except Exception as e:
        print(f"DEBUG: Upload endpoint error: {str(e)}")
        raise

@router.get("/", response_model=list[ReceiptResponse])
async def get_receipts(token: str = Depends(security)):
    """Get all receipts for the authenticated user"""
    print(f"=== GET RECEIPTS API ENDPOINT ===")
    print(f"DEBUG: Received get receipts request")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Authenticated user ID: {user_id}")
        
        receipts = await ReceiptService.get_receipts(user_id)
        print(f"DEBUG: Retrieved {len(receipts)} receipts")
        return receipts
        
    except Exception as e:
        print(f"DEBUG: Get receipts endpoint error: {str(e)}")
        raise

@router.get("/{receipt_id}", response_model=ReceiptResponse)
async def get_receipt(receipt_id: str, token: str = Depends(security)):
    """Get a specific receipt"""
    print(f"=== GET RECEIPT API ENDPOINT ===")
    print(f"DEBUG: Received get receipt request")
    print(f"DEBUG: Receipt ID: {receipt_id}")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Authenticated user ID: {user_id}")
        
        receipt = await ReceiptService.get_receipt(user_id, receipt_id)
        print(f"DEBUG: Retrieved receipt: {receipt}")
        return receipt
        
    except Exception as e:
        print(f"DEBUG: Get receipt endpoint error: {str(e)}")
        raise

@router.delete("/{receipt_id}")
async def delete_receipt(receipt_id: str, token: str = Depends(security)):
    """Delete a receipt and its associated file"""
    print(f"=== DELETE RECEIPT API ENDPOINT ===")
    print(f"DEBUG: Received delete receipt request")
    print(f"DEBUG: Receipt ID: {receipt_id}")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Authenticated user ID: {user_id}")
        
        result = await ReceiptService.delete_receipt(user_id, receipt_id)
        print(f"DEBUG: Receipt deleted successfully: {result}")
        return result
        
    except Exception as e:
        print(f"DEBUG: Delete receipt endpoint error: {str(e)}")
        raise 