import os
import sys
import joblib
import pandas as pd
sys.path.append(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\ml_service")
os.chdir(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\ml_service")

from app.core.config import settings
from app.services.preprocessor import DataPreprocessor

def main():
    model_dir = os.path.join(settings.ARTIFACTS_DIR, settings.MODEL_VERSION)
    model_path = os.path.join(model_dir, "risk_model.pkl")
    scaler_path = os.path.join(model_dir, "scaler.pkl")

    print(f"Model directory: {model_dir}")
    print(f"Model exists: {os.path.exists(model_path)}")
    print(f"Scaler exists: {os.path.exists(scaler_path)}")

    if not os.path.exists(model_path):
        return

    model = joblib.load(model_path)
    preprocessor = DataPreprocessor.load(scaler_path)

    print(f"\nModel class: {model.__class__.__name__}")
    if hasattr(model, "feature_importances_"):
        print(f"Feature importances: {model.feature_importances_}")

    # Let's test a very high risk student (0% attendance, 20% test score, 60 days fee delay)
    test_student = {
        "attendance_rate": 0.0,
        "consecutive_absences": 15,
        "score_trend": -8.0,
        "avg_test_score": 20.0,
        "attempt_ratio": 3.0,
        "fee_delay_days": 60,
        "assignment_submission_rate": 20.0
    }

    df = pd.DataFrame([test_student])
    scaled_x = preprocessor.transform(df)
    print(f"\nScaled features: {scaled_x}")

    proba = model.predict_proba(scaled_x)[0][1]
    print(f"Predicted Probability of Dropout: {proba * 100.0:.2f}%")

if __name__ == "__main__":
    main()
