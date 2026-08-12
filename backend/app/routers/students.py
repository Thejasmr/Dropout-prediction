from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.student import StudentResponse, StudentListResponse, StudentOverrideRequest
from app.schemas.risk_score import RiskScoreResponse
from app.schemas.counselling import CounsellingSessionCreate, CounsellingSessionResponse
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=StudentListResponse)
async def list_students(
    limit: int = Query(20, ge=1, le=100),
    cursor: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await StudentService.get_students_paginated(
        session=session,
        limit=limit,
        cursor=cursor,
        search=search,
        risk_level=risk_level
    )


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await StudentService.get_student_by_id(session, student_id)


@router.get("/{student_id}/risk", response_model=RiskScoreResponse)
async def get_student_risk(
    student_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await StudentService.get_student_risk_score(session, student_id)


@router.get("/{student_id}/timeline", response_model=List[RiskScoreResponse])
async def get_student_timeline(
    student_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await StudentService.get_student_risk_timeline(session, student_id)


@router.post("/{student_id}/override", response_model=RiskScoreResponse)
async def override_student_risk(
    student_id: UUID,
    override_in: StudentOverrideRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await StudentService.override_student_risk(session, student_id, override_in)


@router.post("/{student_id}/counselling", response_model=CounsellingSessionResponse, status_code=status.HTTP_201_CREATED)
async def log_counselling_session(
    student_id: UUID,
    counselling_in: CounsellingSessionCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await StudentService.log_counselling_session(
        session=session,
        student_id=student_id,
        counsellor_id=current_user.id,
        session_in=counselling_in
    )
