from fastapi import HTTPException
from ..config.database import supabase
import traceback

class CardBudgetService:
    @staticmethod
    async def get_card_budgets(user_id: str):
        """Get all card-budget combinations for a user"""
        print(f"=== GET CARD BUDGETS ===")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Get all card_budgets for the user's cards
            response = supabase.table("card_budgets").select("id, card_id, budget_id").execute()
            
            print(f"DEBUG: Card budgets response: {response}")
            
            if response.data:
                # Get card and budget details for each card_budget
                card_budgets_with_details = []
                for cb in response.data:
                    # Get card details
                    card_response = supabase.table("cards").select("name, account_id").eq("id", cb["card_id"]).execute()
                    if card_response.data and card_response.data[0]["account_id"] == user_id:
                        # Get budget details
                        budget_response = supabase.table("budgets").select("name").eq("id", cb["budget_id"]).execute()
                        if budget_response.data:
                            card_budgets_with_details.append({
                                "id": cb["id"],
                                "card_id": cb["card_id"],
                                "budget_id": cb["budget_id"],
                                "card_name": card_response.data[0]["name"],
                                "budget_name": budget_response.data[0]["name"]
                            })
                
                return card_budgets_with_details
            else:
                return []
                
        except Exception as e:
            print(f"DEBUG: Get card budgets error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) 