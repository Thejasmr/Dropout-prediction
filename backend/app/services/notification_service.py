from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.student import Student
from app.schemas.alert import AlertResponse, AlertUpdate


class NotificationService:

    @staticmethod
    async def get_alerts(
        session: AsyncSession,
        severity: Optional[str] = None,
        is_read: Optional[bool] = None,
        limit: int = 50
    ) -> List[AlertResponse]:
        query = select(Alert, Student.full_name.label("student_name")).join(Student, Alert.student_id == Student.id)
        if severity:
            query = query.where(Alert.severity == severity.lower())
        if is_read is not None:
            query = query.where(Alert.is_read == is_read)

        query = query.order_by(desc(Alert.created_at)).limit(limit)
        result = await session.execute(query)
        rows = result.all()

        alerts_res = []
        for alert, student_name in rows:
            res = AlertResponse.model_validate(alert)
            res.student_name = student_name
            alerts_res.append(res)
        return alerts_res

    @staticmethod
    async def mark_alert_as_read(
        session: AsyncSession,
        alert_id: UUID,
        update_in: AlertUpdate
    ) -> AlertResponse:
        stmt = select(Alert, Student.full_name.label("student_name")).join(Student, Alert.student_id == Student.id).where(Alert.id == alert_id)
        res = (await session.execute(stmt)).one_or_none()

        if not res:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert with ID '{alert_id}' not found",
            )

        alert, student_name = res
        alert.is_read = update_in.is_read
        await session.commit()
        await session.refresh(alert)

        response = AlertResponse.model_validate(alert)
        response.student_name = student_name
        return response
