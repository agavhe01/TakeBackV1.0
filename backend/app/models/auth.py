from pydantic import BaseModel
from typing import Optional

class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    password: str
    organization_legal_name: str
    orginazation_ein_number: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: str
    email: str
    organization_legal_name: str
    orginazation_ein_number: str
    date_of_birth: Optional[str] = None
    ssn: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    created_at: str

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    organization_legal_name: Optional[str] = None
    orginazation_ein_number: Optional[str] = None
    ssn: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None 