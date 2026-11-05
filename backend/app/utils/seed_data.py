"""Comprehensive seed data for the Sustainable Smart City AI Assistant."""
import random
import uuid
from datetime import datetime, timedelta, date

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.ward import Ward
from app.models.complaint import Complaint, ComplaintCategory, ComplaintStatus, ComplaintPriority, ComplaintHistory
from app.models.anomaly import Anomaly, AnomalyCategory, AnomalySeverity, AnomalyStatus
from app.models.recommendation import SustainabilityRecommendation, RecommendationPriority, RecommendationStatus
from app.models.notification import Notification, NotificationType


def seed_initial_data(db: Session):
    """Seed all initial data. Safe to call multiple times — skips if already seeded."""
    rng = random.Random(42)

    # --- Wards ---
    if not db.execute(select(Ward)).scalar_one_or_none():
        wards_data = [
            ("Ward 1 - Central",    1, 12.5, 85000),
            ("Ward 2 - North",      2, 18.3, 72000),
            ("Ward 3 - South",      3, 15.1, 93000),
            ("Ward 4 - East",       4, 20.4, 68000),
            ("Ward 5 - West",       5, 16.7, 79000),
        ]
        wards = []
        for name, num, area, pop in wards_data:
            w = Ward(name=name, ward_number=num, area_sqkm=area, population=pop, is_active=True)
            db.add(w)
            wards.append(w)
        db.flush()
    else:
        wards = db.execute(select(Ward)).scalars().all()

    # --- Departments ---
    if not db.execute(select(Department)).scalar_one_or_none():
        depts_data = [
            ("Waste Management",             "WM",  "Handles solid waste collection, disposal, and recycling."),
            ("Water Supply",                 "WS",  "Manages water distribution, treatment, and conservation."),
            ("Electricity",                  "EL",  "Oversees electrical infrastructure and power distribution."),
            ("Road and Infrastructure",      "RI",  "Maintains roads, bridges, and public infrastructure."),
            ("Environmental Protection",     "EP",  "Monitors environmental quality and enforces regulations."),
            ("Public Health and Sanitation", "PH",  "Manages public health programs and sanitation services."),
            ("Traffic Management",           "TM",  "Controls traffic flow, signals, and road safety."),
        ]
        depts = []
        for name, code, desc in depts_data:
            d = Department(name=name, code=code, description=desc, is_active=True)
            db.add(d)
            depts.append(d)
        db.flush()
    else:
        depts = db.execute(select(Department)).scalars().all()

    # --- Users ---
    if not db.execute(select(User)).scalar_one_or_none():
        dept_map = {d.code: d for d in depts}
        users_data = [
            ("super_admin@smartcity.gov",   "Admin@123456",   "Super Administrator", UserRole.SUPER_ADMIN,        None),
            ("city_admin@smartcity.gov",    "CityAdmin@123",  "City Administrator",  UserRole.CITY_ADMIN,         None),
            ("officer@smartcity.gov",       "Officer@123",    "Waste Officer",       UserRole.DEPARTMENT_OFFICER, "WM"),
            ("analyst@smartcity.gov",       "Analyst@123",    "Data Analyst",        UserRole.DATA_ANALYST,       None),
            ("water_officer@smartcity.gov", "Water@Officer1", "Water Supply Officer",UserRole.DEPARTMENT_OFFICER, "WS"),
            ("road_officer@smartcity.gov",  "Road@Officer1",  "Road Infrastructure Officer", UserRole.DEPARTMENT_OFFICER, "RI"),
        ]
        users = []
        for email, pwd, name, role, dept_code in users_data:
            u = User(
                email=email,
                full_name=name,
                hashed_password=hash_password(pwd),
                role=role,
                department_id=dept_map[dept_code].id if dept_code else None,
                is_active=True,
                is_first_login=False,
                phone=f"+91-{rng.randint(7000000000, 9999999999)}",
            )
            db.add(u)
            users.append(u)
        db.flush()
        super_admin = users[0]
        city_admin = users[1]
    else:
        users = db.execute(select(User)).scalars().all()
        super_admin = next((u for u in users if u.role == UserRole.SUPER_ADMIN), users[0])
        city_admin = next((u for u in users if u.role == UserRole.CITY_ADMIN), users[0])

    # --- Complaints ---
    if not db.execute(select(Complaint)).scalar_one_or_none():
        citizen_names = ["Ravi Kumar", "Priya Sharma", "Amit Singh", "Sunita Devi", "Rahul Gupta",
                         "Meena Patel", "Suresh Nair", "Kavitha Reddy", "Deepak Joshi", "Anita Roy"]
        locations = ["MG Road", "Anna Nagar", "Koramangala", "Whitefield", "JP Nagar",
                     "HSR Layout", "Indiranagar", "Jayanagar", "Electronic City", "Banashankari"]
        categories = list(ComplaintCategory)
        priorities = [ComplaintPriority.LOW, ComplaintPriority.MEDIUM, ComplaintPriority.HIGH, ComplaintPriority.CRITICAL]
        statuses_weighted = (
            [ComplaintStatus.SUBMITTED] * 10 +
            [ComplaintStatus.UNDER_REVIEW] * 8 +
            [ComplaintStatus.ASSIGNED] * 7 +
            [ComplaintStatus.IN_PROGRESS] * 8 +
            [ComplaintStatus.RESOLVED] * 15 +
            [ComplaintStatus.REJECTED] * 2
        )

        for i in range(1, 51):
            ward = rng.choice(wards)
            dept = rng.choice(depts)
            cat = rng.choice(categories)
            priority = rng.choices(priorities, weights=[30, 40, 20, 10])[0]
            status = rng.choice(statuses_weighted)
            created_days_ago = rng.randint(1, 180)
            created_at = datetime.utcnow() - timedelta(days=created_days_ago)

            complaint = Complaint(
                complaint_number=f"CMP-2024-{i:04d}",
                citizen_name=rng.choice(citizen_names),
                citizen_email=f"citizen{i}@example.com",
                citizen_phone=f"+91-{rng.randint(7000000000, 9999999999)}",
                title=f"{cat.value} issue at {rng.choice(locations)}",
                description=f"Reporting {cat.value.lower()} problem. The issue has been persisting for several days and requires immediate attention from the concerned department. Location: {rng.choice(locations)}, Ward: {ward.name}.",
                category=cat,
                status=status,
                priority=priority,
                ward_id=ward.id,
                department_id=dept.id if status not in [ComplaintStatus.SUBMITTED] else None,
                assigned_by_id=city_admin.id if status not in [ComplaintStatus.SUBMITTED] else None,
                location_address=f"{rng.choice(locations)}, {ward.name}",
                official_remarks="Under review by department." if status == ComplaintStatus.IN_PROGRESS else None,
                created_at=created_at,
                updated_at=created_at,
            )
            if status == ComplaintStatus.RESOLVED:
                complaint.resolved_at = created_at + timedelta(days=rng.randint(1, 10))

            db.add(complaint)

        db.flush()

        # Complaint history for a few complaints
        complaints_list = db.execute(select(Complaint)).scalars().all()
        for c in complaints_list[:20]:
            if c.status != ComplaintStatus.SUBMITTED:
                history = ComplaintHistory(
                    complaint_id=c.id,
                    changed_by_id=city_admin.id,
                    old_status=ComplaintStatus.SUBMITTED,
                    new_status=c.status,
                    remark="Status updated by city administrator.",
                    created_at=c.created_at + timedelta(hours=2),
                )
                db.add(history)

    # --- Anomalies ---
    if not db.execute(select(Anomaly)).scalar_one_or_none():
        anomaly_data = [
            ("ANM-2024-0001", AnomalyCategory.WATER_CONSUMPTION, AnomalySeverity.HIGH,  AnomalyStatus.UNDER_INVESTIGATION,
             "Unusual spike in water consumption", 650000, 400000, 600000),
            ("ANM-2024-0002", AnomalyCategory.AIR_QUALITY,       AnomalySeverity.CRITICAL, AnomalyStatus.NEW,
             "Severely degraded air quality detected", 280, 50, 150),
            ("ANM-2024-0003", AnomalyCategory.ELECTRICITY_USAGE, AnomalySeverity.MEDIUM, AnomalyStatus.VERIFIED,
             "Above-normal electricity usage in Ward 3", 185000, 80000, 150000),
            ("ANM-2024-0004", AnomalyCategory.WASTE_GENERATION,  AnomalySeverity.LOW,   AnomalyStatus.RESOLVED,
             "Waste generation slightly above normal", 95000, 50000, 90000),
            ("ANM-2024-0005", AnomalyCategory.COMPLAINT_VOLUME,  AnomalySeverity.HIGH,  AnomalyStatus.NEW,
             "Complaint volume tripled in 24 hours", 150, 20, 60),
        ]
        for num, cat, sev, stat, desc, obs, exp_min, exp_max in anomaly_data:
            ward = rng.choice(wards)
            a = Anomaly(
                anomaly_number=num, category=cat, severity=sev, status=stat,
                description=desc, location=rng.choice(["MG Road", "Anna Nagar", "Koramangala"]),
                ward_id=ward.id,
                detected_at=datetime.utcnow() - timedelta(days=rng.randint(1, 30)),
                observed_value=float(obs), expected_min=float(exp_min), expected_max=float(exp_max),
                anomaly_score=-0.3, is_ml_detected=(rng.random() > 0.5),
            )
            db.add(a)

    # --- Recommendations ---
    if not db.execute(select(SustainabilityRecommendation)).scalar_one_or_none():
        recs = [
            {
                "title": "Accelerate Green Cover Expansion in Ward 2",
                "affected_area": "Ward 2 - North",
                "problem_description": "Green coverage in Ward 2 has fallen below the 20% threshold, contributing to higher urban heat island effect and reduced air quality.",
                "suggested_actions": ["Plant 5000 trees along major roads", "Convert 3 vacant lots into pocket parks", "Implement rooftop gardening program"],
                "priority": RecommendationPriority.HIGH,
                "expected_impact": "15% reduction in urban heat, 10% improvement in AQI over 12 months.",
            },
            {
                "title": "Upgrade Water Distribution Network in Ward 1",
                "affected_area": "Ward 1 - Central",
                "problem_description": "Aging water pipes are causing 25% distribution losses and frequent supply interruptions.",
                "suggested_actions": ["Replace 45km of aging pipes", "Install smart water meters", "Set up leak detection sensors"],
                "priority": RecommendationPriority.URGENT,
                "expected_impact": "Reduce water loss from 25% to under 10%, improve supply reliability.",
            },
            {
                "title": "Implement Smart Waste Segregation System",
                "affected_area": "City-Wide",
                "problem_description": "Current waste segregation rates at 35% are well below the 70% target, reducing recycling effectiveness.",
                "suggested_actions": ["Deploy smart bins with RFID tracking", "Launch citizen awareness campaign", "Incentivize segregation compliance"],
                "priority": RecommendationPriority.MEDIUM,
                "expected_impact": "Increase recycling by 40%, reduce landfill load by 30%.",
            },
        ]
        for r in recs:
            rec = SustainabilityRecommendation(
                title=r["title"], affected_area=r["affected_area"],
                problem_description=r["problem_description"],
                suggested_actions=r["suggested_actions"],
                priority=r["priority"], expected_impact=r["expected_impact"],
                status=RecommendationStatus.PENDING, generated_by="MANUAL",
            )
            db.add(rec)

    # --- Notifications ---
    if not db.execute(select(Notification)).scalar_one_or_none():
        notif_data = [
            (NotificationType.ANOMALY_DETECTED,            "Anomaly Detected",          "Air quality anomaly detected in Ward 2. Severity: CRITICAL."),
            (NotificationType.NEW_HIGH_PRIORITY_COMPLAINT, "Critical Complaint Received","A critical priority complaint has been submitted for Water Supply in Ward 1."),
            (NotificationType.GOVERNMENT_ANNOUNCEMENT,     "City Council Meeting",       "Monthly city council meeting scheduled for next week. All department heads to attend."),
            (NotificationType.DEPARTMENT_PERFORMANCE_WARNING, "Low Resolution Rate",     "Waste Management department resolution rate dropped below 60% this month."),
            (NotificationType.PREDICTION_WARNING,          "High Water Demand Predicted","ML model predicts 25% above-normal water demand next week due to seasonal factors."),
        ]
        for u in users[:3]:
            for ntype, title, msg in notif_data:
                n = Notification(
                    user_id=u.id, title=title, message=msg,
                    notification_type=ntype, is_read=rng.random() > 0.5,
                    created_at=datetime.utcnow() - timedelta(hours=rng.randint(1, 72)),
                )
                db.add(n)

    db.commit()
    print("✅ Seed data loaded successfully.")

