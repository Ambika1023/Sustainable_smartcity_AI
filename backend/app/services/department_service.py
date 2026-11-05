import math
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.complaint import Complaint
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentStatsResponse


def get_departments(db: Session, is_active: Optional[bool] = None):
    from app.schemas.department import DepartmentResponse
    stmt = select(Department)
    if is_active is not None:
        stmt = stmt.where(Department.is_active == is_active)
    stmt = stmt.order_by(Department.name)
    depts = db.execute(stmt).scalars().all()
    return [DepartmentResponse.model_validate(d) for d in depts]


def get_department(db: Session, dept_id: UUID) -> Department:
    dept = db.execute(select(Department).where(Department.id == dept_id)).scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


def create_department(db: Session, data: DepartmentCreate) -> Department:
    existing = db.execute(select(Department).where(Department.name == data.name)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Department with this name already exists")
    dept = Department(
        name=data.name,
        code=data.code.upper(),
        description=data.description,
        is_active=True,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


def update_department(db: Session, dept_id: UUID, data: DepartmentUpdate) -> Department:
    dept = get_department(db, dept_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    return dept


def get_department_stats(db: Session, dept_id: UUID) -> DepartmentStatsResponse:
    dept = get_department(db, dept_id)
    from app.models.complaint import ComplaintStatus
    from app.models.user import User

    total = db.execute(select(func.count()).select_from(Complaint).where(Complaint.department_id == dept_id)).scalar_one()
    resolved = db.execute(
        select(func.count()).select_from(Complaint).where(
            Complaint.department_id == dept_id, Complaint.status == ComplaintStatus.RESOLVED
        )
    ).scalar_one()
    pending = db.execute(
        select(func.count()).select_from(Complaint).where(
            Complaint.department_id == dept_id,
            Complaint.status.in_([ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS])
        )
    ).scalar_one()
    officer_count = db.execute(
        select(func.count()).select_from(User).where(User.department_id == dept_id, User.is_active == True)
    ).scalar_one()
    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0.0

    return DepartmentStatsResponse(
        department_id=dept_id,
        department_name=dept.name,
        total_complaints=total,
        resolved_complaints=resolved,
        pending_complaints=pending,
        officer_count=officer_count,
        resolution_rate=resolution_rate,
    )
