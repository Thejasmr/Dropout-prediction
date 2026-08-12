from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class RiskScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    score: float
    risk_level: str  # 'high', 'medium', 'low'
    contributing_factors: Optional[Dict[str, Any]] = None
    model_version: str
    calculated_at: datetime
    is_overridden: bool
    override_reason: Optional[str] = None
