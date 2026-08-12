from fastapi import APIRouter
from ml_service.app.schemas.prediction import (
    StudentFeatures,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse
)
from ml_service.app.services.predictor import predictor_instance
from ml_service.app.services.explainer import explainer_instance
from ml_service.app.core.config import settings

router = APIRouter(prefix="/ml/v1", tags=["Inference"])


@router.post("/predict", response_model=PredictionResponse)
def predict_single(features: StudentFeatures):
    features_dict = features.model_dump()
    score, risk_level = predictor_instance.predict(features_dict)
    contributing_factors = explainer_instance.explain(features_dict, top_n=3)

    return PredictionResponse(
        student_id=features.student_id,
        score=score,
        risk_level=risk_level,
        model_version=settings.MODEL_VERSION,
        contributing_factors=contributing_factors
    )


@router.post("/predict/batch", response_model=BatchPredictionResponse)
def predict_batch(batch: BatchPredictionRequest):
    results = []
    for sf in batch.students:
        f_dict = sf.model_dump()
        score, risk_level = predictor_instance.predict(f_dict)
        factors = explainer_instance.explain(f_dict, top_n=3)

        results.append(
            PredictionResponse(
                student_id=sf.student_id,
                score=score,
                risk_level=risk_level,
                model_version=settings.MODEL_VERSION,
                contributing_factors=factors
            )
        )

    return BatchPredictionResponse(predictions=results)
