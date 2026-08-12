import asyncio
from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from app.models.fee import FeeRecord
from sqlalchemy import func, select

async def main():
    async with AsyncSessionLocal() as session:
        student_count = (await session.execute(select(func.count(Student.id)))).scalar()
        attendance_count = (await session.execute(select(func.count(AttendanceRecord.id)))).scalar()
        assessment_count = (await session.execute(select(func.count(AssessmentScore.id)))).scalar()
        fee_count = (await session.execute(select(func.count(FeeRecord.id)))).scalar()
        
        print("Database counts:")
        print(f"- Students: {student_count}")
        print(f"- Attendance Records: {attendance_count}")
        print(f"- Assessment Scores: {assessment_count}")
        print(f"- Fee Records: {fee_count}")

if __name__ == "__main__":
    asyncio.run(main())
