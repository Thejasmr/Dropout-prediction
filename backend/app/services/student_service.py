from uuid import UUID
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.models.risk_score import RiskScore
from app.models.counselling_session import CounsellingSession
from app.models.attendance import AttendanceRecord
from app.schemas.student import StudentResponse, StudentListResponse, StudentOverrideRequest
from app.schemas.risk_score import RiskScoreResponse
from app.schemas.counselling import CounsellingSessionCreate, CounsellingSessionResponse
from app.utils.pagination import decode_cursor, apply_cursor_pagination
from app.core.cache import cache_get, cache_set, invalidate_student_cache


class StudentService:

    @staticmethod
    async def get_students_paginated(
        session: AsyncSession,
        limit: int = 20,
        cursor: Optional[str] = None,
        search: Optional[str] = None,
        risk_level: Optional[str] = None
    ) -> StudentListResponse:
        # Base query joining latest risk score
        subq = (
            select(
                RiskScore.student_id,
                RiskScore.score,
                RiskScore.risk_level,
                func.row_number().over(
                    partition_by=RiskScore.student_id,
                    order_by=desc(RiskScore.calculated_at)
                ).label("rn")
            ).subquery()
        )

        query = (
            select(Student, subq.c.score, subq.c.risk_level)
            .outerjoin(subq, (Student.id == subq.c.student_id) & (subq.c.rn == 1))
        )

        if search:
            query = query.where(
                or_(
                    Student.full_name.ilike(f"%{search}%"),
                    Student.enrollment_no.ilike(f"%{search}%"),
                    Student.email.ilike(f"%{search}%")
                )
            )

        if risk_level:
            query = query.where(subq.c.risk_level == risk_level.lower())

        # Total count query
        count_stmt = select(func.count()).select_from(Student)
        if search:
            count_stmt = count_stmt.where(
                or_(
                    Student.full_name.ilike(f"%{search}%"),
                    Student.enrollment_no.ilike(f"%{search}%"),
                    Student.email.ilike(f"%{search}%")
                )
            )
        total_count = (await session.execute(count_stmt)).scalar() or 0

        # Apply cursor filter
        if cursor:
            decoded_id = decode_cursor(cursor)
            if decoded_id:
                query = query.where(Student.id > UUID(decoded_id))

        query = query.order_by(Student.id).limit(limit + 1)
        result = await session.execute(query)
        rows = result.all()

        student_responses = []
        for student, score, level in rows[:limit + 1]:
            resp = StudentResponse.model_validate(student)
            resp.latest_risk_score = score
            resp.latest_risk_level = level
            student_responses.append(resp)

        items_subset, next_cursor, has_more = apply_cursor_pagination(
            student_responses,
            limit=limit,
            cursor_key_fn=lambda s: str(s.id)
        )

        return StudentListResponse(
            items=items_subset,
            next_cursor=next_cursor,
            has_more=has_more,
            total_count=total_count
        )

    @staticmethod
    async def get_student_by_id(session: AsyncSession, student_id: UUID) -> StudentResponse:
        cache_key = f"student:{student_id}"
        cached = await cache_get(cache_key)
        if cached:
            return StudentResponse(**cached)

        query = select(Student).where(Student.id == student_id)
        result = await session.execute(query)
        student = result.scalar_one_or_none()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID '{student_id}' not found",
            )

        # Get latest risk score
        risk_stmt = (
            select(RiskScore)
            .where(RiskScore.student_id == student_id)
            .order_by(desc(RiskScore.calculated_at))
            .limit(1)
        )
        latest_risk = (await session.execute(risk_stmt)).scalar_one_or_none()

        # Calculate student attendance rate
        total_att_stmt = select(func.count()).select_from(AttendanceRecord).where(AttendanceRecord.student_id == student_id)
        total_att = (await session.execute(total_att_stmt)).scalar() or 0
        
        present_att_stmt = select(func.count()).select_from(AttendanceRecord).where(
            (AttendanceRecord.student_id == student_id) & (AttendanceRecord.status == "present")
        )
        present_att = (await session.execute(present_att_stmt)).scalar() or 0
        
        att_rate = (present_att / total_att) if total_att > 0 else 1.0

        response = StudentResponse.model_validate(student)
        response.attendance_rate = att_rate
        if latest_risk:
            response.latest_risk_score = latest_risk.score
            response.latest_risk_level = latest_risk.risk_level

        await cache_set(cache_key, response.model_dump(mode="json"), ttl=1800)
        return response

    @staticmethod
    async def get_student_risk_score(session: AsyncSession, student_id: UUID) -> RiskScoreResponse:
        stmt = (
            select(RiskScore)
            .where(RiskScore.student_id == student_id)
            .order_by(desc(RiskScore.calculated_at))
            .limit(1)
        )
        result = await session.execute(stmt)
        risk = result.scalar_one_or_none()

        if not risk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No risk score recorded for student '{student_id}'",
            )

        return RiskScoreResponse.model_validate(risk)

    @staticmethod
    async def get_student_risk_timeline(session: AsyncSession, student_id: UUID) -> List[RiskScoreResponse]:
        stmt = (
            select(RiskScore)
            .where(RiskScore.student_id == student_id)
            .order_by(desc(RiskScore.calculated_at))
            .limit(50)
        )
        result = await session.execute(stmt)
        scores = result.scalars().all()
        return [RiskScoreResponse.model_validate(s) for s in scores]

    @staticmethod
    async def override_student_risk(
        session: AsyncSession,
        student_id: UUID,
        override_in: StudentOverrideRequest
    ) -> RiskScoreResponse:
        # Check student exists
        student_stmt = select(Student).where(Student.id == student_id)
        student = (await session.execute(student_stmt)).scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        override_score = RiskScore(
            student_id=student_id,
            score=override_in.score,
            risk_level=override_in.risk_level.lower(),
            contributing_factors={"override": True, "reason": override_in.reason},
            model_version="manual_override_v1",
            is_overridden=True,
            override_reason=override_in.reason
        )

        session.add(override_score)
        await session.commit()
        await session.refresh(override_score)

        await invalidate_student_cache(str(student_id))

        return RiskScoreResponse.model_validate(override_score)

    @staticmethod
    async def log_counselling_session(
        session: AsyncSession,
        student_id: UUID,
        counsellor_id: UUID,
        session_in: CounsellingSessionCreate
    ) -> CounsellingSessionResponse:
        from datetime import date
        new_session = CounsellingSession(
            student_id=student_id,
            counsellor_id=counsellor_id,
            session_date=session_in.session_date or date.today(),
            notes=session_in.notes,
            outcome=session_in.outcome,
            follow_up_date=session_in.follow_up_date
        )

        session.add(new_session)
        await session.commit()
        await session.refresh(new_session)

        return CounsellingSessionResponse.model_validate(new_session)
