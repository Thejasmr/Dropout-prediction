import os
import joblib
import pandas as pd
from typing import Dict, Any, Tuple
from ml_service.app.core.config import settings
from ml_service.app.services.preprocessor import DataPreprocessor, FEATURE_COLUMNS
from ml_service.app.services.feature_engineering import calculate_composite_risk_score


class RiskPredictor:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.version = settings.MODEL_VERSION
        self._load_artifacts()

    def _load_artifacts(self):
        model_dir = os.path.join(settings.ARTIFACTS_DIR, self.version)
        model_path = os.path.join(model_dir, "risk_model.pkl")
        scaler_path = os.path.join(model_dir, "scaler.pkl")

        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.preprocessor = DataPreprocessor.load(scaler_path)
            except Exception as e:
                print(f"Error loading model artifact: {e}")
                self.model = None

    def predict(self, features_dict: Dict[str, Any]) -> Tuple[float, str]:
        df = pd.DataFrame([features_dict])

        if self.model is not None and self.preprocessor is not None:
            try:
                scaled_x = self.preprocessor.transform(df)
                proba = self.model.predict_proba(scaled_x)[0][1]
                score = round(float(proba * 100.0), 2)
            except Exception:
                score = self._fallback_score(features_dict)
        else:
            score = self._fallback_score(features_dict)

        risk_level = self.classify_risk_level(score)
        return score, risk_level

    def _fallback_score(self, features_dict: Dict[str, Any]) -> float:
        return calculate_composite_risk_score(
            attendance_rate=features_dict.get("attendance_rate", 100.0),
            consecutive_absences=features_dict.get("consecutive_absences", 0),
            avg_test_score=features_dict.get("avg_test_score", 70.0),
            score_trend=features_dict.get("score_trend", 0.0),
            attempt_ratio=features_dict.get("attempt_ratio", 1.0),
            fee_delay_days=features_dict.get("fee_delay_days", 0),
            assignment_submission_rate=features_dict.get("assignment_submission_rate", 100.0)
        )

    @staticmethod
    def classify_risk_level(score: float) -> str:
        if score >= settings.RISK_HIGH_THRESHOLD:
            return "high"
        elif score >= settings.RISK_MEDIUM_THRESHOLD:
            return "medium"
        return "low"


predictor_instance = RiskPredictor()
