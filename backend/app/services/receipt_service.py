from fastapi import HTTPException, UploadFile
from datetime import datetime
import os
import uuid
from typing import Optional
from ..config.database import supabase
from ..models.receipt import ReceiptCreate, ReceiptResponse, ReceiptUploadResponse
import traceback

class ReceiptService:
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    def _is_valid_file_type(filename: str) -> bool:
        """Check if file type is allowed"""
        print(f"DEBUG: Checking file type for filename: {filename}")
        ext = os.path.splitext(filename.lower())[1]
        print(f"DEBUG: File extension: {ext}")
        is_valid = ext in ReceiptService.ALLOWED_EXTENSIONS
        print(f"DEBUG: Is valid file type: {is_valid}")
        return is_valid
    
    @staticmethod
    def _sanitize_filename(filename: str) -> str:
        """Sanitize filename for safe storage"""
        print(f"DEBUG: Sanitizing filename: {filename}")
        import re
        # Remove special characters and spaces
        sanitized = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
        # Add timestamp to prevent conflicts
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(sanitized)
        final_name = f"{name}_{timestamp}{ext}"
        print(f"DEBUG: Sanitized filename: {final_name}")
        return final_name
    
    @staticmethod
    async def upload_receipt_file(user_id: str, file: UploadFile, receipt_data: ReceiptCreate) -> ReceiptUploadResponse:
        """Upload receipt file to storage and create database record"""
        print(f"=== UPLOAD RECEIPT FILE ===")
        print(f"DEBUG: User ID: {user_id}")
        print(f"DEBUG: File name: {file.filename}")
        print(f"DEBUG: File content type: {file.content_type}")
        print(f"DEBUG: Receipt data: {receipt_data}")
        
        if not supabase:
            print("DEBUG: Supabase not configured")
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            # Validate file type
            print(f"DEBUG: Validating file type...")
            if not ReceiptService._is_valid_file_type(file.filename):
                print(f"DEBUG: Invalid file type detected")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file type. Allowed types: {', '.join(ReceiptService.ALLOWED_EXTENSIONS)}"
                )
            
            # Validate file size
            print(f"DEBUG: Reading file content for size validation...")
            file_content = await file.read()
            file_size = len(file_content)
            print(f"DEBUG: File size: {file_size} bytes")
            print(f"DEBUG: Max allowed size: {ReceiptService.MAX_FILE_SIZE} bytes")
            
            if file_size > ReceiptService.MAX_FILE_SIZE:
                print(f"DEBUG: File too large - {file_size} > {ReceiptService.MAX_FILE_SIZE}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"File too large. Maximum size: {ReceiptService.MAX_FILE_SIZE // (1024*1024)}MB"
                )
            
            # Generate unique filename
            print(f"DEBUG: Generating unique filename...")
            sanitized_filename = ReceiptService._sanitize_filename(file.filename)
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            file_extension = os.path.splitext(file.filename)[1].lower()
            unique_filename = f"{timestamp}_{sanitized_filename}"
            print(f"DEBUG: Unique filename generated: {unique_filename}")
            
            # Create user folder path: receipts/{user_id}/
            user_folder_path = f"receipts/{user_id}/"
            file_path = f"{user_folder_path}{unique_filename}"
            print(f"DEBUG: Full file path: {file_path}")
            
            # Upload file to Supabase Storage
            print(f"DEBUG: Uploading file to Supabase Storage...")
            print(f"DEBUG: Bucket: supporting-documents-storage-bucket")
            print(f"DEBUG: Path: {file_path}")
            
            try:
                storage_response = supabase.storage.from_("supporting-documents-storage-bucket").upload(
                    path=file_path,
                    file=file_content,
                    file_options={"content-type": file.content_type}
                )
                
                print(f"DEBUG: Storage response: {storage_response}")
                
                if not storage_response:
                    print("DEBUG: Storage upload failed - no response")
                    raise HTTPException(status_code=500, detail="Failed to upload file to storage")
                    
            except Exception as storage_error:
                print(f"DEBUG: Storage upload error: {storage_error}")
                if "row-level security policy" in str(storage_error).lower():
                    raise HTTPException(
                        status_code=500, 
                        detail="Storage access denied. Please check Supabase storage configuration. Error: " + str(storage_error)
                    )
                else:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Storage upload failed: {str(storage_error)}"
                    )
            
            # Get public URL for the uploaded file
            print(f"DEBUG: Getting public URL for uploaded file...")
            file_url = supabase.storage.from_("supporting-documents-storage-bucket").get_public_url(file_path)
            print(f"DEBUG: Public URL: {file_url}")
            
            # Create database record
            print(f"DEBUG: Creating database record...")
            receipt_insert_data = {
                "name": receipt_data.name,
                "type": receipt_data.type,
                "description": receipt_data.description,
                "amount": receipt_data.amount,
                "url": file_url,
                "account_id": user_id,
                "date_of_purchase": receipt_data.date_of_purchase if receipt_data.date_of_purchase else datetime.utcnow().isoformat()
            }
            
            print(f"DEBUG: Receipt insert data: {receipt_insert_data}")
            db_response = supabase.table("receipts").insert(receipt_insert_data).execute()
            print(f"DEBUG: Database response: {db_response}")
            
            if not db_response.data:
                print("DEBUG: Database insert failed - no data returned")
                # If database insert fails, we should clean up the uploaded file
                try:
                    print("DEBUG: Attempting to clean up uploaded file...")
                    supabase.storage.from_("supporting-documents-storage-bucket").remove([file_path])
                    print("DEBUG: File cleanup successful")
                except Exception as cleanup_error:
                    print(f"DEBUG: File cleanup failed: {cleanup_error}")
                    pass  # Ignore cleanup errors
                raise HTTPException(status_code=500, detail="Failed to create receipt record")
            
            receipt_id = db_response.data[0]["id"]
            print(f"DEBUG: Receipt created with ID: {receipt_id}")
            
            response = ReceiptUploadResponse(
                success=True,
                message="Receipt uploaded successfully",
                receipt_id=receipt_id,
                url=file_url
            )
            print(f"DEBUG: Returning success response: {response}")
            return response
            
        except HTTPException:
            print("DEBUG: Re-raising HTTPException")
            raise
        except Exception as e:
            print(f"DEBUG: Receipt upload error: {str(e)}")
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to upload receipt: {str(e)}")
    
    @staticmethod
    async def get_receipts(user_id: str) -> list[ReceiptResponse]:
        """Get all receipts for a user"""
        print(f"=== GET RECEIPTS ===")
        print(f"DEBUG: User ID: {user_id}")
        
        if not supabase:
            print("DEBUG: Supabase not configured")
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Querying receipts for user...")
            response = supabase.table("receipts").select("*").eq("account_id", user_id).order("date_added", desc=True).execute()
            print(f"DEBUG: Database response: {response}")
            
            if response.data:
                receipts = [ReceiptResponse(**receipt) for receipt in response.data]
                print(f"DEBUG: Found {len(receipts)} receipts")
                return receipts
            else:
                print("DEBUG: No receipts found")
                return []
            
        except Exception as e:
            print(f"DEBUG: Get receipts error: {str(e)}")
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=400, detail=str(e))
    
    @staticmethod
    async def get_receipt(user_id: str, receipt_id: str) -> ReceiptResponse:
        """Get a specific receipt"""
        print(f"=== GET RECEIPT ===")
        print(f"DEBUG: User ID: {user_id}")
        print(f"DEBUG: Receipt ID: {receipt_id}")
        
        if not supabase:
            print("DEBUG: Supabase not configured")
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Querying specific receipt...")
            response = supabase.table("receipts").select("*").eq("id", receipt_id).eq("account_id", user_id).execute()
            print(f"DEBUG: Database response: {response}")
            
            if not response.data:
                print("DEBUG: Receipt not found")
                raise HTTPException(status_code=404, detail="Receipt not found")
            
            receipt = ReceiptResponse(**response.data[0])
            print(f"DEBUG: Found receipt: {receipt}")
            return receipt
            
        except HTTPException:
            print("DEBUG: Re-raising HTTPException")
            raise
        except Exception as e:
            print(f"DEBUG: Get receipt error: {str(e)}")
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=400, detail=str(e))
    
    @staticmethod
    async def delete_receipt(user_id: str, receipt_id: str):
        """Delete a receipt and its associated file"""
        print(f"=== DELETE RECEIPT ===")
        print(f"DEBUG: User ID: {user_id}")
        print(f"DEBUG: Receipt ID: {receipt_id}")
        
        if not supabase:
            print("DEBUG: Supabase not configured")
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            # Get receipt to get file URL
            print(f"DEBUG: Getting receipt details for deletion...")
            response = supabase.table("receipts").select("url").eq("id", receipt_id).eq("account_id", user_id).execute()
            print(f"DEBUG: Receipt query response: {response}")
            
            if not response.data:
                print("DEBUG: Receipt not found for deletion")
                raise HTTPException(status_code=404, detail="Receipt not found")
            
            file_url = response.data[0]["url"]
            print(f"DEBUG: File URL: {file_url}")
            
            # Extract file path from URL
            # URL format: https://xxx.supabase.co/storage/v1/object/public/supporting-documents-storage-bucket/receipts/user_id/filename
            try:
                file_path = file_url.split("supporting-documents-storage-bucket/")[1]
                print(f"DEBUG: Extracted file path: {file_path}")
            except Exception as e:
                print(f"DEBUG: Failed to extract file path from URL: {e}")
                file_path = None
            
            # Delete from database first
            print(f"DEBUG: Deleting receipt from database...")
            db_delete_response = supabase.table("receipts").delete().eq("id", receipt_id).execute()
            print(f"DEBUG: Database delete response: {db_delete_response}")
            
            # Delete file from storage if path was extracted
            if file_path:
                try:
                    print(f"DEBUG: Deleting file from storage...")
                    storage_delete_response = supabase.storage.from_("supporting-documents-storage-bucket").remove([file_path])
                    print(f"DEBUG: Storage delete response: {storage_delete_response}")
                except Exception as e:
                    print(f"DEBUG: Failed to delete file from storage: {str(e)}")
                    # Don't fail the request if file deletion fails
            else:
                print("DEBUG: No file path extracted, skipping file deletion")
            
            print("DEBUG: Receipt deletion completed successfully")
            return {"detail": "Receipt deleted successfully"}
            
        except HTTPException:
            print("DEBUG: Re-raising HTTPException")
            raise
        except Exception as e:
            print(f"DEBUG: Delete receipt error: {str(e)}")
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=400, detail=str(e)) 