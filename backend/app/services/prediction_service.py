from typing import Optional
from uuid import UUID
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.prediction_model import CityPredictionModel
from app.ml.data_processor import CityDataProcessor
from app.models.analytics import CityEnvironmentalData
from app.models.complaint import Complaint

PREDICTION_TYPES = {
    "water_demand": "water_consumption_liters",
    "electricity_consumption": "electricity_consumption_kwh",
    "waste_generation": "waste_generation_kg",
    "complaint_volume": None,  # from complaints table
    "sustainability_performance": "air_quality_index",
}


def get_all_model_statuses() -> list:
    result = []
    for ptype in PREDICTION_TYPES:
        model = CityPredictionModel(ptype)
        result.append({
            "prediction_type": ptype,
            "is_trained": model.is_trained,
            "model_name": model.model_name,
            "algorithm": "RandomForestRegressor",
        })
    return result


def get_predictions(db: Session, prediction_type: str, days_ahead: int = 30, ward_id: Optional[UUID] = None) -> dict:
    if prediction_type not in PREDICTION_TYPES:
        return {"error": f"Unknown prediction type: {prediction_type}", "status": "ERROR"}

    model = CityPredictionModel(prediction_type)
    if not model.is_trained:
        return {
            "status": "MODEL_NOT_TRAINED",
            "prediction_type": prediction_type,
            "is_sample_data": False,
            "message": "Model has not been trained yet. Use POST /api/predictions/{type}/train to train the model with available data.",
            "historical": [],
            "predictions": [],
        }

    # Get historical data
    historical = _get_historical_data(db, prediction_type, ward_id)
    if not historical:
        return {"status": "NO_DATA", "message": "No historical data available", "historical": [], "predictions": []}

    # Build future dates
    last_date = date.today()
    future_dates = [last_date + timedelta(days=i + 1) for i in range(days_ahead)]
    processor = CityDataProcessor()
    X_future = processor.prepare_time_features([str(d) for d in future_dates])
    predicted_values = model.predict(X_future)

    return {
        "status": "OK",
        "prediction_type": prediction_type,
        "is_sample_data": False,
        "algorithm": "RandomForestRegressor",
        "historical": historical[-90:],  # Last 90 days
        "predictions": [
            {"date": str(future_dates[i]), "predicted_value": round(float(predicted_values[i]), 2)}
            for i in range(len(future_dates))
        ],
    }


def train_model(db: Session, prediction_type: str) -> dict:
    if prediction_type not in PREDICTION_TYPES:
        return {"error": f"Unknown prediction type: {prediction_type}"}

    historical = _get_historical_data(db, prediction_type)
    if len(historical) < 30:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": f"Need at least 30 data points. Currently have {len(historical)}.",
        }

    import numpy as np
    processor = CityDataProcessor()
    dates = [item["date"] for item in historical]
    values = [item["value"] for item in historical]
    X = processor.prepare_time_features(dates)
    y = np.array(values)

    model = CityPredictionModel(prediction_type)
    metrics = model.train(X, y)
    return {
        "status": "TRAINED",
        "prediction_type": prediction_type,
        "samples_used": len(historical),
        "metrics": metrics,
    }


def _get_historical_data(db: Session, prediction_type: str, ward_id: Optional[UUID] = None) -> list:
    column = PREDICTION_TYPES[prediction_type]
    if column is None:
        # Complaint volume
        from collections import defaultdict
        complaints = db.execute(select(Complaint)).scalars().all()
        daily: dict = defaultdict(int)
        for c in complaints:
            daily[c.created_at.strftime("%Y-%m-%d")] += 1
        return [{"date": k, "value": v} for k, v in sorted(daily.items())]
    else:
        stmt = select(CityEnvironmentalData)
        if ward_id:
            stmt = stmt.where(CityEnvironmentalData.ward_id == ward_id)
        stmt = stmt.order_by(CityEnvironmentalData.recorded_date)
        rows = db.execute(stmt).scalars().all()
        return [{"date": str(r.recorded_date), "value": getattr(r, column)} for r in rows]
