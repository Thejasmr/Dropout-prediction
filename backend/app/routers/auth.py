from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_async_session
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, RefreshTokenRequest
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    session: AsyncSession = Depends(get_async_session)
):
    return await AuthService.authenticate_user(session, login_data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    session: AsyncSession = Depends(get_async_session)
):
    return await AuthService.refresh_access_token(session, refresh_data)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name

    if user_update.password is not None and user_update.password.strip() != "":
        from app.core.security import get_password_hash
        current_user.hashed_password = get_password_hash(user_update.password)

    if user_update.email is not None and user_update.email != current_user.email:
        result = await session.execute(select(User).where(User.email == user_update.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )
        current_user.email = user_update.email

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return UserResponse.model_validate(current_user)


# ── Admin: list all users ───────────────────────────────────────────────────
@router.get("/users", response_model=List[UserResponse])
async def list_users(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_role(["admin"]))
):
    result = await session.execute(select(User).order_by(User.created_at.asc()))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


# ── Admin: create a new user ────────────────────────────────────────────────
@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_role(["admin"]))
):
    return await AuthService.create_user(session, user_in)


# ── Admin: update any user's role / active status ───────────────────────────
@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_update: UserUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_role(["admin"]))
):
    result = await session.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot modify their own role or status via this endpoint. Use PUT /auth/me."
        )

    if user_update.full_name is not None:
        target.full_name = user_update.full_name
    if user_update.email is not None:
        target.email = user_update.email
    if user_update.role is not None:
        allowed_roles = {"admin", "counsellor", "mentor"}
        if user_update.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Role must be one of: {', '.join(allowed_roles)}")
        target.role = user_update.role
    if user_update.is_active is not None:
        target.is_active = user_update.is_active

    session.add(target)
    await session.commit()
    await session.refresh(target)
    return UserResponse.model_validate(target)


# ── Admin: deactivate (soft-delete) a user ──────────────────────────────────
@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_role(["admin"]))
):
    result = await session.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Admins cannot deactivate their own account.")

    target.is_active = False
    session.add(target)
    await session.commit()
    return {"message": f"User {target.email} has been deactivated."}
