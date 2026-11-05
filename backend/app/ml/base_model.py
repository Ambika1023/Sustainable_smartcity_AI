import os
import pickle
from abc import ABC, abstractmethod


class BaseMLModel(ABC):
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.model = None
        self.is_trained = False
        os.makedirs("ml_models", exist_ok=True)
        self.model_path = os.path.join("ml_models", f"{model_name}.pkl")
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    saved = pickle.load(f)
                self.model = saved.get("model")
                self.__dict__.update({k: v for k, v in saved.items() if k != "model"})
                self.is_trained = True
            except Exception:
                self.is_trained = False

    def _save_model(self, extra: dict = None):
        data = {"model": self.model}
        if extra:
            data.update(extra)
        with open(self.model_path, "wb") as f:
            pickle.dump(data, f)

    @abstractmethod
    def train(self, X, y):
        pass

    @abstractmethod
    def predict(self, X):
        pass

    def get_status(self) -> dict:
        return {"is_trained": self.is_trained, "model_name": self.model_name}

