import asyncio
import os
import sys
sys.path.append(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")
os.chdir(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")

from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        # Find student Rohan Mehta (EP2025003)
        stmt = select(Student).where(Student.enrollment_no == "EP2025003")
        student = (await session.execute(stmt)).scalar_one_or_none()
        if not student:
            print("Student Rohan Mehta not found!")
            return
            
        print(f"Modifying records for {student.full_name} ({student.enrollment_no})...")
        
        # 1. Update attendance to ~35.7% and consecutive absences to 3
        att_stmt = select(AttendanceRecord).where(AttendanceRecord.student_id == student.id)
        att_records = (await session.execute(att_stmt)).scalars().all()
        print(f"Found {len(att_records)} attendance records.")
        
        # Sort by date to apply consecutive absences at the end
        att_records.sort(key=lambda r: r.date)
        n = len(att_records)
        for idx, rec in enumerate(att_records):
            if idx >= n - 3:
                # Last 3 records are absent
                rec.status = "absent"
            else:
                # Out of the first 11, let's make 5 present and 6 absent
                if idx in [0, 2, 4, 6, 8]:
                    rec.status = "present"
                else:
                    rec.status = "absent"
                
        # 2. Update test scores to average 40%
        ass_stmt = select(AssessmentScore).where(AssessmentScore.student_id == student.id)
        ass_records = (await session.execute(ass_stmt)).scalars().all()
        print(f"Found {len(ass_records)} assessment records.")
        for rec in ass_records:
            rec.score = rec.max_score * 0.40
            
        await session.commit()
        print("Successfully updated database records to medium risk parameters.")

if __name__ == "__main__":
    asyncio.run(main())
