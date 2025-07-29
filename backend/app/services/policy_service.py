from fastapi import HTTPException
from datetime import datetime
from ..config.database import supabase
from ..models.policy import PolicyCreate, PolicyResponse
import traceback

class PolicyService:
    @staticmethod
    async def create_policy(user_id: str, policy_data: PolicyCreate):
        """Create a new policy"""
        print(f"=== CREATE POLICY ===")
        print(f"DEBUG: Received policy creation request")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            policy_insert_data = {
                "account_id": user_id,
                "name": policy_data.name,
                "description": policy_data.description,
                "memo_threshold": policy_data.memo_threshold,
                "memo_prompt": policy_data.memo_prompt
            }
            
            response = supabase.table("policies").insert(policy_insert_data).execute()
            
            if response.data:
                return PolicyResponse(**response.data[0])
            else:
                raise HTTPException(status_code=400, detail="Failed to create policy")
                
        except Exception as e:
            print(f"DEBUG: Policy creation error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_policies(user_id: str):
        """Get all policies for a user"""
        print(f"=== GET POLICIES ===")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured.")
        
        try:
            response = supabase.table("policies").select("*").eq("account_id", user_id).execute()
            
            return [PolicyResponse(**policy) for policy in response.data]
            
        except Exception as e:
            print(f"DEBUG: Get policies error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) 