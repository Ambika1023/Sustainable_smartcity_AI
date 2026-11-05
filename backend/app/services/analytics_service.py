import io
import random
from datetime import date, datetime, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.analytics import CityEnvironmentalData
from app.models.complaint import Complaint, ComplaintStatus, ComplaintCategory
from app.models.department import Department
from app.models.ward import Ward


def get_dashboard_summary(db: Session) -> dict:
    from app.models.complaint import ComplaintPriority
    total_complaints = db.execute(select(func.count()).select_from(Complaint)).scalar_one()
    pending = db.execute(
        select(func.count()).select_from(Complaint).where(
            Complaint.status.in_([ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS])
        )
    ).scalar_one()
    resolved = db.execute(
        select(func.count()).select_from(Complaint).where(Complaint.status == ComplaintStatus.RESOLVED)
    ).scalar_one()
    high_priority = db.execute(
        select(func.count()).select_from(Complaint).where(
            Complaint.priority.in_([ComplaintPriority.HIGH, ComplaintPriority.CRITICAL])
        )
    ).scalar_one()

    resolved_complaints = db.execute(
        select(Complaint).where(Complaint.status == ComplaintStatus.RESOLVED, Complaint.resolved_at.isnot(None))
    ).scalars().all()
    avg_days = 0.0
    if resolved_complaints:
        total_days = sum((c.resolved_at - c.created_at).total_seconds() / 86400 for c in resolved_complaints)
        avg_days = round(total_days / len(resolved_complaints), 1)

    score = get_sustainability_score(db)
    return {
        "total_complaints": total_complaints,
        "pending_complaints": pending,
        "resolved_complaints": resolved,
        "high_priority_complaints": high_priority,
        "avg_resolution_days": avg_days,
        "sustainability_score": score,
        "has_real_data": total_complaints > 0,
    }


def get_environmental_data(db: Session, period: str = "monthly", ward_id: Optional[UUID] = None) -> list:
    stmt = select(CityEnvironmentalData)
    if ward_id:
        stmt = stmt.where(CityEnvironmentalData.ward_id == ward_id)
    cutoff_map = {"daily": 30, "weekly": 90, "monthly": 365, "yearly": 365 * 3}
    days = cutoff_map.get(period, 365)
    cutoff = date.today() - timedelta(days=days)
    stmt = stmt.where(CityEnvironmentalData.recorded_date >= cutoff).order_by(CityEnvironmentalData.recorded_date)
    rows = db.execute(stmt).scalars().all()

    if period == "daily":
        return [_row_to_dict(r) for r in rows]
    elif period == "weekly":
        return _aggregate_weekly(rows)
    elif period in ("monthly", "yearly"):
        return _aggregate_monthly(rows)
    return [_row_to_dict(r) for r in rows]


def _row_to_dict(r: CityEnvironmentalData) -> dict:
    return {
        "date": str(r.recorded_date),
        "water_consumption_liters": r.water_consumption_liters,
        "electricity_consumption_kwh": r.electricity_consumption_kwh,
        "waste_generation_kg": r.waste_generation_kg,
        "air_quality_index": r.air_quality_index,
        "traffic_congestion_index": r.traffic_congestion_index,
        "green_coverage_percent": r.green_coverage_percent,
    }


def _aggregate_weekly(rows) -> list:
    from collections import defaultdict
    weeks: dict = defaultdict(list)
    for r in rows:
        week_key = r.recorded_date.strftime("%Y-W%U")
        weeks[week_key].append(r)
    result = []
    for week, items in sorted(weeks.items()):
        result.append({
            "date": week,
            "water_consumption_liters": sum(i.water_consumption_liters for i in items) / len(items),
            "electricity_consumption_kwh": sum(i.electricity_consumption_kwh for i in items) / len(items),
            "waste_generation_kg": sum(i.waste_generation_kg for i in items),
            "air_quality_index": sum(i.air_quality_index for i in items) / len(items),
            "traffic_congestion_index": sum(i.traffic_congestion_index for i in items) / len(items),
            "green_coverage_percent": sum(i.green_coverage_percent for i in items) / len(items),
        })
    return result


def _aggregate_monthly(rows) -> list:
    from collections import defaultdict
    months: dict = defaultdict(list)
    for r in rows:
        month_key = r.recorded_date.strftime("%Y-%m")
        months[month_key].append(r)
    result = []
    for month, items in sorted(months.items()):
        result.append({
            "date": month,
            "water_consumption_liters": sum(i.water_consumption_liters for i in items) / len(items),
            "electricity_consumption_kwh": sum(i.electricity_consumption_kwh for i in items) / len(items),
            "waste_generation_kg": sum(i.waste_generation_kg for i in items),
            "air_quality_index": sum(i.air_quality_index for i in items) / len(items),
            "traffic_congestion_index": sum(i.traffic_congestion_index for i in items) / len(items),
            "green_coverage_percent": sum(i.green_coverage_percent for i in items) / len(items),
        })
    return result


def get_complaint_trends(db: Session, days: int = 30) -> list:
    cutoff = date.today() - timedelta(days=days)
    complaints = db.execute(
        select(Complaint).where(Complaint.created_at >= datetime.combine(cutoff, datetime.min.time()))
    ).scalars().all()
    from collections import defaultdict
    daily: dict = defaultdict(int)
    for c in complaints:
        day_key = c.created_at.strftime("%Y-%m-%d")
        daily[day_key] += 1
    result = []
    for i in range(days):
        d = cutoff + timedelta(days=i)
        key = d.strftime("%Y-%m-%d")
        result.append({"date": key, "count": daily.get(key, 0)})
    return result


def get_department_performance(db: Session) -> list:
    depts = db.execute(select(Department).where(Department.is_active == True)).scalars().all()
    result = []
    for dept in depts:
        total = db.execute(
            select(func.count()).select_from(Complaint).where(Complaint.department_id == dept.id)
        ).scalar_one()
        resolved = db.execute(
            select(func.count()).select_from(Complaint).where(
                Complaint.department_id == dept.id, Complaint.status == ComplaintStatus.RESOLVED
            )
        ).scalar_one()
        result.append({
            "department": dept.name,
            "total": total,
            "resolved": resolved,
            "pending": total - resolved,
            "resolution_rate": round(resolved / total * 100, 1) if total > 0 else 0,
        })
    return result


def get_ward_complaint_distribution(db: Session) -> list:
    wards = db.execute(select(Ward).where(Ward.is_active == True)).scalars().all()
    result = []
    for ward in wards:
        count = db.execute(
            select(func.count()).select_from(Complaint).where(Complaint.ward_id == ward.id)
        ).scalar_one()
        result.append({"ward": ward.name, "ward_number": ward.ward_number, "count": count})
    return sorted(result, key=lambda x: x["ward_number"])


def get_sustainability_score(db: Session) -> float:
    recent = db.execute(
        select(CityEnvironmentalData).order_by(CityEnvironmentalData.recorded_date.desc()).limit(30)
    ).scalars().all()
    if not recent:
        return 0.0
    avg_aqi = sum(r.air_quality_index for r in recent) / len(recent)
    avg_green = sum(r.green_coverage_percent for r in recent) / len(recent)
    # Score: AQI < 50 is good (100 pts), > 200 is bad. Green > 30% is good.
    aqi_score = max(0, min(100, (200 - avg_aqi) / 1.5))
    green_score = min(100, avg_green * 2.5)
    return round((aqi_score * 0.6 + green_score * 0.4), 1)


def export_to_csv(db: Session, metric: str) -> str:
    rows = db.execute(select(CityEnvironmentalData).order_by(CityEnvironmentalData.recorded_date)).scalars().all()
    output = io.StringIO()
    output.write("date,ward_id,water_liters,electricity_kwh,waste_kg,air_quality_index,traffic_index,green_pct\n")
    for r in rows:
        output.write(
            f"{r.recorded_date},{r.ward_id},{r.water_consumption_liters},{r.electricity_consumption_kwh},"
            f"{r.waste_generation_kg},{r.air_quality_index},{r.traffic_congestion_index},{r.green_coverage_percent}\n"
        )
    return output.getvalue()


def seed_sample_analytics_data(db: Session):
    """Populate 365 days of realistic environmental data for all wards."""
    import random, math
    wards = db.execute(select(Ward)).scalars().all()
    if not wards:
        return

    existing = db.execute(select(CityEnvironmentalData).limit(1)).scalar_one_or_none()
    if existing:
        return  # Already seeded

    today = date.today()
    rng = random.Random(42)
    for ward in wards:
        base_water = rng.uniform(400000, 600000)
        base_electricity = rng.uniform(80000, 150000)
        base_waste = rng.uniform(50000, 90000)
        base_aqi = rng.uniform(60, 100)
        for i in range(365):
            d = today - timedelta(days=364 - i)
            seasonal = math.sin(2 * math.pi * i / 365)
            row = CityEnvironmentalData(
                ward_id=ward.id,
                recorded_date=d,
                water_consumption_liters=max(0, base_water + seasonal * 50000 + rng.gauss(0, 10000)),
                electricity_consumption_kwh=max(0, base_electricity + seasonal * 20000 + rng.gauss(0, 5000)),
                waste_generation_kg=max(0, base_waste + rng.gauss(0, 5000)),
                air_quality_index=max(10, min(300, base_aqi + rng.gauss(0, 15))),
                traffic_congestion_index=max(0, min(10, 4 + seasonal * 2 + rng.gauss(0, 1))),
                green_coverage_percent=max(5, min(60, 25 + rng.gauss(0, 3))),
            )
            db.add(row)
    db.commit()
