from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.anomaly import Anomaly, AnomalyStatus, AnomalyCategory, AnomalySeverity
from app.repositories.base import BaseRepository


class AnomalyRepository(BaseRepository[Anomaly]):
    def __init__(self):
        super().__init__(Anomaly)

    def get_next_number(self, db: Session) -> str:
        from sqlalchemy import func
        from datetime import datetime
        year = datetime.utcnow().year
        count_stmt = select(func.count()).select_from(Anomaly).where(
            Anomaly.anomaly_number.like(f"ANO-{year}-%")
        )
        count = db.execute(count_stmt).scalar_one()
        return f"ANO-{year}-{count + 1:04d}"

    def get_filtered(
        self,
        db: Session,
        status: Optional[str] = None,
        category: Optional[str] = None,
        severity: Optional[str] = None,
    ):
        stmt = select(Anomaly)
        if status:
            stmt = stmt.where(Anomaly.status == status)
        if category:
            stmt = stmt.where(Anomaly.category == category)
        if severity:
            stmt = stmt.where(Anomaly.severity == severity)
        stmt = stmt.order_by(Anomaly.created_at.desc())
        return stmt


anomaly_repository = AnomalyRepository()
