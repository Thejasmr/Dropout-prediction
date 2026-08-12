import asyncio
from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from app.models.fee import FeeRecord
from app.models.alert import Alert
from app.models.counselling_session import CounsellingSession
from app.models.risk_score import RiskScore
from app.models.user import User
from sqlalchemy import select, func

async def main():
    async with AsyncSessionLocal() as session:
        student_count = (await session.execute(select(func.count(Student.id)))).scalar()
        attendance_count = (await session.execute(select(func.count(AttendanceRecord.id)))).scalar()
        assessment_count = (await session.execute(select(func.count(AssessmentScore.id)))).scalar()
        fee_count = (await session.execute(select(func.count(FeeRecord.id)))).scalar()
        alert_count = (await session.execute(select(func.count(Alert.id)))).scalar()
        counsel_count = (await session.execute(select(func.count(CounsellingSession.id)))).scalar()
        risk_count = (await session.execute(select(func.count(RiskScore.id)))).scalar()
        user_count = (await session.execute(select(func.count(User.id)))).scalar()

        print("Current DB Counts:")
        print(f"- Users: {user_count}")
        print(f"- Students: {student_count}")
        print(f"- Attendance: {attendance_count}")
        print(f"- Assessments: {assessment_count}")
        print(f"- Fees: {fee_count}")
        print(f"- Alerts: {alert_count}")
        print(f"- Counselling Sessions: {counsel_count}")
        print(f"- Risk Scores: {risk_count}")

if __name__ == "__main__":
    asyncio.run(main())
