from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertUpdate


class NotificationService:

    @staticmethod
    async def get_alerts(
        session: AsyncSession,
        severity: Optional[str] = None,
        is_read: Optional[bool] = None,
        limit: int = 50
    ) -> List[AlertResponse]:
        query = select(Alert)
        if severity:
            query = query.where(Alert.severity == severity.lower())
        if is_read is not None:
            query = query.where(Alert.is_read == is_read)

        query = query.order_by(desc(Alert.created_at)).limit(limit)
        result = await session.execute(query)
        alerts = result.scalars().all()

        return [AlertResponse.model_validate(a) for a in alerts]

    @staticmethod
    async def mark_alert_as_read(
        session: AsyncSession,
        alert_id: UUID,
        update_in: AlertUpdate
    ) -> AlertResponse:
        stmt = select(Alert).where(Alert.id == alert_id)
        alert = (await session.execute(stmt)).scalar_one_or_none()

        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert with ID '{alert_id}' not found",
            )

        alert.is_read = update_in.is_read
        await session.commit()
        await session.refresh(alert)

        return AlertResponse.model_validate(alert)
