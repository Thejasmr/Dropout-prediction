import asyncio
import os
import sys
sys.path.append(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")
os.chdir(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")

from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.risk_score import RiskScore
from sqlalchemy import select, desc, func

async def main():
    async with AsyncSessionLocal() as session:
        # Get count of students
        total_students = (await session.execute(select(func.count(Student.id)))).scalar() or 0
        print(f"Total students in DB: {total_students}")

        # Get latest risk score per student
        subq = (
            select(
                RiskScore.id.label("risk_id"),
                RiskScore.student_id,
                RiskScore.score,
                RiskScore.risk_level,
                RiskScore.model_version,
                RiskScore.contributing_factors,
                func.row_number().over(
                    partition_by=RiskScore.student_id,
                    order_by=desc(RiskScore.calculated_at)
                ).label("rn")
            ).subquery()
        )

        stmt = select(
            Student.enrollment_no,
            Student.full_name,
            subq.c.score,
            subq.c.risk_level,
            subq.c.model_version,
            subq.c.contributing_factors
        ).outerjoin(
            subq, (Student.id == subq.c.student_id) & (subq.c.rn == 1)
        )

        results = (await session.execute(stmt)).all()
        print(f"Joined results count: {len(results)}")
        for idx, (enroll, name, score, level, model_ver, factors) in enumerate(results):
            features_str = ""
            if factors and "features" in factors:
                f = factors["features"]
                features_str = f"Att: {f.get('attendance_rate')}% | Abs: {f.get('consecutive_absences')} | Score: {f.get('avg_test_score')}% | Delay: {f.get('fee_delay_days')}d"
            print(f"{idx+1:02d}. {enroll} | {name[:12]:<12} | Score: {score:<5} | Level: {level:<6} | {features_str}")

if __name__ == "__main__":
    asyncio.run(main())
