import math
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_super_admin, get_city_admin_or_above
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.common import PaginatedResponse
import app.services.user_service as user_service
from app.services.audit_service import log_action

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    department_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    return user_service.get_users(db, page, per_page, role, department_id, is_active, search)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(get_super_admin),
    db: Session = Depends(get_db),
):
    # Only super admin can create users; city admin cannot create super admins
    if payload.role == UserRole.SUPER_ADMIN and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Cannot create a super admin account")
    user = user_service.create_user(db, payload, current_user)
    log_action(db, str(current_user.id), "CREATE_USER", "User", str(user.id), {"email": payload.email, "role": payload.role})
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    return UserResponse.model_validate(user_service.get_user(db, user_id))


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    current_user: User = Depends(get_super_admin),
    db: Session = Depends(get_db),
):
    user = user_service.update_user(db, user_id, payload)
    log_action(db, str(current_user.id), "UPDATE_USER", "User", str(user_id), payload.model_dump(exclude_none=True))
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=200)
def deactivate_user(
    user_id: UUID,
    current_user: User = Depends(get_super_admin),
    db: Session = Depends(get_db),
):
    user_service.deactivate_user(db, user_id)
    log_action(db, str(current_user.id), "DEACTIVATE_USER", "User", str(user_id), {})
    return {"message": "User deactivated successfully"}


@router.post("/{user_id}/activate", status_code=200)
def activate_user(
    user_id: UUID,
    current_user: User = Depends(get_super_admin),
    db: Session = Depends(get_db),
):
    user_service.activate_user(db, user_id)
    log_action(db, str(current_user.id), "ACTIVATE_USER", "User", str(user_id), {})
    return {"message": "User activated successfully"}

