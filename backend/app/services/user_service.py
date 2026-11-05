import math
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.repositories.user_repository import user_repository
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.common import PaginatedResponse
from app.core.security import hash_password


def get_users(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    role: Optional[str] = None,
    department_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
) -> PaginatedResponse:
    from app.schemas.user import UserResponse
    stmt = user_repository.get_filtered(db, role, department_id, is_active, search)
    items, total = user_repository.paginate(db, page, per_page, stmt)
    total_pages = math.ceil(total / per_page) if total else 0
    return PaginatedResponse(
        items=[UserResponse.model_validate(u) for u in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


def get_user(db: Session, user_id: UUID) -> User:
    user = user_repository.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def create_user(db: Session, data: UserCreate, created_by: User) -> User:
    if user_repository.get_by_email(db, data.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=UserRole(data.role),
        department_id=data.department_id,
        phone=data.phone,
        is_active=True,
        is_first_login=True,
    )
    return user_repository.create(db, user)


def update_user(db: Session, user_id: UUID, data: UserUpdate) -> User:
    user = get_user(db, user_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: UUID) -> User:
    user = get_user(db, user_id)
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user_id: UUID) -> User:
    user = get_user(db, user_id)
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
