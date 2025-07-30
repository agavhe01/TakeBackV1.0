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
    token: str = Depends(security)
):
    """Upload a receipt file only"""
    print(f"=== UPLOAD RECEIPT API ENDPOINT ===")
    print(f"DEBUG: Received upload request")
    print(f"DEBUG: File: {file.filename}")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Authenticated user ID: {user_id}")
        
        # Create minimal receipt data for upload
        receipt_data = ReceiptCreate(
            name=file.filename or "Uploaded File",
            type="image" if file.content_type and file.content_type.startswith("image/") else "document"
        )
        print(f"DEBUG: Created receipt data object: {receipt_data}")
        
        result = await ReceiptService.upload_receipt_file(user_id, file, receipt_data)
        print(f"DEBUG: Upload completed successfully: {result}")
        return result
        
    except Exception as e:
        print(f"DEBUG: Upload endpoint error: {str(e)}")
        raise

@router.post("/", response_model=ReceiptResponse)
async def create_receipt(
    receipt_data: ReceiptCreate,
    token: str = Depends(security)
):
    """Create a receipt record in the database"""
    print(f"=== CREATE RECEIPT API ENDPOINT ===")
    print(f"DEBUG: Received create receipt request")
    print(f"DEBUG: Receipt data: {receipt_data}")
    
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        print(f"DEBUG: Authenticated user ID: {user_id}")
        
        result = await ReceiptService.create_receipt(user_id, receipt_data)
        print(f"DEBUG: Receipt created successfully: {result}")
        return result
        
    except Exception as e:
        print(f"DEBUG: Create receipt endpoint error: {str(e)}")
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