from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_data_analyst_or_above, get_super_admin
from app.models.user import User
import app.services.analytics_service as analytics_service

router = APIRouter()


@router.get("/summary")
def get_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_dashboard_summary(db)


@router.get("/environmental")
def get_environmental(
    period: str = Query("monthly", pattern="^(daily|weekly|monthly|yearly)$"),
    ward_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_environmental_data(db, period, ward_id)


@router.get("/complaint-trends")
def get_complaint_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_complaint_trends(db, days)


@router.get("/department-performance")
def get_department_performance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_department_performance(db)


@router.get("/ward-distribution")
def get_ward_distribution(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_ward_complaint_distribution(db)


@router.get("/sustainability-score")
def get_sustainability_score(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    score = analytics_service.get_sustainability_score(db)
    return {"sustainability_score": score}


@router.post("/export-csv")
def export_csv(
    metric: str = Query("complaints"),
    current_user: User = Depends(get_data_analyst_or_above),
    db: Session = Depends(get_db),
):
    csv_data = analytics_service.export_to_csv(db, metric)
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={metric}_export.csv"},
    )


@router.post("/seed-sample-data")
def seed_sample_data(
    current_user: User = Depends(get_super_admin),
    db: Session = Depends(get_db),
):
    analytics_service.seed_sample_analytics_data(db)
    return {"message": "Sample analytics data seeded successfully"}

