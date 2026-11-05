import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.models.recommendation import RecommendationPriority, RecommendationStatus


class RecommendationBase(BaseModel):
    title: str
    affected_area: str
    problem_description: str
    supporting_data: Optional[Dict[str, Any]] = None
    suggested_actions: List[str]
    priority: RecommendationPriority
    expected_impact: str


class RecommendationCreate(RecommendationBase):
    pass


class RecommendationUpdate(BaseModel):
    title: Optional[str] = None
    affected_area: Optional[str] = None
    problem_description: Optional[str] = None
    supporting_data: Optional[Dict[str, Any]] = None
    suggested_actions: Optional[List[str]] = None
    priority: Optional[RecommendationPriority] = None
    expected_impact: Optional[str] = None


class RecommendationStatusUpdate(BaseModel):
    status: RecommendationStatus


class RecommendationResponse(BaseModel):
    id: uuid.UUID
    title: str
    affected_area: str
    problem_description: str
    supporting_data: Optional[Dict[str, Any]] = None
    suggested_actions: List[str]
    priority: RecommendationPriority
    expected_impact: str
    status: RecommendationStatus
    generated_by: str
    reviewed_by_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
