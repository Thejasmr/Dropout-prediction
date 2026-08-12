from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class AttendanceCreate(BaseModel):
    student_id: UUID
    date: date
    subject_id: UUID
    status: str  # 'present', 'absent', 'late'


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    date: date
    subject_id: UUID
    status: str
    recorded_at: datetime
