import numpy as np
from sklearn.ensemble import IsolationForest

from app.ml.base_model import BaseMLModel


class CityAnomalyDetector(BaseMLModel):
    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        super().__init__("anomaly_detector")

    def train(self, X: np.ndarray):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42,
        )
        self.model.fit(X)
        self.is_trained = True
        self._save_model()

    def detect(self, X: np.ndarray) -> np.ndarray:
        """Return array: -1 = anomaly, 1 = normal."""
        if not self.is_trained:
            self.train(X)
        return self.model.predict(X)

    def anomaly_scores(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            return np.zeros(len(X))
        return self.model.score_samples(X)

    def predict(self, X: np.ndarray):
        return self.detect(X)

