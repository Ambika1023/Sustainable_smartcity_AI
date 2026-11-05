from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.recommendation import SustainabilityRecommendation, RecommendationStatus, RecommendationPriority
from app.schemas.recommendation import RecommendationCreate, RecommendationUpdate


def get_recommendations(db: Session, priority: Optional[str] = None, status: Optional[str] = None):
    from app.schemas.recommendation import RecommendationResponse
    stmt = select(SustainabilityRecommendation)
    if priority:
        stmt = stmt.where(SustainabilityRecommendation.priority == priority)
    if status:
        stmt = stmt.where(SustainabilityRecommendation.status == status)
    stmt = stmt.order_by(SustainabilityRecommendation.created_at.desc())
    recs = db.execute(stmt).scalars().all()
    return [RecommendationResponse.model_validate(r) for r in recs]


def get_recommendation(db: Session, rec_id: UUID) -> SustainabilityRecommendation:
    rec = db.execute(select(SustainabilityRecommendation).where(SustainabilityRecommendation.id == rec_id)).scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return rec


def create_recommendation(db: Session, data: RecommendationCreate) -> SustainabilityRecommendation:
    rec = SustainabilityRecommendation(
        title=data.title,
        affected_area=data.affected_area,
        problem_description=data.problem_description,
        suggested_actions=data.suggested_actions,
        priority=RecommendationPriority(data.priority),
        expected_impact=data.expected_impact,
        status=RecommendationStatus.PENDING,
        generated_by="MANUAL",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def update_recommendation(db: Session, rec_id: UUID, data: RecommendationUpdate) -> SustainabilityRecommendation:
    rec = get_recommendation(db, rec_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(rec, field, value)
    db.commit()
    db.refresh(rec)
    return rec


def update_status(db: Session, rec_id: UUID, new_status: str, user) -> SustainabilityRecommendation:
    rec = get_recommendation(db, rec_id)
    rec.status = RecommendationStatus(new_status)
    rec.reviewed_by_id = user.id
    db.commit()
    db.refresh(rec)
    return rec

