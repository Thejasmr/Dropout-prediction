from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict


class StudentCreate(BaseModel):
    enrollment_no: str
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[EmailStr] = None
    course_id: Optional[UUID] = None
    batch_year: Optional[int] = None
    current_semester: Optional[int] = None


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[EmailStr] = None
    course_id: Optional[UUID] = None
    batch_year: Optional[int] = None
    current_semester: Optional[int] = None


class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    enrollment_no: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[str] = None
    course_id: Optional[UUID] = None
    batch_year: Optional[int] = None
    current_semester: Optional[int] = None
    created_at: datetime
    latest_risk_score: Optional[float] = None
    latest_risk_level: Optional[str] = None
    attendance_rate: Optional[float] = None


class StudentListResponse(BaseModel):
    items: List[StudentResponse]
    next_cursor: Optional[str] = None
    has_more: bool
    total_count: int


class StudentOverrideRequest(BaseModel):
    score: float
    risk_level: str  # 'high', 'medium', 'low'
    reason: str
