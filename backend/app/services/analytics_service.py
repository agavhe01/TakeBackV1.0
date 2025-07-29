from fastapi import HTTPException
from datetime import datetime, timedelta
from ..config.database import supabase
from ..models.analytics import SpendingAnalyticsResponse, RecentTransactionResponse, BalanceResponse
from ..models.budget import BudgetBalance
from ..models.card import CardBalance
import traceback

class AnalyticsService:
    @staticmethod
    async def get_spending_analytics(user_id: str, period: str = "month"):
        """Get spending analytics for a user"""
        print(f"=== GET SPENDING ANALYTICS ===")
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
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
            
            # Get all budgets for the user
            budgets_response = supabase.table("budgets").select("*").eq("account_id", user_id).execute()
            budgets = budgets_response.data
            
            # Get all user's cards
            user_cards_response = supabase.table("cards").select("id").eq("account_id", user_id).execute()
            user_card_ids = [card["id"] for card in user_cards_response.data]
            
            spending_data = []
            total_spent = 0
            
            # Colors for pie chart segments
            colors = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
            
            for i, budget in enumerate(budgets):
                # Get card_budget associations for this budget, but only for the user's cards
                card_budgets_response = supabase.table("card_budgets").select("id").eq("budget_id", budget["id"]).in_("card_id", user_card_ids).execute()
                card_budget_ids = [cb["id"] for cb in card_budgets_response.data]
                
                if card_budget_ids:
                    # Get transactions for this budget within the date range using transactions.date
                    transactions_response = supabase.table("transactions").select("amount").in_("card_budget_id", card_budget_ids).gte("date", start_date.isoformat()).execute()
                    
                    budget_total = sum(t["amount"] for t in transactions_response.data)
                    total_spent += budget_total
                    
                    if budget_total > 0:
                        spending_data.append({
                            "budget_id": budget["id"],
                            "budget_name": budget["name"],
                            "total_spent": budget_total,
                            "percentage": 0,  # Will calculate after getting total
                            "color": colors[i % len(colors)]
                        })
            
            # Calculate percentages
            for item in spending_data:
                if total_spent > 0:
                    item["percentage"] = (item["total_spent"] / total_spent) * 100
            
            return spending_data
            
        except Exception as e:
            print(f"DEBUG: Get spending analytics error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_recent_transactions(user_id: str, limit: int = 10):
        """Get recent transactions for a user"""
        print(f"=== GET RECENT TRANSACTIONS ===")
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            # Get all card_budgets for the user's cards
            card_budgets_response = supabase.table("card_budgets").select("id, card_id, budget_id").execute()
            card_budget_map = {cb["id"]: cb for cb in card_budgets_response.data}
            
            # Filter by user ownership
            user_card_ids = [c["id"] for c in supabase.table("cards").select("id, account_id").eq("account_id", user_id).execute().data]
            user_card_budget_ids = [cbid for cbid, cb in card_budget_map.items() if cb["card_id"] in user_card_ids]
            
            if not user_card_budget_ids:
                return []
            
            # Get recent transactions
            transactions_response = supabase.table("transactions").select("*").in_("card_budget_id", user_card_budget_ids).order("date", desc=True).limit(limit).execute()
            
            recent_transactions = []
            for transaction in transactions_response.data:
                cb = card_budget_map.get(transaction["card_budget_id"])
                if cb:
                    # Get card and budget names
                    card_response = supabase.table("cards").select("name").eq("id", cb["card_id"]).execute()
                    budget_response = supabase.table("budgets").select("name").eq("id", cb["budget_id"]).execute()
                    
                    card_name = card_response.data[0]["name"] if card_response.data else "Unknown Card"
                    budget_name = budget_response.data[0]["name"] if budget_response.data else "Unknown Budget"
                    
                    recent_transactions.append({
                        "id": transaction["id"],
                        "name": transaction["name"],
                        "amount": transaction["amount"],
                        "date": transaction["date"],
                        "card_name": card_name,
                        "budget_name": budget_name,
                        "category": transaction.get("category"),
                        "merchant": transaction.get("merchant")
                    })
            
            return recent_transactions
            
        except Exception as e:
            print(f"DEBUG: Get recent transactions error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_balances(user_id: str, period: str = "month"):
        """Get balance information for a user"""
        print(f"=== GET BALANCES ===")
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
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
            
            # Get all cards for the user
            cards_response = supabase.table("cards").select("*").eq("account_id", user_id).execute()
            cards = cards_response.data
            
            card_balances = []
            total_spent = 0
            total_limit = 0
            
            for card in cards:
                # Get card-budget associations
                card_budgets_response = supabase.table("card_budgets").select("id, budget_id").eq("card_id", card["id"]).execute()
                card_budgets = card_budgets_response.data
                
                budget_balances = []
                card_total_spent = 0
                card_total_limit = 0
                
                for card_budget in card_budgets:
                    # Get budget details
                    budget_response = supabase.table("budgets").select("*").eq("id", card_budget["budget_id"]).execute()
                    if budget_response.data:
                        budget = budget_response.data[0]
                        
                        # Calculate spent amount for this card-budget combination within date range using transactions.date
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
                
                card_balances.append(CardBalance(
                    card_id=card["id"],
                    card_name=card["name"],
                    total_spent=card_total_spent,
                    total_limit=card_total_limit,
                    remaining_amount=card_remaining,
                    budget_balances=budget_balances
                ))
                
                total_spent += card_total_spent
                total_limit += card_total_limit
            
            total_remaining = total_limit - total_spent
            
            return BalanceResponse(
                card_balances=card_balances,
                total_spent=total_spent,
                total_limit=total_limit,
                total_remaining=total_remaining
            )
            
        except Exception as e:
            print(f"DEBUG: Get balances error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) 