from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
from app.config import settings
from app.database import get_database
from app.auth.schemas import TokenData
import string
import random

def generate_company_code() -> str:
    """Generate a 6-character random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency: get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
        "company_code": user.get("company_code"),
        "admin_id": user.get("admin_id"),
        "tenant_id": user.get("admin_id") if user["role"] == "trabajador" else str(user["_id"])
    }


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency: require admin role for the current user."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de administrador.",
        )
    return current_user


async def register_user(name: str, email: str, password: str, role: str = "trabajador", company_code: Optional[str] = None) -> dict:
    """Register a new user in the database."""
    db = get_database()

    # Check if user already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado",
        )

    # Multi-tenancy logic
    admin_id = None
    final_company_code = None

    if role == "admin":
        final_company_code = generate_company_code()
        # Ensure it's unique (basic check)
        while await db.users.find_one({"company_code": final_company_code}):
            final_company_code = generate_company_code()
    elif role == "trabajador":
        if not company_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Se requiere un Código de Empresa para registrarse como trabajador",
            )
        # Normalize input (remove spaces, make uppercase)
        clean_code = company_code.strip().upper()
        
        admin_user = await db.users.find_one({"company_code": clean_code, "role": "admin"})
        if not admin_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código de Empresa inválido",
            )
        admin_id = str(admin_user["_id"])
        final_company_code = clean_code

    # Create user document
    user_doc = {
        "name": name,
        "email": email,
        "hashed_password": hash_password(password),
        "role": role,
        "created_at": datetime.now(timezone.utc),
    }

    if final_company_code:
        user_doc["company_code"] = final_company_code
    if admin_id:
        user_doc["admin_id"] = admin_id

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate a user by email and password."""
    db = get_database()
    user = await db.users.find_one({"email": email})

    if not user or not verify_password(password, user["hashed_password"]):
        return None

    return user

async def update_user_profile(user_id: str, update_data: dict) -> dict:
    """Update user profile."""
    db = get_database()
    update_fields = {}
    if "name" in update_data and update_data["name"]:
        update_fields["name"] = update_data["name"]
    if "email" in update_data and update_data["email"]:
        existing = await db.users.find_one({"email": update_data["email"], "_id": {"$ne": ObjectId(user_id)}})
        if existing:
            raise HTTPException(status_code=400, detail="El correo electrónico ya está en uso")
        update_fields["email"] = update_data["email"]
    if "password" in update_data and update_data["password"]:
        update_fields["hashed_password"] = hash_password(update_data["password"])
    if "language" in update_data and update_data["language"]:
        update_fields["language"] = update_data["language"]

    if not update_fields:
        return await db.users.find_one({"_id": ObjectId(user_id)})

    update_fields["updated_at"] = datetime.now(timezone.utc)
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )
    return await db.users.find_one({"_id": ObjectId(user_id)})

async def get_company_workers(admin_id: str) -> list:
    """Get all workers under an admin."""
    db = get_database()
    cursor = db.users.find({"admin_id": admin_id, "role": "trabajador"})
    workers = []
    async for worker in cursor:
        workers.append({
            "id": str(worker["_id"]),
            "name": worker["name"],
            "email": worker["email"],
            "created_at": worker["created_at"],
        })
    return workers


async def request_password_recovery(email: str) -> str:
    """Generate a 6-digit code for password recovery and save to DB."""
    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró ningún usuario con este correo electrónico",
        )

    code = "".join(random.choices(string.digits, k=6))
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    await db.password_resets.update_one(
        {"email": email},
        {"$set": {"code": code, "expire": expire}},
        upsert=True
    )
    
    print(f"🔑 [RECOVERY CODE FOR {email}]: {code}")
    return code


async def reset_password_with_token(email: str, code: str, new_password: str) -> bool:
    """Reset the user password if code is valid and not expired."""
    db = get_database()
    reset_entry = await db.password_resets.find_one({"email": email})
    if not reset_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se solicitó recuperación de contraseña para este correo electrónico",
        )

    if reset_entry["code"] != code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificación incorrecto",
        )

    expire_time = reset_entry["expire"]
    if expire_time.tzinfo is None:
        expire_time = expire_time.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expire_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de verificación ha expirado",
        )

    hashed_pwd = hash_password(new_password)
    await db.users.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_pwd, "updated_at": datetime.now(timezone.utc)}}
    )

    await db.password_resets.delete_one({"email": email})
    return True

