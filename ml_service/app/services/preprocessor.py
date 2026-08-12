import os
import joblib
import numpy as np
import pandas as pd
from typing import Optional


FEATURE_COLUMNS = [
    "attendance_rate",
    "consecutive_absences",
    "score_trend",
    "avg_test_score",
    "attempt_ratio",
    "fee_delay_days",
    "assignment_submission_rate"
]


class DataPreprocessor:
    def __init__(self, scaler=None):
        self.scaler = scaler
        self.feature_columns = FEATURE_COLUMNS

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        from sklearn.preprocessing import StandardScaler
        df_clean = df[self.feature_columns].copy()
        df_clean = df_clean.fillna(df_clean.median())

        self.scaler = StandardScaler()
        scaled = self.scaler.fit_transform(df_clean)
        return scaled

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        df_clean = df[self.feature_columns].copy()
        df_clean = df_clean.fillna(50.0)

        if self.scaler is not None:
            return self.scaler.transform(df_clean)
        return df_clean.values

    def save(self, filepath: str):
        joblib.dump(self.scaler, filepath)

    @classmethod
    def load(cls, filepath: str):
        if os.path.exists(filepath):
            scaler = joblib.load(filepath)
            return cls(scaler=scaler)
        return cls()
