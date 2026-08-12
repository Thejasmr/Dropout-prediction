import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from ml_service.app.core.config import settings
from ml_service.app.services.preprocessor import FEATURE_COLUMNS
from ml_service.app.services.predictor import predictor_instance


class SHAPExplainer:
    def __init__(self):
        self.explainer = None
        self.feature_names = FEATURE_COLUMNS
        self._init_explainer()

    def _init_explainer(self):
        if predictor_instance.model is not None:
            try:
                import shap
                self.explainer = shap.TreeExplainer(predictor_instance.model)
            except Exception as e:
                print(f"Failed to initialize SHAP TreeExplainer: {e}")
                self.explainer = None

    def explain(self, features_dict: Dict[str, Any], top_n: int = 3) -> Dict[str, float]:
        df = pd.DataFrame([features_dict])

        if self.explainer is not None and predictor_instance.preprocessor is not None:
            try:
                scaled_x = predictor_instance.preprocessor.transform(df)
                shap_values = self.explainer.shap_values(scaled_x)
                if isinstance(shap_values, list):
                    vals = shap_values[1][0]
                else:
                    vals = shap_values[0]

                importance = dict(zip(self.feature_names, [round(float(v), 4) for v in vals]))
                sorted_factors = dict(sorted(importance.items(), key=lambda item: abs(item[1]), reverse=True)[:top_n])
                return sorted_factors
            except Exception:
                return self._fallback_explain(features_dict, top_n)
        else:
            return self._fallback_explain(features_dict, top_n)

    def _fallback_explain(self, features_dict: Dict[str, Any], top_n: int = 3) -> Dict[str, float]:
        factors = {}
        att = features_dict.get("attendance_rate", 100.0)
        if att < 75.0:
            factors["attendance_rate"] = round((75.0 - att) * 0.4, 2)

        trend = features_dict.get("score_trend", 0.0)
        if trend < 0.0:
            factors["score_trend"] = round(abs(trend) * 1.5, 2)

        fee_days = features_dict.get("fee_delay_days", 0)
        if fee_days > 0:
            factors["fee_delay_days"] = round(fee_days * 0.3, 2)

        attempts = features_dict.get("attempt_ratio", 1.0)
        if attempts > 1.0:
            factors["attempt_ratio"] = round((attempts - 1.0) * 10.0, 2)

        absences = features_dict.get("consecutive_absences", 0)
        if absences > 3:
            factors["consecutive_absences"] = round(absences * 1.2, 2)

        if not factors:
            factors["attendance_rate"] = 0.05
            factors["score_trend"] = 0.02
            factors["fee_delay_days"] = 0.01

        sorted_factors = dict(sorted(factors.items(), key=lambda item: item[1], reverse=True)[:top_n])
        return sorted_factors


explainer_instance = SHAPExplainer()
