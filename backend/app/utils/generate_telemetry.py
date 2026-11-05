"""Telemetry Simulator Script
Simulates live municipal sensor data generation and injects real-time anomalies for live demonstrations.
Usage:
    python -m app.utils.generate_telemetry --days 7 --anomaly
"""
import argparse
import random
import sys
from datetime import date, timedelta
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.ward import Ward
from app.models.analytics import CityEnvironmentalData
from app.models.anomaly import Anomaly, AnomalyCategory, AnomalySeverity, AnomalyStatus

def generate_telemetry(days: int = 7, inject_anomaly: bool = False):
    db = SessionLocal()
    try:
        wards = db.execute(select(Ward)).scalars().all()
        if not wards:
            print("❌ No wards found. Run database seeding first: python -m app.utils.seed_data")
            return

        today = date.today()
        rng = random.Random()
        print(f"📡 Generating {days} days of telemetry across {len(wards)} wards...")

        for i in range(days):
            current_date = today - timedelta(days=days - 1 - i)
            for ward in wards:
                water = rng.uniform(450000, 580000)
                power = rng.uniform(85000, 140000)
                waste = rng.uniform(55000, 85000)
                aqi = rng.uniform(50, 95)
                traffic = rng.uniform(3.5, 7.5)
                green = rng.uniform(22, 35)

                if inject_anomaly and i == days - 1 and ward.ward_number == 1:
                    print(f"⚠️ Injecting live critical water anomaly into Ward {ward.ward_number}...")
                    water = 750000.0  # Massive spike
                    anomaly = Anomaly(
                        anomaly_number=f"ANM-{current_date.year}-{random.randint(1000, 9999)}",
                        category=AnomalyCategory.WATER_CONSUMPTION,
                        severity=AnomalySeverity.CRITICAL,
                        status=AnomalyStatus.NEW,
                        description=f"Automated pipeline surge detected in {ward.name}",
                        location=f"Central Pumping Station, {ward.name}",
                        ward_id=ward.id,
                        detected_at=date.today(),
                        observed_value=water,
                        expected_min=450000,
                        expected_max=580000,
                        anomaly_score=-0.45,
                        is_ml_detected=True,
                    )
                    db.add(anomaly)

                row = CityEnvironmentalData(
                    ward_id=ward.id,
                    recorded_date=current_date,
                    water_consumption_liters=water,
                    electricity_consumption_kwh=power,
                    waste_generation_kg=waste,
                    air_quality_index=aqi,
                    traffic_congestion_index=traffic,
                    green_coverage_percent=green,
                )
                db.add(row)

        db.commit()
        print("✅ Telemetry generation complete!")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smart City Telemetry Simulator")
    parser.add_argument("--days", type=int, default=7, help="Number of days to simulate")
    parser.add_argument("--anomaly", action="store_true", help="Inject an intentional outlier anomaly")
    args = parser.parse_args()
    generate_telemetry(args.days, args.anomaly)

