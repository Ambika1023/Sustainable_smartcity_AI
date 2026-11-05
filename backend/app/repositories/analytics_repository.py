from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analytics import CityEnvironmentalData
from app.repositories.base import BaseRepository


class AnalyticsRepository(BaseRepository[CityEnvironmentalData]):
    def __init__(self):
        super().__init__(CityEnvironmentalData)

    def get_by_period(self, db: Session, days: int, ward_id: Optional[UUID] = None):
        from datetime import date, timedelta
        from sqlalchemy import and_
        cutoff = date.today() - timedelta(days=days)
        stmt = select(CityEnvironmentalData).where(CityEnvironmentalData.recorded_date >= cutoff)
        if ward_id:
            stmt = stmt.where(CityEnvironmentalData.ward_id == ward_id)
        stmt = stmt.order_by(CityEnvironmentalData.recorded_date.asc())
        return list(db.execute(stmt).scalars().all())

    def has_data(self, db: Session) -> bool:
        from sqlalchemy import func
        stmt = select(func.count()).select_from(CityEnvironmentalData)
        return db.execute(stmt).scalar_one() > 0


analytics_repository = AnalyticsRepository()
