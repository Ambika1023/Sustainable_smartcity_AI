import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler

from app.ml.base_model import BaseMLModel


class CityPredictionModel(BaseMLModel):
    def __init__(self, prediction_type: str):
        self.prediction_type = prediction_type
        self.scaler = None
        super().__init__(f"prediction_{prediction_type.lower().replace(' ', '_')}")

    def _load_model(self):
        import os, pickle
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    saved = pickle.load(f)
                self.model = saved.get("model")
                self.scaler = saved.get("scaler")
                self.is_trained = True
            except Exception:
                self.is_trained = False

    def train(self, X: np.ndarray, y: np.ndarray) -> dict:
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        self.model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        self._save_model(extra={"scaler": self.scaler})
        preds = self.model.predict(X_scaled)
        return {
            "mae": float(mean_absolute_error(y, preds)),
            "r2": float(r2_score(y, preds)),
            "samples": int(len(y)),
        }

    def predict(self, X: np.ndarray):
        if not self.is_trained or self.model is None or self.scaler is None:
            return None
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled).tolist()

