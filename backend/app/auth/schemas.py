from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str
    email: EmailStr
    password: str
    role: str = "trabajador"  # "admin" or "trabajador"
    company_code: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (no password)."""
    id: str
    name: str
    email: str
    role: str
    created_at: datetime
    company_code: Optional[str] = None
    admin_id: Optional[str] = None


class UserInDB(BaseModel):
    """Schema for user stored in database."""
    name: str
    email: str
    hashed_password: str
    role: str
    created_at: datetime


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for decoded JWT token data."""
    user_id: Optional[str] = None
    role: Optional[str] = None
