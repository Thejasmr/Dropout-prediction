import asyncio
import json
import os
from typing import AsyncGenerator, Optional
from uuid import UUID
import httpx
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chatbot_messages import ChatbotMessage
from app.models.student import Student
from app.models.risk_score import RiskScore
from app.core.config import settings


class ChatbotService:

    @staticmethod
    async def get_rag_context(session: AsyncSession, context_student_id: Optional[UUID]) -> str:
        if not context_student_id:
            return "Context: DTE Rajasthan AI Dropout Prediction System. Guidance on academic interventions, fee structure, and student risk management."

        # Fetch student details
        student_stmt = select(Student).where(Student.id == context_student_id)
        student = (await session.execute(student_stmt)).scalar_one_or_none()
        if not student:
            return "Context: Student record not found."

        # Fetch latest risk score
        risk_stmt = (
            select(RiskScore)
            .where(RiskScore.student_id == context_student_id)
            .order_by(desc(RiskScore.calculated_at))
            .limit(1)
        )
        risk = (await session.execute(risk_stmt)).scalar_one_or_none()

        context_info = (
            f"Student Context: {student.full_name} (Enrollment #{student.enrollment_no}), "
            f"Semester: {student.current_semester}, Batch: {student.batch_year}. "
        )
        if risk:
            context_info += f"Current Risk Score: {risk.score} ({risk.risk_level.upper()} Risk). Contributing factors: {risk.contributing_factors}."
        else:
            context_info += "No risk score recorded yet."

        return context_info

    @classmethod
    async def stream_chat_response(
        cls,
        query: str,
        session_id: str,
        user_id: UUID,
        context_student_id: Optional[UUID],
        session: AsyncSession
    ) -> AsyncGenerator[str, None]:
        # Save user message to database
        user_msg = ChatbotMessage(
            user_id=user_id,
            session_id=session_id,
            role="user",
            content=query,
            context_student_id=context_student_id
        )
        session.add(user_msg)
        await session.commit()

        # Build context
        context_text = await cls.get_rag_context(session, context_student_id)
        system_prompt = f"You are an AI Counseling Assistant for the DTE Rajasthan Student Dropout Prediction System.\n{context_text}"

        full_response_text = ""

        # Check provider configuration
        provider = getattr(settings, "LLM_PROVIDER", "openai").lower()
        openai_key = os.getenv("OPENAI_API_KEY", "")

        if provider == "openai" and openai_key and openai_key != "your_openai_key":
            # OpenAI Streaming Call via HTTP API
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": getattr(settings, "OPENAI_MODEL", "gpt-4o-mini"),
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                "stream": True,
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream("POST", "https://api.openai.com/v1/chat/completions", headers=headers, json=payload) as resp:
                    async for line in resp.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk_json = json.loads(data_str)
                                delta = chunk_json["choices"][0]["delta"].get("content", "")
                                if delta:
                                    full_response_text += delta
                                    yield f"data: {json.dumps({'content': delta})}\n\n"
                            except Exception:
                                pass
        else:
            # Smart Fallback / Rule-based Assistant response generator
            fallback_text = (
                f"Thank you for asking: '{query}'. Based on institutional guidelines and student records, "
                f"early intervention is recommended. {context_text}"
            )
            # Stream tokens word by word
            words = fallback_text.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                full_response_text += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"
                await asyncio.sleep(0.03)

        # Yield completion signal
        yield f"data: {json.dumps({'event': 'done', 'content': ''})}\n\n"

        # Save assistant message to database
        assistant_msg = ChatbotMessage(
            user_id=user_id,
            session_id=session_id,
            role="assistant",
            content=full_response_text,
            context_student_id=context_student_id
        )
        session.add(assistant_msg)
        await session.commit()
