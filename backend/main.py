from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.students import router as students_router
from app.routers.ingestion import router as ingestion_router
from app.routers.alerts import router as alerts_router
from app.routers.reports import router as reports_router
from app.routers.chatbot import router as chatbot_router
from app.routers.demo import router as demo_router

app = FastAPI(
    title="DTE Dropout Prediction System API",
    description="Backend API for AI-Based Student Drop-Out Prediction and Counseling System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(students_router, prefix=api_v1_prefix)
app.include_router(ingestion_router, prefix=api_v1_prefix)
app.include_router(alerts_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(chatbot_router, prefix=api_v1_prefix)
app.include_router(demo_router, prefix=api_v1_prefix)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "backend",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
