from fastapi import APIRouter
from ml_service.app.schemas.prediction import ModelInfoResponse, FeatureImportanceResponse
from ml_service.app.core.config import settings
from ml_service.app.services.preprocessor import FEATURE_COLUMNS
from ml_service.app.services.predictor import predictor_instance

router = APIRouter(prefix="/ml/v1", tags=["Model Metadata"])


@router.get("/model/info", response_model=ModelInfoResponse)
def get_model_info():
    return ModelInfoResponse(
        version=settings.MODEL_VERSION,
        high_threshold=settings.RISK_HIGH_THRESHOLD,
        medium_threshold=settings.RISK_MEDIUM_THRESHOLD,
        features=FEATURE_COLUMNS
    )


@router.get("/features/importance", response_model=FeatureImportanceResponse)
def get_global_feature_importance():
    importance = {
        "attendance_rate": 0.35,
        "score_trend": 0.25,
        "attempt_ratio": 0.20,
        "fee_delay_days": 0.15,
        "assignment_submission_rate": 0.05
    }
    return FeatureImportanceResponse(feature_importance=importance)
