from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return db.execute(stmt).scalar_one_or_none()

    def get_super_admin_exists(self, db: Session) -> bool:
        stmt = select(User).where(User.role == UserRole.SUPER_ADMIN).limit(1)
        return db.execute(stmt).scalar_one_or_none() is not None

    def get_filtered(self, db: Session, role: Optional[str], department_id: Optional[UUID], is_active: Optional[bool], search: Optional[str] = None):
        stmt = select(User)
        if role:
            stmt = stmt.where(User.role == role)
        if department_id:
            stmt = stmt.where(User.department_id == department_id)
        if is_active is not None:
            stmt = stmt.where(User.is_active == is_active)
        if search:
            from sqlalchemy import or_
            term = f"%{search}%"
            stmt = stmt.where(or_(User.full_name.ilike(term), User.email.ilike(term)))
        stmt = stmt.order_by(User.created_at.desc())
        return stmt


user_repository = UserRepository()
