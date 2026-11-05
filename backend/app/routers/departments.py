from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_city_admin_or_above
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse, DepartmentStatsResponse
import app.services.department_service as dept_service
from app.services.audit_service import log_action

router = APIRouter()


@router.get("/public", response_model=list[DepartmentResponse])
@router.get("", response_model=list[DepartmentResponse])
def list_departments(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """List departments. Publicly accessible so registration can populate department options."""
    return dept_service.get_departments(db, is_active)


@router.post("", response_model=DepartmentResponse, status_code=201)
def create_department(
    payload: DepartmentCreate,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    dept = dept_service.create_department(db, payload)
    log_action(db, str(current_user.id), "CREATE_DEPARTMENT", "Department", str(dept.id), {"name": payload.name})
    return DepartmentResponse.model_validate(dept)


@router.get("/{dept_id}", response_model=DepartmentResponse)
def get_department(
    dept_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return DepartmentResponse.model_validate(dept_service.get_department(db, dept_id))


@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: UUID,
    payload: DepartmentUpdate,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    dept = dept_service.update_department(db, dept_id, payload)
    log_action(db, str(current_user.id), "UPDATE_DEPARTMENT", "Department", str(dept_id), payload.model_dump(exclude_none=True))
    return DepartmentResponse.model_validate(dept)


@router.get("/{dept_id}/stats", response_model=DepartmentStatsResponse)
def get_department_stats(
    dept_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return dept_service.get_department_stats(db, dept_id)

