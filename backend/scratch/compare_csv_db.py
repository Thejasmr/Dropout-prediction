import pandas as pd
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from app.models.fee import FeeRecord
from sqlalchemy import select

async def main():
    # Read sample CSVs
    students_df = pd.read_csv("../sample_data/01_students.csv")
    attendance_df = pd.read_csv("../sample_data/02_attendance.csv")
    assessments_df = pd.read_csv("../sample_data/03_assessments.csv")
    fees_df = pd.read_csv("../sample_data/04_fees.csv")

    csv_students = set(students_df["enrollment_no"].unique())
    csv_attendance = set(attendance_df["enrollment_no"].unique())
    csv_assessments = set(assessments_df["enrollment_no"].unique())
    csv_fees = set(fees_df["enrollment_no"].unique())

    print("CSV File Stats:")
    print(f"- 01_students.csv: {len(students_df)} rows, {len(csv_students)} unique students")
    print(f"- 02_attendance.csv: {len(attendance_df)} rows, {len(csv_attendance)} unique students")
    print(f"- 03_assessments.csv: {len(assessments_df)} rows, {len(csv_assessments)} unique students")
    print(f"- 04_fees.csv: {len(fees_df)} rows, {len(csv_fees)} unique students")

    async with AsyncSessionLocal() as session:
        # Get DB students
        db_students_res = await session.execute(select(Student.enrollment_no))
        db_students = set(db_students_res.scalars().all())

        print("\nDB Stats:")
        print(f"- Total Students in DB: {len(db_students)}")
        
        extra_in_db = db_students - csv_students
        print(f"- Students in DB but NOT in CSV: {extra_in_db}")

        missing_in_db = csv_students - db_students
        print(f"- Students in CSV but NOT in DB: {missing_in_db}")

        # Check if there are enrollment numbers in attendance CSV not in students CSV
        extra_att_students = csv_attendance - csv_students
        print(f"- Students in attendance CSV but NOT in students CSV: {extra_att_students}")

        # Check if there are enrollment numbers in assessments CSV not in students CSV
        extra_ass_students = csv_assessments - csv_students
        print(f"- Students in assessments CSV but NOT in students CSV: {extra_ass_students}")

        # Check if there are enrollment numbers in fees CSV not in students CSV
        extra_fee_students = csv_fees - csv_students
        print(f"- Students in fees CSV but NOT in students CSV: {extra_fee_students}")

if __name__ == "__main__":
    asyncio.run(main())
