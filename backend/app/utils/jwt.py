import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException
from ..config.settings import settings

def create_access_token(data: dict):
    """Create JWT access token"""
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.JWT_EXPIRATION_DAYS)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        print(f"DEBUG: JWT token created successfully for user: {data.get('email', 'unknown')}")
        return encoded_jwt
    except Exception as e:
        print(f"DEBUG: Failed to create JWT token: {e}")
        raise e

def verify_token(token: str):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        print(f"DEBUG: JWT token verified successfully for user: {payload.get('email', 'unknown')}")
        return payload
    except jwt.ExpiredSignatureError:
        print("DEBUG: JWT token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        print(f"DEBUG: JWT token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token") 