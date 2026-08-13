import os
import sys
import joblib
import pandas as pd
import numpy as np
sys.path.append(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\ml_service")
os.chdir(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\ml_service")

from app.core.config import settings
from app.services.preprocessor import DataPreprocessor

def main():
    model_dir = os.path.join(settings.ARTIFACTS_DIR, settings.MODEL_VERSION)
    model_path = os.path.join(model_dir, "risk_model.pkl")
    scaler_path = os.path.join(model_dir, "scaler.pkl")

    if not os.path.exists(model_path):
        print("Model does not exist!")
        return

    model = joblib.load(model_path)
    preprocessor = DataPreprocessor.load(scaler_path)

    # Generate a grid of test cases to see predictions
    # Vary attendance from 0% to 100% and avg_test_score from 0% to 100%
    records = []
    for att in np.linspace(0, 100, 11):
        for score in np.linspace(0, 100, 11):
            records.append({
                "attendance_rate": att,
                "consecutive_absences": 0 if att > 50 else 5,
                "score_trend": 0.0,
                "avg_test_score": score,
                "attempt_ratio": 1.0,
                "fee_delay_days": 0,
                "assignment_submission_rate": 100.0
            })
    
    df = pd.DataFrame(records)
    scaled_x = preprocessor.transform(df)
    probs = model.predict_proba(scaled_x)[:, 1] * 100.0

    print("Prediction grid (Attendance vs Test Score):")
    for i, att in enumerate(np.linspace(0, 100, 11)):
        row_str = f"Att: {att:3.0f}% | "
        for j, score in enumerate(np.linspace(0, 100, 11)):
            idx = i * 11 + j
            row_str += f"{probs[idx]:5.1f}% "
        print(row_str)

if __name__ == "__main__":
    main()
