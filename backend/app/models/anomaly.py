import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, GUID


class AnomalyCategory(str, enum.Enum):
    WATER_CONSUMPTION = "Water Consumption"
    ELECTRICITY_USAGE = "Electricity Usage"
    WASTE_GENERATION = "Waste Generation"
    AIR_QUALITY = "Air Quality"
    COMPLAINT_VOLUME = "Complaint Volume"


class AnomalySeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AnomalyStatus(str, enum.Enum):
    NEW = "NEW"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    VERIFIED = "VERIFIED"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"


class Anomaly(Base):
    __tablename__ = "anomalies"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    anomaly_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    category: Mapped[AnomalyCategory] = mapped_column(
        Enum(AnomalyCategory, name="anomalycategory"), nullable=False
    )
    severity: Mapped[AnomalySeverity] = mapped_column(
        Enum(AnomalySeverity, name="anomalyseverity"), nullable=False
    )
    status: Mapped[AnomalyStatus] = mapped_column(
        Enum(AnomalyStatus, name="anomalystatus"),
        nullable=False,
        default=AnomalyStatus.NEW,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ward_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("wards.id", ondelete="SET NULL"), nullable=True
    )
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    observed_value: Mapped[float] = mapped_column(Float, nullable=False)
    expected_min: Mapped[float] = mapped_column(Float, nullable=False)
    expected_max: Mapped[float] = mapped_column(Float, nullable=False)
    anomaly_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    investigated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_ml_detected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    ward = relationship("Ward", foreign_keys=[ward_id])
    investigated_by = relationship("User", back_populates="anomalies_investigated", foreign_keys=[investigated_by_id])
