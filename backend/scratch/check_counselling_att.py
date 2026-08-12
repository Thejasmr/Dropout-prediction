import asyncio
from uuid import UUID
from app.core.database import AsyncSessionLocal
from app.models.attendance import AttendanceRecord
from sqlalchemy import select, func

async def check():
    student_id = UUID("04ab00b0-a192-4990-b175-3922f4fa836a")
    async with AsyncSessionLocal() as session:
        # Count total
        tot = (await session.execute(select(func.count()).select_from(AttendanceRecord).where(AttendanceRecord.student_id == student_id))).scalar()
        # Count present
        pres = (await session.execute(select(func.count()).select_from(AttendanceRecord).where((AttendanceRecord.student_id == student_id) & (AttendanceRecord.status == "present")))).scalar()
        print(f"Total attendance records: {tot}, Present: {pres}")

if __name__ == "__main__":
    asyncio.run(check())
