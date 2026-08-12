from uuid import UUID
from datetime import date
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class FeeRecordCreate(BaseModel):
    student_id: UUID
    semester: int
    amount_due: Decimal
    amount_paid: Optional[Decimal] = Decimal("0.00")
    due_date: date
    paid_date: Optional[date] = None
    status: str  # 'paid', 'partial', 'overdue'


class FeeRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    semester: int
    amount_due: Decimal
    amount_paid: Decimal
    due_date: date
    paid_date: Optional[date] = None
    status: str
