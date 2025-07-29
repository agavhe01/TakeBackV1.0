from fastapi import HTTPException
from datetime import datetime
from ..config.database import supabase
from ..models.budget import BudgetCreate, BudgetResponse
import traceback

class BudgetService:
    @staticmethod
    async def create_budget(user_id: str, budget_data: BudgetCreate):
        """Create a new budget"""
        print(f"=== CREATE BUDGET ===")
        print(f"DEBUG: Received budget creation request")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            budget_insert_data = {
                "account_id": user_id,
                "name": budget_data.name,
                "limit_amount": budget_data.limit_amount,
                "period": budget_data.period,
                "require_receipts": budget_data.require_receipts,
                "created_at": datetime.utcnow().isoformat()
            }
            
            response = supabase.table("budgets").insert(budget_insert_data).execute()
            
            if response.data:
                return BudgetResponse(**response.data[0])
            else:
                raise HTTPException(status_code=400, detail="Failed to create budget")
                
        except Exception as e:
            print(f"DEBUG: Budget creation error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_budgets(user_id: str):
        """Get all budgets for a user"""
        print(f"=== GET BUDGETS ===")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            response = supabase.table("budgets").select("*").eq("account_id", user_id).order("created_at", desc=True).execute()
            
            return [BudgetResponse(**budget) for budget in response.data]
            
        except Exception as e:
            print(f"DEBUG: Get budgets error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def update_budget(user_id: str, budget_id: str, budget_data: BudgetCreate):
        """Update a budget"""
        print(f"=== UPDATE BUDGET ===")
        print(f"DEBUG: Received budget update request for budget ID: {budget_id}")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Verify the budget belongs to the user
            budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
            
            if not budget_response.data:
                raise HTTPException(status_code=404, detail="Budget not found")
            
            budget_update_data = {
                "name": budget_data.name,
                "limit_amount": budget_data.limit_amount,
                "period": budget_data.period,
                "require_receipts": budget_data.require_receipts
            }
            
            print(f"DEBUG: Updating budget with data: {budget_update_data}")
            
            response = supabase.table("budgets").update(budget_update_data).eq("id", budget_id).execute()
            
            print(f"DEBUG: Update budget response: {response}")
            
            if response.data:
                return BudgetResponse(**response.data[0])
            else:
                raise HTTPException(status_code=400, detail="Failed to update budget")
                
        except Exception as e:
            print(f"DEBUG: Update budget error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def delete_budget(user_id: str, budget_id: str):
        """Delete a budget"""
        print(f"=== DELETE BUDGET ===")
        print(f"DEBUG: Received budget deletion request for budget ID: {budget_id}")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Verify the budget belongs to the user
            budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
            
            if not budget_response.data:
                raise HTTPException(status_code=404, detail="Budget not found")
            
            print(f"DEBUG: Deleting budget with ID: {budget_id}")
            
            response = supabase.table("budgets").delete().eq("id", budget_id).execute()
            
            print(f"DEBUG: Delete budget response: {response}")
            
            if response.data:
                return {"message": "Budget deleted successfully"}
            else:
                raise HTTPException(status_code=400, detail="Failed to delete budget")
                
        except Exception as e:
            print(f"DEBUG: Delete budget error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) 