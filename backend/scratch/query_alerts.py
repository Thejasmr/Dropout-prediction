import asyncio
import os
import sys
sys.path.append(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")
os.chdir(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")

from app.core.database import AsyncSessionLocal
from app.models.alert import Alert
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Alert))
        alerts = result.scalars().all()
        print(f"Total alerts in DB: {len(alerts)}")
        for idx, a in enumerate(alerts):
            print(f"{idx+1}. Student ID: {a.student_id} | Type: {a.alert_type} | Message: {a.message} | Severity: {a.severity} | Is Read: {a.is_read}")

if __name__ == "__main__":
    asyncio.run(main())
