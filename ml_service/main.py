from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml_service.app.routers.predict import router as predict_router
from ml_service.app.routers.explain import router as explain_router
from ml_service.app.routers.model_info import router as model_info_router
from ml_service.app.routers.retrain import router as retrain_router

app = FastAPI(
    title="DTE Dropout Prediction System ML Service",
    description="Microservice for XGBoost risk prediction, SHAP explainability, and model retraining",
    version="1.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(explain_router)
app.include_router(model_info_router)
app.include_router(retrain_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ml_service",
        "port": 8001
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
