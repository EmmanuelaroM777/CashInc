from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.auth.schemas import UserCreate, UserLogin, UserResponse, Token, UserUpdate, WorkerResponse
from app.auth.service import (
    register_user,
    authenticate_user,
    create_access_token,
    get_current_user,
    require_admin,
    update_user_profile,
    get_company_workers,
)

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user and return JWT token."""
    user = await register_user(
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        role=user_data.role,
        company_code=user_data.company_code,
    )

    token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]}
    )

    return Token(
        access_token=token,
        user=UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            role=user["role"],
            created_at=user["created_at"],
            company_code=user.get("company_code"),
            admin_id=user.get("admin_id"),
        ),
    )


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Authenticate user and return JWT token."""
    user = await authenticate_user(
        email=user_data.email,
        password=user_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]}
    )

    return Token(
        access_token=token,
        user=UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            role=user["role"],
            created_at=user["created_at"],
            company_code=user.get("company_code"),
            admin_id=user.get("admin_id"),
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user's data."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"],
        company_code=current_user.get("company_code"),
        admin_id=current_user.get("admin_id"),
    )

@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile."""
    updated_user = await update_user_profile(current_user["id"], user_data.model_dump(exclude_unset=True))
    return UserResponse(
        id=str(updated_user["_id"]),
        name=updated_user["name"],
        email=updated_user["email"],
        role=updated_user["role"],
        created_at=updated_user["created_at"],
        company_code=updated_user.get("company_code"),
        admin_id=updated_user.get("admin_id"),
    )

@router.get("/workers", response_model=List[WorkerResponse])
async def list_workers(current_user: dict = Depends(require_admin)):
    """List workers associated with the admin's company."""
    workers = await get_company_workers(current_user["id"])
    return workers
