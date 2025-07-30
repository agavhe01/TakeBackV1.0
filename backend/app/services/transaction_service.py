from fastapi import HTTPException
from datetime import datetime
from ..config.database import supabase
from ..models.transaction import TransactionCreate, TransactionResponse
import traceback

class TransactionService:
    @staticmethod
    async def create_transaction(user_id: str, transaction_data: TransactionCreate):
        """Create a new transaction"""
        print(f"=== CREATE TRANSACTION ===")
        print(f"DEBUG: Received transaction creation request")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            # Extract card_budget_id from the transaction_data
            card_budget_id = transaction_data.card_budget_id
            
            # Verify the card_budget_id belongs to the user
            card_budget_response = supabase.table("card_budgets").select("card_id, budget_id").eq("id", card_budget_id).execute()
            
            if not card_budget_response.data:
                raise HTTPException(status_code=403, detail="Card-Budget combination not found")
            
            # Get card and budget IDs from the verified card_budget_id
            card_id = card_budget_response.data[0]["card_id"]
            budget_id = card_budget_response.data[0]["budget_id"]
            
            # Verify the card belongs to the user
            card_response = supabase.table("cards").select("account_id").eq("id", card_id).execute()
            if not card_response.data or card_response.data[0]["account_id"] != user_id:
                raise HTTPException(status_code=403, detail="Card not found or access denied")
            
            transaction_insert_data = {
                "card_budget_id": card_budget_id,
                "amount": transaction_data.amount,
                "name": transaction_data.name,
                "date": transaction_data.date if transaction_data.date else datetime.utcnow().isoformat(),
                "description": transaction_data.description,
                "category": transaction_data.category,
                "receipt_id": transaction_data.receipt_id
            }
            
            print(f"DEBUG: Inserting transaction data: {transaction_insert_data}")
            response = supabase.table("transactions").insert(transaction_insert_data).execute()
            
            print(f"DEBUG: Insert response: {response}")
            
            if response.data:
                # Enrich response with card and budget IDs
                transaction_data = response.data[0]
                return TransactionResponse(**transaction_data, card_id=card_id, budget_id=budget_id)
            else:
                print(f"DEBUG: No data returned from insert")
                raise HTTPException(status_code=400, detail="Failed to create transaction")
                
        except Exception as e:
            print(f"DEBUG: Transaction creation error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def update_transaction(user_id: str, transaction_id: str, transaction_data: TransactionCreate):
        """Update a transaction"""
        print(f"=== UPDATE TRANSACTION ===")
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        try:
            # Validate card_budget_id ownership
            card_budget_response = supabase.table("card_budgets").select("card_id, budget_id").eq("id", transaction_data.card_budget_id).execute()
            if not card_budget_response.data:
                raise HTTPException(status_code=403, detail="Card or Budget not found or access denied")
            card_id = card_budget_response.data[0]["card_id"]
            # Check card ownership
            card_response = supabase.table("cards").select("account_id").eq("id", card_id).execute()
            if not card_response.data or card_response.data[0]["account_id"] != user_id:
                raise HTTPException(status_code=403, detail="Card not found or access denied")
            update_data = {
                "card_budget_id": transaction_data.card_budget_id,
                "amount": transaction_data.amount,
                "name": transaction_data.name,
                "date": transaction_data.date if transaction_data.date else datetime.utcnow().isoformat(),
                "description": transaction_data.description,
                "category": transaction_data.category,
                "receipt_id": transaction_data.receipt_id
            }
            response = supabase.table("transactions").update(update_data).eq("id", transaction_id).execute()
            if response.data:
                # Enrich response
                card_budget_response = supabase.table("card_budgets").select("card_id, budget_id").eq("id", response.data[0]["card_budget_id"]).execute()
                card_id = card_budget_response.data[0]["card_id"] if card_budget_response.data else None
                budget_id = card_budget_response.data[0]["budget_id"] if card_budget_response.data else None
                return TransactionResponse(**response.data[0], card_id=card_id, budget_id=budget_id)
            else:
                raise HTTPException(status_code=400, detail="Failed to update transaction")
        except Exception as e:
            print(f"DEBUG: Update transaction error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def delete_transaction(user_id: str, transaction_id: str):
        """Delete a transaction"""
        print(f"=== DELETE TRANSACTION ===")
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        try:
            # Fetch transaction to validate ownership
            transaction_response = supabase.table("transactions").select("card_budget_id").eq("id", transaction_id).execute()
            if not transaction_response.data:
                raise HTTPException(status_code=404, detail="Transaction not found")
            card_budget_id = transaction_response.data[0]["card_budget_id"]
            card_budget_response = supabase.table("card_budgets").select("card_id").eq("id", card_budget_id).execute()
            if not card_budget_response.data:
                raise HTTPException(status_code=403, detail="Card or Budget not found or access denied")
            card_id = card_budget_response.data[0]["card_id"]
            card_response = supabase.table("cards").select("account_id").eq("id", card_id).execute()
            if not card_response.data or card_response.data[0]["account_id"] != user_id:
                raise HTTPException(status_code=403, detail="Card not found or access denied")
            # Delete transaction
            supabase.table("transactions").delete().eq("id", transaction_id).execute()
            return {"detail": "Transaction deleted successfully"}
        except Exception as e:
            print(f"DEBUG: Delete transaction error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_transactions(user_id: str, card_id: str = None, budget_id: str = None, card_budget_id: str = None):
        """Get transactions with optional filters"""
        print(f"=== GET TRANSACTIONS (with filters) ===")
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        try:
            # Get all card_budgets for the user
            card_budgets_query = supabase.table("card_budgets").select("id, card_id, budget_id")
            card_budgets_response = card_budgets_query.execute()
            card_budget_map = {cb["id"]: cb for cb in card_budgets_response.data}
            # Filter card_budgets by user ownership
            user_card_ids = [c["id"] for c in supabase.table("cards").select("id, account_id").eq("account_id", user_id).execute().data]
            user_card_budget_ids = [cbid for cbid, cb in card_budget_map.items() if cb["card_id"] in user_card_ids]
            # Apply filters
            filtered_card_budget_ids = user_card_budget_ids
            if card_id:
                filtered_card_budget_ids = [cbid for cbid in filtered_card_budget_ids if card_budget_map[cbid]["card_id"] == card_id]
            if budget_id:
                filtered_card_budget_ids = [cbid for cbid in filtered_card_budget_ids if card_budget_map[cbid]["budget_id"] == budget_id]
            if card_budget_id:
                filtered_card_budget_ids = [cbid for cbid in filtered_card_budget_ids if cbid == card_budget_id]
            if not filtered_card_budget_ids:
                return []
            # Get transactions for filtered card_budget_ids
            response = supabase.table("transactions").select("*").in_("card_budget_id", filtered_card_budget_ids).execute()
            transactions_with_details = []
            for transaction in response.data:
                cb = card_budget_map.get(transaction["card_budget_id"])
                card_id = cb["card_id"] if cb else None
                budget_id = cb["budget_id"] if cb else None
                transactions_with_details.append({**transaction, "card_id": card_id, "budget_id": budget_id})
            return [TransactionResponse(**t) for t in transactions_with_details]
        except Exception as e:
            print(f"DEBUG: Get transactions error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) 