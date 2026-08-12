from fastapi import APIRouter
from ml_service.app.services.trainer import train_baseline_model
from ml_service.app.services.predictor import predictor_instance
from ml_service.app.services.explainer import explainer_instance

router = APIRouter(prefix="/ml/v1", tags=["Retraining"])


@router.post("/retrain")
def trigger_retraining():
    model_path, scaler_path = train_baseline_model()
    predictor_instance._load_artifacts()
    explainer_instance._init_explainer()

    return {
        "status": "success",
        "message": "Model retrained and artifacts updated successfully",
        "model_path": model_path,
        "scaler_path": scaler_path
    }
