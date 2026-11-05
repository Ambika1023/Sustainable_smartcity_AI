from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.complaint import Complaint, ComplaintStatus, ComplaintCategory, ComplaintPriority
from app.repositories.base import BaseRepository


class ComplaintRepository(BaseRepository[Complaint]):
    def __init__(self):
        super().__init__(Complaint)

    def get_by_number(self, db: Session, complaint_number: str) -> Optional[Complaint]:
        stmt = select(Complaint).where(Complaint.complaint_number == complaint_number)
        return db.execute(stmt).scalar_one_or_none()

    def get_next_number(self, db: Session) -> str:
        from sqlalchemy import func
        from datetime import datetime
        year = datetime.utcnow().year
        count_stmt = select(func.count()).select_from(Complaint).where(
            Complaint.complaint_number.like(f"CMP-{year}-%")
        )
        count = db.execute(count_stmt).scalar_one()
        return f"CMP-{year}-{count + 1:04d}"

    def get_filtered(
        self,
        db: Session,
        status: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        ward_id: Optional[UUID] = None,
        department_id: Optional[UUID] = None,
        search: Optional[str] = None,
    ):
        stmt = select(Complaint)
        if status:
            stmt = stmt.where(Complaint.status == status)
        if category:
            stmt = stmt.where(Complaint.category == category)
        if priority:
            stmt = stmt.where(Complaint.priority == priority)
        if ward_id:
            stmt = stmt.where(Complaint.ward_id == ward_id)
        if department_id:
            stmt = stmt.where(Complaint.department_id == department_id)
        if search:
            term = f"%{search}%"
            from sqlalchemy import or_
            stmt = stmt.where(
                or_(
                    Complaint.title.ilike(term),
                    Complaint.citizen_name.ilike(term),
                    Complaint.complaint_number.ilike(term),
                )
            )
        stmt = stmt.order_by(Complaint.created_at.desc())
        return stmt


complaint_repository = ComplaintRepository()
