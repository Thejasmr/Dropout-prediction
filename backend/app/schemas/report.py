from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ReportSummaryResponse(BaseModel):
    total_students: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_attendance_rate: float
    overdue_fee_count: int
    monthly_trend: Optional[List[Dict[str, Any]]] = None


class CohortRiskItem(BaseModel):
    cohort_name: str
    total_students: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_risk_score: float


class CohortReportResponse(BaseModel):
    cohorts: List[CohortRiskItem]
