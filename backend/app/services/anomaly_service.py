import math
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.anomaly import Anomaly, AnomalyStatus
from app.schemas.common import PaginatedResponse


def get_anomalies(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    status: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
) -> PaginatedResponse:
    from app.schemas.anomaly import AnomalyResponse
    stmt = select(Anomaly)
    if status:
        stmt = stmt.where(Anomaly.status == status)
    if category:
        stmt = stmt.where(Anomaly.category == category)
    if severity:
        stmt = stmt.where(Anomaly.severity == severity)
    stmt = stmt.order_by(Anomaly.detected_at.desc())

    total = db.execute(select(Anomaly).where(*(
        [Anomaly.status == status] if status else [] +
        [Anomaly.category == category] if category else [] +
        [Anomaly.severity == severity] if severity else []
    ))).scalars()
    # simpler approach:
    all_items = db.execute(stmt).scalars().all()
    total = len(all_items)
    start = (page - 1) * per_page
    items = all_items[start:start + per_page]
    total_pages = math.ceil(total / per_page) if total else 0
    return PaginatedResponse(
        items=[AnomalyResponse.model_validate(a) for a in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


def get_anomaly(db: Session, anomaly_id: UUID) -> Anomaly:
    a = db.execute(select(Anomaly).where(Anomaly.id == anomaly_id)).scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return a


def update_anomaly_status(
    db: Session, anomaly_id: UUID, new_status: str, notes: Optional[str], user
) -> Anomaly:
    anomaly = get_anomaly(db, anomaly_id)
    anomaly.status = AnomalyStatus(new_status)
    if notes:
        anomaly.resolution_notes = notes
    anomaly.investigated_by_id = user.id
    db.commit()
    db.refresh(anomaly)
    return anomaly


def detect_anomalies(db: Session) -> dict:
    """Run IsolationForest on recent environmental data and create Anomaly records."""
    import numpy as np
    from datetime import datetime, timedelta
    from sqlalchemy import select as sa_select, func
    from app.models.analytics import CityEnvironmentalData
    from app.models.anomaly import Anomaly, AnomalyCategory, AnomalySeverity, AnomalyStatus
    from app.ml.anomaly_detector import CityAnomalyDetector

    cutoff = datetime.utcnow() - timedelta(days=90)
    rows = db.execute(
        sa_select(CityEnvironmentalData).where(CityEnvironmentalData.recorded_date >= cutoff.date())
    ).scalars().all()

    if len(rows) < 10:
        return {"message": "Insufficient data for anomaly detection", "anomalies_found": 0}

    features = np.array([
        [r.water_consumption_liters, r.electricity_consumption_kwh,
         r.waste_generation_kg, r.air_quality_index]
        for r in rows
    ])

    detector = CityAnomalyDetector()
    predictions = detector.detect(features)
    scores = detector.anomaly_scores(features)

    anomalies_created = 0
    for i, (row, pred, score) in enumerate(zip(rows, predictions, scores)):
        if pred == -1:  # anomaly detected
            # Determine which metric is most anomalous
            metric_values = {
                "water": row.water_consumption_liters,
                "electricity": row.electricity_consumption_kwh,
                "waste": row.waste_generation_kg,
                "aqi": row.air_quality_index,
            }
            worst_metric = max(metric_values, key=lambda k: abs(metric_values[k]))
            category_map = {
                "water": AnomalyCategory.WATER_CONSUMPTION,
                "electricity": AnomalyCategory.ELECTRICITY_USAGE,
                "waste": AnomalyCategory.WASTE_GENERATION,
                "aqi": AnomalyCategory.AIR_QUALITY,
            }
            abs_score = abs(float(score))
            if abs_score > 0.3:
                severity = AnomalySeverity.CRITICAL
            elif abs_score > 0.2:
                severity = AnomalySeverity.HIGH
            elif abs_score > 0.1:
                severity = AnomalySeverity.MEDIUM
            else:
                severity = AnomalySeverity.LOW

            # Avoid duplicate anomalies for same date
            existing = db.execute(
                sa_select(Anomaly).where(
                    Anomaly.detected_at >= datetime.combine(row.recorded_date, datetime.min.time()),
                    Anomaly.category == category_map[worst_metric],
                    Anomaly.is_ml_detected == True,
                )
            ).scalar_one_or_none()
            if existing:
                continue

            existing_count = db.execute(sa_select(func.count()).select_from(Anomaly)).scalar_one()
            num = existing_count + anomalies_created + 1
            anomaly = Anomaly(
                anomaly_number=f"ANM-{datetime.utcnow().year}-{num:04d}",
                category=category_map[worst_metric],
                severity=severity,
                status=AnomalyStatus.NEW,
                description=f"ML-detected anomaly in {worst_metric} data on {row.recorded_date}",
                detected_at=datetime.combine(row.recorded_date, datetime.min.time()),
                observed_value=float(metric_values[worst_metric]),
                expected_min=float(np.percentile([r.__dict__[f'{worst_metric}_consumption_liters'] if worst_metric == 'water' else 0 for r in rows], 10)),
                expected_max=float(np.percentile([r.__dict__[f'{worst_metric}_consumption_liters'] if worst_metric == 'water' else 0 for r in rows], 90)),
                anomaly_score=float(score),
                is_ml_detected=True,
                ward_id=row.ward_id,
            )
            db.add(anomaly)
            anomalies_created += 1

    db.commit()
    return {"message": f"Anomaly detection complete", "anomalies_found": anomalies_created}
