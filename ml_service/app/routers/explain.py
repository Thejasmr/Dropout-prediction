from fastapi import APIRouter
from ml_service.app.schemas.prediction import StudentFeatures, PredictionResponse
from ml_service.app.services.predictor import predictor_instance
from ml_service.app.services.explainer import explainer_instance
from ml_service.app.core.config import settings

router = APIRouter(prefix="/ml/v1", tags=["Explainability"])


@router.get("/explain/{student_id}")
def explain_student_risk(student_id: str):
    # Sample default feature lookup for explanation
    default_features = {
        "student_id": student_id,
        "attendance_rate": 65.0,
        "consecutive_absences": 4,
        "score_trend": -3.5,
        "avg_test_score": 58.0,
        "attempt_ratio": 1.5,
        "fee_delay_days": 15,
        "assignment_submission_rate": 70.0
    }

    score, risk_level = predictor_instance.predict(default_features)
    factors = explainer_instance.explain(default_features, top_n=3)

    return {
        "student_id": student_id,
        "score": score,
        "risk_level": risk_level,
        "model_version": settings.MODEL_VERSION,
        "top_contributing_factors": factors
    }
