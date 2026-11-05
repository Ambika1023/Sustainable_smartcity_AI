import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, ForeignKey, String, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, GUID


class PredictionType(str, enum.Enum):
    WATER_DEMAND = "Water Demand"
    ELECTRICITY_CONSUMPTION = "Electricity Consumption"
    WASTE_GENERATION = "Waste Generation"
    COMPLAINT_VOLUME = "Complaint Volume"
    SUSTAINABILITY_PERFORMANCE = "Sustainability Performance"


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    prediction_type: Mapped[PredictionType] = mapped_column(
        Enum(PredictionType, name="predictiontype"), nullable=False
    )
    model_version: Mapped[str] = mapped_column(String(50), nullable=False, default="1.0")
    prediction_date: Mapped[date] = mapped_column(Date, nullable=False)
    predicted_value: Mapped[float] = mapped_column(Float, nullable=False)
    actual_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ward_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("wards.id", ondelete="SET NULL"), nullable=True
    )
    is_sample_data: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
