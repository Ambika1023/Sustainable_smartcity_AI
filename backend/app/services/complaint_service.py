import math
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.complaint import Complaint, ComplaintHistory, ComplaintStatus, ComplaintPriority
from app.models.user import User
from app.repositories.complaint_repository import complaint_repository
from app.schemas.common import PaginatedResponse
from app.schemas.complaint import (
    ComplaintCreate, ComplaintResponse, ComplaintStatsResponse, ComplaintHistoryResponse
)


def create_complaint(db: Session, data: ComplaintCreate) -> Complaint:
    """Create a new complaint with an auto-generated complaint number."""
    complaint_number = complaint_repository.get_next_number(db)
    complaint = Complaint(
        complaint_number=complaint_number,
        citizen_name=data.citizen_name,
        citizen_email=data.citizen_email,
        citizen_phone=data.citizen_phone,
        title=data.title,
        description=data.description,
        category=data.category,
        priority=data.priority,
        ward_id=data.ward_id,
        location_address=data.location_address,
        latitude=data.latitude,
        longitude=data.longitude,
        status=ComplaintStatus.SUBMITTED,
    )
    return complaint_repository.create(db, complaint)


def get_complaints(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    ward_id: Optional[UUID] = None,
    department_id: Optional[UUID] = None,
    search: Optional[str] = None,
) -> PaginatedResponse:
    stmt = complaint_repository.get_filtered(db, status, category, priority, ward_id, department_id, search)
    items, total = complaint_repository.paginate(db, page, per_page, stmt)
    total_pages = math.ceil(total / per_page) if total else 0
    return PaginatedResponse(
        items=[ComplaintResponse.model_validate(c) for c in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


def get_complaint(db: Session, complaint_id: UUID) -> Complaint:
    complaint = complaint_repository.get(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


def assign_complaint(
    db: Session,
    complaint_id: UUID,
    department_id: UUID,
    assigned_to_id: Optional[UUID],
    assigned_by: User,
) -> Complaint:
    complaint = get_complaint(db, complaint_id)
    old_status = complaint.status
    complaint.department_id = department_id
    complaint.assigned_to_id = assigned_to_id
    complaint.assigned_by_id = assigned_by.id
    complaint.status = ComplaintStatus.ASSIGNED

    # Record history
    history = ComplaintHistory(
        complaint_id=complaint.id,
        changed_by_id=assigned_by.id,
        old_status=old_status,
        new_status=ComplaintStatus.ASSIGNED,
        remark=f"Assigned to department",
    )
    db.add(history)
    complaint_repository.update(db, complaint)
    return complaint


def update_complaint_status(
    db: Session,
    complaint_id: UUID,
    new_status: ComplaintStatus,
    remark: Optional[str],
    changed_by: User,
) -> Complaint:
    complaint = get_complaint(db, complaint_id)
    old_status = complaint.status

    if old_status == new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Complaint is already in {new_status} status",
        )

    complaint.status = new_status
    if new_status == ComplaintStatus.RESOLVED:
        complaint.resolved_at = datetime.utcnow()

    # Record history
    history = ComplaintHistory(
        complaint_id=complaint.id,
        changed_by_id=changed_by.id,
        old_status=old_status,
        new_status=new_status,
        remark=remark,
    )
    db.add(history)
    complaint_repository.update(db, complaint)
    return complaint


def add_official_remark(
    db: Session, complaint_id: UUID, remark: str, user: User
) -> Complaint:
    complaint = get_complaint(db, complaint_id)
    complaint.official_remarks = remark
    return complaint_repository.update(db, complaint)


def get_complaint_history(db: Session, complaint_id: UUID):
    complaint = get_complaint(db, complaint_id)
    stmt = select(ComplaintHistory).where(
        ComplaintHistory.complaint_id == complaint_id
    ).order_by(ComplaintHistory.created_at.asc())
    items = db.execute(stmt).scalars().all()
    return [ComplaintHistoryResponse.model_validate(h) for h in items]


def get_complaint_stats(db: Session) -> ComplaintStatsResponse:
    """Compute aggregated complaint statistics."""
    total = db.execute(select(func.count()).select_from(Complaint)).scalar_one()

    def count_by_status(s):
        return db.execute(
            select(func.count()).select_from(Complaint).where(Complaint.status == s)
        ).scalar_one()

    submitted = count_by_status(ComplaintStatus.SUBMITTED)
    under_review = count_by_status(ComplaintStatus.UNDER_REVIEW)
    assigned = count_by_status(ComplaintStatus.ASSIGNED)
    in_progress = count_by_status(ComplaintStatus.IN_PROGRESS)
    resolved = count_by_status(ComplaintStatus.RESOLVED)
    rejected = count_by_status(ComplaintStatus.REJECTED)

    high_priority = db.execute(
        select(func.count()).select_from(Complaint).where(Complaint.priority == ComplaintPriority.HIGH)
    ).scalar_one()
    critical_priority = db.execute(
        select(func.count()).select_from(Complaint).where(Complaint.priority == ComplaintPriority.CRITICAL)
    ).scalar_one()

    # Average resolution time in days
    resolved_complaints = db.execute(
        select(Complaint).where(Complaint.status == ComplaintStatus.RESOLVED, Complaint.resolved_at.isnot(None))
    ).scalars().all()

    avg_resolution_days = 0.0
    if resolved_complaints:
        total_days = sum(
            (c.resolved_at - c.created_at).total_seconds() / 86400
            for c in resolved_complaints
            if c.resolved_at and c.created_at
        )
        avg_resolution_days = round(total_days / len(resolved_complaints), 2)

    return ComplaintStatsResponse(
        total=total,
        submitted=submitted,
        under_review=under_review,
        assigned=assigned,
        in_progress=in_progress,
        resolved=resolved,
        rejected=rejected,
        high_priority=high_priority,
        critical_priority=critical_priority,
        avg_resolution_days=avg_resolution_days,
    )
