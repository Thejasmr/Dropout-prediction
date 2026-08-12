from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.report import ReportSummaryResponse, CohortReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary", response_model=ReportSummaryResponse)
async def get_report_summary(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await ReportService.get_summary_report(session)


@router.get("/cohort", response_model=CohortReportResponse)
async def get_cohort_report(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    return await ReportService.get_cohort_report(session)


@router.get("/export")
async def export_report(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    csv_content = await ReportService.generate_csv_report(session)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="student_risk_report.csv"'}
    )
