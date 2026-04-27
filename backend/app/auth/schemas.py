from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
import re


def validate_password_strength(password: str) -> str:
    """Validate password meets security requirements."""
    if len(password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Z]", password):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula")
    if not re.search(r"[0-9]", password):
        raise ValueError("La contraseña debe contener al menos un número")
    return password


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str
    email: EmailStr
    password: str
    role: str = "trabajador"  # "admin" or "trabajador"
    company_code: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        return validate_password_strength(v)


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

class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    language: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if v is not None and v != "":
            return validate_password_strength(v)
        return v

class WorkerResponse(BaseModel):
    """Schema for listing workers."""
    id: str
    name: str
    email: str
    created_at: datetime

