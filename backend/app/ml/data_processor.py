import numpy as np
import pandas as pd


class CityDataProcessor:
    @staticmethod
    def prepare_time_features(dates: list) -> np.ndarray:
        df = pd.DataFrame({"date": pd.to_datetime(dates)})
        df["day_of_week"] = df["date"].dt.dayofweek
        df["month"] = df["date"].dt.month
        df["day_of_month"] = df["date"].dt.day
        df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
        return df[["day_of_week", "month", "day_of_month", "week_of_year"]].values

    @staticmethod
    def normalize_environmental_data(data: list) -> pd.DataFrame:
        df = pd.DataFrame(data)
        for col in ["water_consumption_liters", "electricity_consumption_kwh", "waste_generation_kg", "air_quality_index"]:
            if col in df.columns:
                mean = df[col].mean()
                std = df[col].std()
                df[col] = (df[col] - mean) / (std + 1e-8)
        return df

