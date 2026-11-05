from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.repositories.base import BaseRepository


class DepartmentRepository(BaseRepository[Department]):
    def __init__(self):
        super().__init__(Department)

    def get_by_name(self, db: Session, name: str) -> Optional[Department]:
        stmt = select(Department).where(Department.name == name)
        return db.execute(stmt).scalar_one_or_none()

    def get_by_code(self, db: Session, code: str) -> Optional[Department]:
        stmt = select(Department).where(Department.code == code)
        return db.execute(stmt).scalar_one_or_none()

    def get_active(self, db: Session):
        stmt = select(Department).where(Department.is_active == True).order_by(Department.name)
        return list(db.execute(stmt).scalars().all())


department_repository = DepartmentRepository()
