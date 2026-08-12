from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    alert_type: Optional[str] = None
    message: Optional[str] = None
    severity: str  # 'critical', 'warning', 'info'
    is_read: bool
    created_at: datetime


class AlertUpdate(BaseModel):
    is_read: bool
