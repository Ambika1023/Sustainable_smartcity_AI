import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, GUID


class CityEnvironmentalData(Base):
    __tablename__ = "city_environmental_data"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    ward_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("wards.id", ondelete="SET NULL"), nullable=True
    )
    recorded_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    water_consumption_liters: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    electricity_consumption_kwh: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    waste_generation_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    air_quality_index: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    traffic_congestion_index: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    green_coverage_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
