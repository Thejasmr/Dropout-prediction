from uuid import UUID
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AssessmentCreate(BaseModel):
    student_id: UUID
    subject_id: UUID
    assessment_type: str
    score: float
    max_score: float
    attempt_number: Optional[int] = 1
    assessment_date: Optional[date] = None


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    subject_id: UUID
    assessment_type: str
    score: float
    max_score: float
    attempt_number: int
    assessment_date: Optional[date] = None
