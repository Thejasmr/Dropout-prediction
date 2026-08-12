from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ChatbotQueryRequest(BaseModel):
    query: str
    session_id: str
    context_student_id: Optional[UUID] = None


class ChatbotMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    session_id: str
    role: str
    content: str
    context_student_id: Optional[UUID] = None
    created_at: datetime


class ChatbotHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatbotMessageResponse]
