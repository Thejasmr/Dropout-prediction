from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sse_starlette.sse import EventSourceResponse
from sqlalchemy import select, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.chatbot_messages import ChatbotMessage
from app.schemas.chatbot import ChatbotQueryRequest, ChatbotHistoryResponse, ChatbotMessageResponse
from app.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])


@router.post("/query")
async def chatbot_query(
    body: ChatbotQueryRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    event_generator = ChatbotService.stream_chat_response(
        query=body.query,
        session_id=body.session_id,
        user_id=current_user.id,
        context_student_id=body.context_student_id,
        session=session
    )

    return EventSourceResponse(event_generator)


@router.get("/history", response_model=ChatbotHistoryResponse)
async def get_chatbot_history(
    session_id: str = Query(...),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    stmt = (
        select(ChatbotMessage)
        .where(
            (ChatbotMessage.user_id == current_user.id) &
            (ChatbotMessage.session_id == session_id)
        )
        .order_by(ChatbotMessage.created_at)
    )
    result = await session.execute(stmt)
    messages = result.scalars().all()

    return ChatbotHistoryResponse(
        session_id=session_id,
        messages=[ChatbotMessageResponse.model_validate(m) for m in messages]
    )


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chatbot_history(
    session_id: str = Query(...),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    stmt = delete(ChatbotMessage).where(
        (ChatbotMessage.user_id == current_user.id) &
        (ChatbotMessage.session_id == session_id)
    )
    await session.execute(stmt)
    await session.commit()
