import asyncio
from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from app.models.fee import FeeRecord
from sqlalchemy import select, func

async def main():
    async with AsyncSessionLocal() as session:
        # Check first 5 students
        res = await session.execute(select(Student).limit(5))
        students = res.scalars().all()
        print("First 5 students in DB:")
        for s in students:
            print(f"- ID: {s.id}, Enrollment: {s.enrollment_no}, Name: {s.full_name}, Email: {s.email}, Batch: {s.batch_year}, Sem: {s.current_semester}")

        # Check unique enrollment numbers in attendance
        att_res = await session.execute(select(Student.enrollment_no, func.count(AttendanceRecord.id)).join(AttendanceRecord).group_by(Student.enrollment_no).limit(5))
        print("\nAttendance records per student (first 5):")
        for enrollment_no, count in att_res.all():
            print(f"- {enrollment_no}: {count} records")

        # Check unique enrollment numbers in assessments
        ass_res = await session.execute(select(Student.enrollment_no, func.count(AssessmentScore.id)).join(AssessmentScore).group_by(Student.enrollment_no).limit(5))
        print("\nAssessment scores per student (first 5):")
        for enrollment_no, count in ass_res.all():
            print(f"- {enrollment_no}: {count} records")

        # Check unique enrollment numbers in fees
        fee_res = await session.execute(select(Student.enrollment_no, func.count(FeeRecord.id)).join(FeeRecord).group_by(Student.enrollment_no).limit(5))
        print("\nFee records per student (first 5):")
        for enrollment_no, count in fee_res.all():
            print(f"- {enrollment_no}: {count} records")

if __name__ == "__main__":
    asyncio.run(main())
