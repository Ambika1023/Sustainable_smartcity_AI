import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.anomaly import AnomalyCategory, AnomalySeverity, AnomalyStatus


class AnomalyBase(BaseModel):
    category: AnomalyCategory
    severity: AnomalySeverity
    description: str
    location: Optional[str] = None
    ward_id: Optional[uuid.UUID] = None
    observed_value: float
    expected_min: float
    expected_max: float


class AnomalyStatusUpdate(BaseModel):
    status: AnomalyStatus
    resolution_notes: Optional[str] = None


class AnomalyResponse(BaseModel):
    id: uuid.UUID
    anomaly_number: str
    category: AnomalyCategory
    severity: AnomalySeverity
    status: AnomalyStatus
    description: str
    location: Optional[str] = None
    ward_id: Optional[uuid.UUID] = None
    detected_at: datetime
    observed_value: float
    expected_min: float
    expected_max: float
    anomaly_score: Optional[float] = None
    investigated_by_id: Optional[uuid.UUID] = None
    resolution_notes: Optional[str] = None
    is_ml_detected: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
