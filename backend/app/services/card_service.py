from fastapi import HTTPException
from datetime import datetime, timedelta
from ..config.database import supabase
from ..models.card import CardCreate, CardResponse
from ..models.analytics import CardBalance, BudgetBalance
import traceback

class CardService:
    @staticmethod
    async def get_cards(user_id: str):
        """Get all cards for a user"""
        print(f"=== GET CARDS ===")
        print(f"DEBUG: Received get cards request")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Get all cards for the user with their associated budgets
            cards_response = supabase.table("cards").select("*").eq("account_id", user_id).execute()
            
            print(f"DEBUG: Cards response: {cards_response}")
            
            if cards_response.data:
                cards_with_budgets = []
                for card in cards_response.data:
                    # Get associated budgets for this card
                    card_budgets_response = supabase.table("card_budgets").select("budget_id").eq("card_id", card["id"]).execute()
                    budget_ids = [cb["budget_id"] for cb in card_budgets_response.data] if card_budgets_response.data else []
                    
                    card_with_budgets = {**card, "budget_ids": budget_ids}
                    cards_with_budgets.append(CardResponse(**card_with_budgets))
                
                return cards_with_budgets
            else:
                return []
                
        except Exception as e:
            print(f"DEBUG: Get cards error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def create_card(user_id: str, card_data: CardCreate):
        """Create a new card"""
        print(f"=== CREATE CARD ===")
        print(f"DEBUG: Received card creation request")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            card_insert_data = {
                "account_id": user_id,
                "name": card_data.name,
                "status": card_data.status,
                "balance": card_data.balance,
                "cardholder_name": card_data.cardholder_name,
                "cvv": card_data.cvv,
                "expiry": card_data.expiry,
                "zipcode": card_data.zipcode,
                "address": card_data.address,
                "created_at": datetime.utcnow().isoformat()
            }
            
            print(f"DEBUG: Creating card with data: {card_insert_data}")
            
            response = supabase.table("cards").insert(card_insert_data).execute()
            
            print(f"DEBUG: Create card response: {response}")
            
            if response.data:
                created_card = response.data[0]
                
                # Associate budgets with the card if provided
                if card_data.budget_ids:
                    for budget_id in card_data.budget_ids:
                        # Verify the budget belongs to the user
                        budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
                        if budget_response.data:
                            card_budget_data = {
                                "card_id": created_card["id"],
                                "budget_id": budget_id,
                                "created_at": datetime.utcnow().isoformat()
                            }
                            supabase.table("card_budgets").insert(card_budget_data).execute()
                
                return CardResponse(**{**created_card, "budget_ids": card_data.budget_ids})
            else:
                raise HTTPException(status_code=400, detail="Failed to create card")
                
        except Exception as e:
            print(f"DEBUG: Create card error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def update_card(user_id: str, card_id: str, card_data: CardCreate):
        """Update a card"""
        print(f"=== UPDATE CARD ===")
        print(f"DEBUG: Received card update request for card ID: {card_id}")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Verify the card belongs to the user
            card_response = supabase.table("cards").select("*").eq("id", card_id).eq("account_id", user_id).execute()
            
            if not card_response.data:
                raise HTTPException(status_code=404, detail="Card not found")
            
            card_update_data = {
                "name": card_data.name,
                "status": card_data.status,
                "balance": card_data.balance,
                "cardholder_name": card_data.cardholder_name,
                "cvv": card_data.cvv,
                "expiry": card_data.expiry,
                "zipcode": card_data.zipcode,
                "address": card_data.address,
            }
            
            print(f"DEBUG: Updating card with data: {card_update_data}")
            
            response = supabase.table("cards").update(card_update_data).eq("id", card_id).execute()
            
            print(f"DEBUG: Update card response: {response}")
            
            if response.data:
                updated_card = response.data[0]
                
                # Update budget associations
                # First, remove all existing budget associations
                supabase.table("card_budgets").delete().eq("card_id", card_id).execute()
                
                # Then add new budget associations
                if card_data.budget_ids:
                    for budget_id in card_data.budget_ids:
                        # Verify the budget belongs to the user
                        budget_response = supabase.table("budgets").select("*").eq("id", budget_id).eq("account_id", user_id).execute()
                        if budget_response.data:
                            card_budget_data = {
                                "card_id": card_id,
                                "budget_id": budget_id,
                                "created_at": datetime.utcnow().isoformat()
                            }
                            supabase.table("card_budgets").insert(card_budget_data).execute()
                
                return CardResponse(**{**updated_card, "budget_ids": card_data.budget_ids})
            else:
                raise HTTPException(status_code=400, detail="Failed to update card")
                
        except Exception as e:
            print(f"DEBUG: Update card error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def delete_card(user_id: str, card_id: str):
        """Delete a card"""
        print(f"=== DELETE CARD ===")
        print(f"DEBUG: Received card deletion request for card ID: {card_id}")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Verify the card belongs to the user
            card_response = supabase.table("cards").select("*").eq("id", card_id).eq("account_id", user_id).execute()
            
            if not card_response.data:
                raise HTTPException(status_code=404, detail="Card not found")
            
            print(f"DEBUG: Deleting card with ID: {card_id}")
            
            response = supabase.table("cards").delete().eq("id", card_id).execute()
            
            print(f"DEBUG: Delete card response: {response}")
            
            if response.data:
                return {"message": "Card deleted successfully"}
            else:
                raise HTTPException(status_code=400, detail="Failed to delete card")
                
        except Exception as e:
            print(f"DEBUG: Delete card error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_card_balance(user_id: str, card_id: str, period: str = "month"):
        """Get balance information for a specific card"""
        print(f"=== GET CARD BALANCE ===")
        print(f"DEBUG: Received card balance request for card ID: {card_id}, period: {period}")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            print(f"DEBUG: Token verified, user ID: {user_id}")
            
            # Verify the card belongs to the user
            card_response = supabase.table("cards").select("*").eq("id", card_id).eq("account_id", user_id).execute()
            
            if not card_response.data:
                raise HTTPException(status_code=404, detail="Card not found")
            
            card = card_response.data[0]
            
            # Calculate date range based on period
            now = datetime.utcnow()
            
            if period == "week":
                start_date = now - timedelta(days=7)
            elif period == "month":
                start_date = now - timedelta(days=30)
            elif period == "quarter":
                start_date = now - timedelta(days=90)
            elif period == "year":
                start_date = now - timedelta(days=365)
            else:
                start_date = now - timedelta(days=30)  # Default to month
            
            # Get card-budget associations
            card_budgets_response = supabase.table("card_budgets").select("id, budget_id").eq("card_id", card_id).execute()
            card_budgets = card_budgets_response.data
            
            budget_balances = []
            card_total_spent = 0
            card_total_limit = 0
            
            for card_budget in card_budgets:
                # Get budget details
                budget_response = supabase.table("budgets").select("*").eq("id", card_budget["budget_id"]).execute()
                if budget_response.data:
                    budget = budget_response.data[0]
                    
                    # Calculate spent amount for this card-budget combination within date range
                    transactions_response = supabase.table("transactions").select("amount").eq("card_budget_id", card_budget["id"]).gte("date", start_date.isoformat()).execute()
                    spent_amount = sum(t["amount"] for t in transactions_response.data)
                    
                    # Adjust budget limit based on period
                    adjusted_limit = budget["limit_amount"]
                    if budget["period"] == "weekly":
                        if period == "month":
                            adjusted_limit = budget["limit_amount"] * 4  # 4 weeks in a month
                        elif period == "quarter":
                            adjusted_limit = budget["limit_amount"] * 13  # ~13 weeks in a quarter
                        elif period == "year":
                            adjusted_limit = budget["limit_amount"] * 52  # 52 weeks in a year
                    elif budget["period"] == "monthly":
                        if period == "week":
                            adjusted_limit = budget["limit_amount"] / 4  # 1/4 of monthly for a week
                        elif period == "quarter":
                            adjusted_limit = budget["limit_amount"] * 3  # 3 months in a quarter
                        elif period == "year":
                            adjusted_limit = budget["limit_amount"] * 12  # 12 months in a year
                    elif budget["period"] == "quarterly":
                        if period == "week":
                            adjusted_limit = budget["limit_amount"] / 13  # 1/13 of quarterly for a week
                        elif period == "month":
                            adjusted_limit = budget["limit_amount"] / 3  # 1/3 of quarterly for a month
                        elif period == "year":
                            adjusted_limit = budget["limit_amount"] * 4  # 4 quarters in a year
                    
                    remaining_amount = adjusted_limit - spent_amount
                    
                    budget_balances.append(BudgetBalance(
                        budget_id=budget["id"],
                        budget_name=budget["name"],
                        limit_amount=adjusted_limit,
                        spent_amount=spent_amount,
                        remaining_amount=remaining_amount,
                        period=budget["period"]
                    ))
                    
                    card_total_spent += spent_amount
                    card_total_limit += adjusted_limit
            
            card_remaining = card_total_limit - card_total_spent
            
            return CardBalance(
                card_id=card["id"],
                card_name=card["name"],
                total_spent=card_total_spent,
                total_limit=card_total_limit,
                remaining_amount=card_remaining,
                budget_balances=budget_balances
            )
            
        except Exception as e:
            print(f"DEBUG: Get card balance error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) 