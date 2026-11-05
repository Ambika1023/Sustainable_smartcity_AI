from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_city_admin_or_above
from app.models.user import User
from app.schemas.recommendation import RecommendationCreate, RecommendationUpdate, RecommendationResponse, RecommendationStatusUpdate
import app.services.recommendation_service as rec_service
from app.services.audit_service import log_action

router = APIRouter()


@router.get("", response_model=list[RecommendationResponse])
def list_recommendations(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return rec_service.get_recommendations(db, priority, status)


@router.post("", response_model=RecommendationResponse, status_code=201)
def create_recommendation(
    payload: RecommendationCreate,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    rec = rec_service.create_recommendation(db, payload)
    log_action(db, str(current_user.id), "CREATE_RECOMMENDATION", "Recommendation", str(rec.id), {"title": payload.title})
    return RecommendationResponse.model_validate(rec)


@router.get("/{rec_id}", response_model=RecommendationResponse)
def get_recommendation(
    rec_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return RecommendationResponse.model_validate(rec_service.get_recommendation(db, rec_id))


@router.put("/{rec_id}", response_model=RecommendationResponse)
def update_recommendation(
    rec_id: UUID,
    payload: RecommendationUpdate,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    rec = rec_service.update_recommendation(db, rec_id, payload)
    log_action(db, str(current_user.id), "UPDATE_RECOMMENDATION", "Recommendation", str(rec_id), {})
    return RecommendationResponse.model_validate(rec)


@router.put("/{rec_id}/status", response_model=RecommendationResponse)
def update_status(
    rec_id: UUID,
    payload: RecommendationStatusUpdate,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    rec = rec_service.update_status(db, rec_id, payload.status, current_user)
    log_action(db, str(current_user.id), "UPDATE_RECOMMENDATION_STATUS", "Recommendation", str(rec_id), {"status": payload.status})
    return RecommendationResponse.model_validate(rec)

