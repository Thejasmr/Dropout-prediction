import asyncio
import json
import os
import pandas as pd
from datetime import datetime, timezone
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from app.models.fee import FeeRecord
from app.models.risk_score import RiskScore
from app.models.counselling_session import CounsellingSession
from app.models.alert import Alert
from app.services.ingestion_service import IngestionService

async def main():
    print("Starting database repopulation with sample data...")

    # 1. Read sample CSV files
    try:
        students_df = pd.read_csv("../sample_data/01_students.csv")
        attendance_df = pd.read_csv("../sample_data/02_attendance.csv")
        assessments_df = pd.read_csv("../sample_data/03_assessments.csv")
        fees_df = pd.read_csv("../sample_data/04_fees.csv")
    except Exception as e:
        print(f"Error reading CSV files: {e}")
        return

    print("Successfully read CSV files.")

    async with AsyncSessionLocal() as session:
        # 2. Clear old data from student-related tables
        print("Clearing old data from database tables...")
        await session.execute(delete(RiskScore))
        await session.execute(delete(CounsellingSession))
        await session.execute(delete(Alert))
        await session.execute(delete(AttendanceRecord))
        await session.execute(delete(AssessmentScore))
        await session.execute(delete(FeeRecord))
        await session.execute(delete(Student))
        await session.commit()
        print("Tables cleared.")

        # 3. Ingest Student Profiles
        print(f"Ingesting students from 01_students.csv ({len(students_df)} rows)...")
        students_res = await IngestionService.ingest_students(session, students_df, {})
        print(f"Students ingestion result: {students_res}")

        # 4. Ingest Attendance Logs
        print(f"Ingesting attendance records from 02_attendance.csv ({len(attendance_df)} rows)...")
        attendance_res = await IngestionService.ingest_attendance(session, attendance_df, {})
        print(f"Attendance ingestion result: {attendance_res}")

        # 5. Ingest Assessment Scores
        print(f"Ingesting assessment scores from 03_assessments.csv ({len(assessments_df)} rows)...")
        assessments_res = await IngestionService.ingest_assessments(session, assessments_df, {})
        print(f"Assessments ingestion result: {assessments_res}")

        # 6. Ingest Fee Status
        print(f"Ingesting fee records from 04_fees.csv ({len(fees_df)} rows)...")
        fees_res = await IngestionService.ingest_fees(session, fees_df, {})
        print(f"Fees ingestion result: {fees_res}")

        # Commit everything
        await session.commit()

    # 7. Write clean history to ingestion_history.json
    print("Writing updated history to backend/data/ingestion_history.json...")
    os.makedirs("data", exist_ok=True)
    
    # We set timestamps slightly staggered
    now = datetime.now(timezone.utc)
    history_data = [
        {
            "id": "1",
            "filename": "01_students.csv",
            "processed_records": len(students_df),
            "status": "completed",
            "uploaded_at": now.isoformat()
        },
        {
            "id": "2",
            "filename": "02_attendance.csv",
            "processed_records": len(attendance_df),
            "status": "completed",
            "uploaded_at": now.isoformat()
        },
        {
            "id": "3",
            "filename": "03_assessments.csv",
            "processed_records": len(assessments_df),
            "status": "completed",
            "uploaded_at": now.isoformat()
        },
        {
            "id": "4",
            "filename": "04_fees.csv",
            "processed_records": len(fees_df),
            "status": "completed",
            "uploaded_at": now.isoformat()
        }
    ]

    with open("data/ingestion_history.json", "w") as f:
        json.dump(history_data, f, indent=2)

    print("Ingestion history updated.")
    print("Database repopulation completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
