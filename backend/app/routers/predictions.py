from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_data_analyst_or_above, get_super_admin
from app.models.user import User
import app.services.prediction_service as prediction_service

router = APIRouter()

VALID_TYPES = ["water_demand", "electricity_consumption", "waste_generation", "complaint_volume", "sustainability_performance"]


@router.get("")
def list_predictions(
    prediction_type: Optional[str] = None,
    current_user: User = Depends(get_data_analyst_or_above),
    db: Session = Depends(get_db),
):
    return prediction_service.get_all_model_statuses()


@router.get("/model-info")
def get_all_model_info(
    current_user: User = Depends(get_data_analyst_or_above),
    db: Session = Depends(get_db),
):
    return prediction_service.get_all_model_statuses()


@router.get("/{prediction_type}")
def get_predictions(
    prediction_type: str,
    days_ahead: int = Query(30, ge=7, le=365),
    ward_id: Optional[UUID] = None,
    current_user: User = Depends(get_data_analyst_or_above),
    db: Session = Depends(get_db),
):
    return prediction_service.get_predictions(db, prediction_type, days_ahead, ward_id)


@router.post("/{prediction_type}/train")
def train_model(
    prediction_type: str,
    current_user: User = Depends(get_data_analyst_or_above),
    db: Session = Depends(get_db),
):
    return prediction_service.train_model(db, prediction_type)

