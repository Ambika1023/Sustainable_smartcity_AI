import uuid
from datetime import date, datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel
from app.models.prediction import PredictionType


class PredictionResponse(BaseModel):
    id: uuid.UUID
    prediction_type: PredictionType
    model_version: str
    prediction_date: date
    predicted_value: float
    actual_value: Optional[float] = None
    confidence_score: Optional[float] = None
    model_metrics: Optional[Dict[str, Any]] = None
    ward_id: Optional[uuid.UUID] = None
    is_sample_data: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PredictionResultResponse(BaseModel):
    status: str
    prediction_type: str
    predictions: Optional[list] = None
    model_metrics: Optional[Dict[str, Any]] = None
    is_sample_data: bool = False
    message: Optional[str] = None


class ModelInfoResponse(BaseModel):
    prediction_type: str
    is_trained: bool
    model_name: str
    training_samples: Optional[int] = None
    last_trained: Optional[datetime] = None
    metrics: Optional[Dict[str, Any]] = None
