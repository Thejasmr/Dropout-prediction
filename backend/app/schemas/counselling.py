from uuid import UUID
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CounsellingSessionCreate(BaseModel):
    student_id: Optional[UUID] = None
    session_date: Optional[date] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    follow_up_date: Optional[date] = None


class CounsellingSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    counsellor_id: UUID
    session_date: date
    notes: Optional[str] = None
    outcome: Optional[str] = None
    follow_up_date: Optional[date] = None
