from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class StudentFeatures(BaseModel):
    student_id: Optional[str] = None
    attendance_rate: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0-100)")
    consecutive_absences: int = Field(0, ge=0, description="Number of consecutive absent days")
    score_trend: float = Field(0.0, description="Trend/slope of recent test scores")
    avg_test_score: float = Field(70.0, ge=0.0, le=100.0, description="Average test score percentage")
    attempt_ratio: float = Field(1.0, ge=1.0, description="Total attempts taken over subjects")
    fee_delay_days: int = Field(0, ge=0, description="Fee payment delay in days")
    assignment_submission_rate: float = Field(100.0, ge=0.0, le=100.0, description="Assignment submission rate percentage")


class PredictionResponse(BaseModel):
    student_id: Optional[str] = None
    score: float
    risk_level: str  # 'high', 'medium', 'low'
    model_version: str
    contributing_factors: Dict[str, Any]


class BatchPredictionRequest(BaseModel):
    students: List[StudentFeatures]


class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]


class ModelInfoResponse(BaseModel):
    version: str
    high_threshold: float
    medium_threshold: float
    features: List[str]


class FeatureImportanceResponse(BaseModel):
    feature_importance: Dict[str, float]
