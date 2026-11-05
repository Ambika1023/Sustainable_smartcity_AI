from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_data_analyst_or_above, get_city_admin_or_above
from app.models.user import User
from app.schemas.anomaly import AnomalyResponse, AnomalyStatusUpdate
from app.schemas.common import PaginatedResponse
import app.services.anomaly_service as anomaly_service
from app.services.audit_service import log_action

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
def list_anomalies(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return anomaly_service.get_anomalies(db, page, per_page, status, category, severity)


@router.post("/detect")
def run_detection(
    current_user: User = Depends(get_data_analyst_or_above),
    db: Session = Depends(get_db),
):
    result = anomaly_service.detect_anomalies(db)
    log_action(db, str(current_user.id), "RUN_ANOMALY_DETECTION", "Anomaly", None, result)
    return result


@router.get("/{anomaly_id}", response_model=AnomalyResponse)
def get_anomaly(
    anomaly_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return AnomalyResponse.model_validate(anomaly_service.get_anomaly(db, anomaly_id))


@router.put("/{anomaly_id}/status", response_model=AnomalyResponse)
def update_anomaly_status(
    anomaly_id: UUID,
    payload: AnomalyStatusUpdate,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    anomaly = anomaly_service.update_anomaly_status(db, anomaly_id, payload.status, payload.resolution_notes, current_user)
    log_action(db, str(current_user.id), "UPDATE_ANOMALY_STATUS", "Anomaly", str(anomaly_id), {"status": payload.status})
    return AnomalyResponse.model_validate(anomaly)

