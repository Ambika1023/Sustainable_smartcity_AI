from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_active_user, get_city_admin_or_above,
    get_department_officer_or_above,
)
from app.models.user import User, UserRole
from app.schemas.complaint import (
    ComplaintCreate, ComplaintResponse, ComplaintStatsResponse,
    ComplaintAssign, ComplaintStatusUpdate, ComplaintRemarkUpdate,
)
from app.schemas.common import PaginatedResponse
import app.services.complaint_service as complaint_service
from app.services.audit_service import log_action

router = APIRouter()


@router.get("/stats", response_model=ComplaintStatsResponse)
def get_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return complaint_service.get_complaint_stats(db)


@router.get("", response_model=PaginatedResponse)
def list_complaints(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    ward_id: Optional[UUID] = None,
    department_id: Optional[UUID] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Department officers only see their department's complaints
    if current_user.role == UserRole.DEPARTMENT_OFFICER and current_user.department_id:
        department_id = current_user.department_id
    return complaint_service.get_complaints(
        db, page, per_page, status, category, priority, ward_id, department_id, search
    )


@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    payload: ComplaintCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    complaint = complaint_service.create_complaint(db, payload)
    log_action(db, str(current_user.id), "CREATE_COMPLAINT", "Complaint", str(complaint.id), {"title": payload.title})
    return ComplaintResponse.model_validate(complaint)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return ComplaintResponse.model_validate(complaint_service.get_complaint(db, complaint_id))


@router.put("/{complaint_id}/assign")
def assign_complaint(
    complaint_id: UUID,
    payload: ComplaintAssign,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    complaint = complaint_service.assign_complaint(
        db, complaint_id, payload.department_id, payload.assigned_to_id, current_user
    )
    log_action(db, str(current_user.id), "ASSIGN_COMPLAINT", "Complaint", str(complaint_id),
               {"department_id": str(payload.department_id)})
    return ComplaintResponse.model_validate(complaint)


@router.put("/{complaint_id}/status")
def update_status(
    complaint_id: UUID,
    payload: ComplaintStatusUpdate,
    current_user: User = Depends(get_department_officer_or_above),
    db: Session = Depends(get_db),
):
    complaint = complaint_service.update_complaint_status(
        db, complaint_id, payload.new_status, payload.remark, current_user
    )
    log_action(db, str(current_user.id), "UPDATE_COMPLAINT_STATUS", "Complaint", str(complaint_id),
               {"new_status": payload.new_status})
    return ComplaintResponse.model_validate(complaint)


@router.post("/{complaint_id}/remarks")
def add_remark(
    complaint_id: UUID,
    payload: ComplaintRemarkUpdate,
    current_user: User = Depends(get_department_officer_or_above),
    db: Session = Depends(get_db),
):
    complaint = complaint_service.add_official_remark(db, complaint_id, payload.remark, current_user)
    return ComplaintResponse.model_validate(complaint)


@router.get("/{complaint_id}/history")
def get_history(
    complaint_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return complaint_service.get_complaint_history(db, complaint_id)

