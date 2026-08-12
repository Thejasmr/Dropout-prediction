import os
import joblib
import numpy as np
import pandas as pd
from ml_service.app.core.config import settings
from ml_service.app.services.preprocessor import DataPreprocessor, FEATURE_COLUMNS


def generate_synthetic_data(num_samples: int = 500) -> pd.DataFrame:
    np.random.seed(42)

    # Sample wider, realistic ranges so the model learns from extremes (e.g. 0% attendance, very low test scores)
    attendance_rate = np.random.uniform(0.0, 100.0, num_samples)
    consecutive_absences = np.random.randint(0, 20, num_samples)
    score_trend = np.random.uniform(-15.0, 15.0, num_samples)
    avg_test_score = np.random.uniform(10.0, 100.0, num_samples)
    attempt_ratio = np.random.uniform(1.0, 4.0, num_samples)
    fee_delay_days = np.random.randint(0, 120, num_samples)
    assignment_submission_rate = np.random.uniform(0.0, 100.0, num_samples)

    # Adjust dropout probability formula:
    # 1. Heavily weight low attendance and low test scores (standard indicators)
    # 2. Lower the weight of attempt_ratio and fee delay so they don't overpower attendance
    # 3. Add contribution for high consecutive absences and low assignment rates
    dropout_prob = (
        (100.0 - attendance_rate) * 0.50 +
        (100.0 - avg_test_score) * 0.30 +
        (consecutive_absences / 20.0) * 10.0 +
        (attempt_ratio - 1.0) * 5.0 +
        (fee_delay_days / 120.0) * 10.0 +
        (100.0 - assignment_submission_rate) * 0.05
    ) / 100.0

    # Classify as dropout if the probability is high (threshold 0.5)
    dropout = (dropout_prob + np.random.normal(0, 0.05, num_samples)) > 0.50
    dropout_labels = np.clip(dropout.astype(int), 0, 1)

    df = pd.DataFrame({
        "attendance_rate": attendance_rate,
        "consecutive_absences": consecutive_absences,
        "score_trend": score_trend,
        "avg_test_score": avg_test_score,
        "attempt_ratio": attempt_ratio,
        "fee_delay_days": fee_delay_days,
        "assignment_submission_rate": assignment_submission_rate,
        "dropout": dropout_labels
    })

    return df


def train_baseline_model():
    df = generate_synthetic_data(num_samples=600)
    X = df[FEATURE_COLUMNS]
    y = df["dropout"]

    # Preprocessing
    preprocessor = DataPreprocessor()
    X_scaled = preprocessor.fit_transform(X)

    # Apply SMOTE if available, else standard fit
    try:
        from imblearn.over_sampling import SMOTE
        smote = SMOTE(random_state=42)
        X_res, y_res = smote.fit_resample(X_scaled, y)
    except Exception:
        X_res, y_res = X_scaled, y

    # Train XGBoost or RandomForest Classifier
    try:
        from xgboost import XGBClassifier
        model = XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42,
            eval_metric="logloss"
        )
    except Exception:
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)

    model.fit(X_res, y_res)

    # Save artifacts into v1.0.0
    version_dir = os.path.join(settings.ARTIFACTS_DIR, settings.MODEL_VERSION)
    os.makedirs(version_dir, exist_ok=True)

    model_path = os.path.join(version_dir, "risk_model.pkl")
    scaler_path = os.path.join(version_dir, "scaler.pkl")

    joblib.dump(model, model_path)
    preprocessor.save(scaler_path)

    print(f"Model artifacts successfully trained and saved to '{version_dir}'.")
    return model_path, scaler_path


if __name__ == "__main__":
    train_baseline_model()
