import io
import uuid
from datetime import date, datetime
from typing import Dict, Any, List
import pandas as pd
from fastapi import UploadFile, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from app.models.fee import FeeRecord


class IngestionService:

    @staticmethod
    async def parse_and_validate_file(file: UploadFile) -> pd.DataFrame:
        contents = await file.read()
        filename = file.filename or ""

        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(contents))
            elif filename.endswith((".xlsx", ".xls")):
                df = pd.read_excel(io.BytesIO(contents))
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Unsupported file extension. Only CSV and Excel files are allowed.",
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse file: {str(e)}",
            )

        return df

    @staticmethod
    async def ingest_students(session: AsyncSession, df: pd.DataFrame, field_mapping: Dict[str, str]) -> Dict[str, Any]:
        """
        Expects df columns mapped to student schema:
        enrollment_no, full_name, email, phone, guardian_phone, guardian_email, batch_year, current_semester
        """
        # Rename columns according to mapping if provided
        if field_mapping:
            df = df.rename(columns=field_mapping)

        required_cols = ["enrollment_no", "full_name"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required column '{col}' after applying field mapping.",
                )

        created_count = 0
        updated_count = 0

        for _, row in df.iterrows():
            enrollment_no = str(row["enrollment_no"]).strip()
            full_name = str(row["full_name"]).strip()

            if not enrollment_no or not full_name:
                continue

            stmt = select(Student).where(Student.enrollment_no == enrollment_no)
            existing = (await session.execute(stmt)).scalar_one_or_none()

            if existing:
                existing.full_name = full_name
                existing.email = str(row.get("email", "")) if pd.notna(row.get("email")) else existing.email
                existing.phone = str(row.get("phone", "")) if pd.notna(row.get("phone")) else existing.phone
                existing.guardian_phone = str(row.get("guardian_phone", "")) if pd.notna(row.get("guardian_phone")) else existing.guardian_phone
                existing.guardian_email = str(row.get("guardian_email", "")) if pd.notna(row.get("guardian_email")) else existing.guardian_email
                updated_count += 1
            else:
                new_student = Student(
                    enrollment_no=enrollment_no,
                    full_name=full_name,
                    email=str(row.get("email", "")) if pd.notna(row.get("email")) else None,
                    phone=str(row.get("phone", "")) if pd.notna(row.get("phone")) else None,
                    guardian_phone=str(row.get("guardian_phone", "")) if pd.notna(row.get("guardian_phone")) else None,
                    guardian_email=str(row.get("guardian_email", "")) if pd.notna(row.get("guardian_email")) else None,
                    batch_year=int(row["batch_year"]) if pd.notna(row.get("batch_year")) and str(row.get("batch_year")).isdigit() else None,
                    current_semester=int(row["current_semester"]) if pd.notna(row.get("current_semester")) and str(row.get("current_semester")).isdigit() else None,
                )
                session.add(new_student)
                created_count += 1

        await session.commit()

        return {
            "status": "success",
            "total_rows": len(df),
            "created": created_count,
            "updated": updated_count
        }

    @staticmethod
    async def ingest_attendance(session: AsyncSession, df: pd.DataFrame, field_mapping: Dict[str, str]) -> Dict[str, Any]:
        if field_mapping:
            df = df.rename(columns=field_mapping)

        required_cols = ["enrollment_no", "date", "subject_id", "status"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required column '{col}' after applying field mapping.",
                )

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for _, row in df.iterrows():
            enrollment_no = str(row["enrollment_no"]).strip()
            if not enrollment_no:
                skipped_count += 1
                continue

            # Fetch student ID
            stmt = select(Student.id).where(Student.enrollment_no == enrollment_no)
            student_id = (await session.execute(stmt)).scalar_one_or_none()
            if not student_id:
                skipped_count += 1
                continue

            try:
                # Parse date
                raw_date = row["date"]
                if isinstance(raw_date, (pd.Timestamp, date)):
                    parsed_date = raw_date if isinstance(raw_date, date) else raw_date.date()
                else:
                    parsed_date = pd.to_datetime(str(raw_date).strip()).date()

                # Parse subject_id UUID
                subj_id = uuid.UUID(str(row["subject_id"]).strip()) if not isinstance(row["subject_id"], uuid.UUID) else row["subject_id"]
                status_val = str(row["status"]).strip().lower()
            except Exception:
                skipped_count += 1
                continue

            # Check if record exists
            stmt = select(AttendanceRecord).where(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.date == parsed_date,
                AttendanceRecord.subject_id == subj_id
            )
            existing = (await session.execute(stmt)).scalar_one_or_none()

            if existing:
                existing.status = status_val
                updated_count += 1
            else:
                new_record = AttendanceRecord(
                    student_id=student_id,
                    date=parsed_date,
                    subject_id=subj_id,
                    status=status_val
                )
                session.add(new_record)
                created_count += 1

        await session.commit()

        return {
            "status": "success",
            "total_rows": len(df),
            "created": created_count,
            "updated": updated_count,
            "skipped": skipped_count
        }

    @staticmethod
    async def ingest_assessments(session: AsyncSession, df: pd.DataFrame, field_mapping: Dict[str, str]) -> Dict[str, Any]:
        if field_mapping:
            df = df.rename(columns=field_mapping)

        required_cols = ["enrollment_no", "subject_id", "assessment_type", "score", "max_score"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required column '{col}' after applying field mapping.",
                )

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for _, row in df.iterrows():
            enrollment_no = str(row["enrollment_no"]).strip()
            if not enrollment_no:
                skipped_count += 1
                continue

            # Fetch student ID
            stmt = select(Student.id).where(Student.enrollment_no == enrollment_no)
            student_id = (await session.execute(stmt)).scalar_one_or_none()
            if not student_id:
                skipped_count += 1
                continue

            try:
                # Parse UUID
                subj_id = uuid.UUID(str(row["subject_id"]).strip()) if not isinstance(row["subject_id"], uuid.UUID) else row["subject_id"]
                score_val = float(row["score"])
                max_score_val = float(row["max_score"])
                attempt_num = int(row.get("attempt_number", 1)) if pd.notna(row.get("attempt_number")) else 1
                
                raw_date = row.get("assessment_date")
                parsed_date = None
                if pd.notna(raw_date):
                    if isinstance(raw_date, (pd.Timestamp, date)):
                        parsed_date = raw_date if isinstance(raw_date, date) else raw_date.date()
                    else:
                        parsed_date = pd.to_datetime(str(raw_date).strip()).date()
            except Exception:
                skipped_count += 1
                continue

            # Check if record exists
            stmt = select(AssessmentScore).where(
                AssessmentScore.student_id == student_id,
                AssessmentScore.subject_id == subj_id,
                AssessmentScore.assessment_type == str(row["assessment_type"]).strip(),
                AssessmentScore.attempt_number == attempt_num
            )
            existing = (await session.execute(stmt)).scalar_one_or_none()

            if existing:
                existing.score = score_val
                existing.max_score = max_score_val
                existing.assessment_date = parsed_date
                updated_count += 1
            else:
                new_record = AssessmentScore(
                    student_id=student_id,
                    subject_id=subj_id,
                    assessment_type=str(row["assessment_type"]).strip(),
                    score=score_val,
                    max_score=max_score_val,
                    attempt_number=attempt_num,
                    assessment_date=parsed_date
                )
                session.add(new_record)
                created_count += 1

        await session.commit()

        return {
            "status": "success",
            "total_rows": len(df),
            "created": created_count,
            "updated": updated_count,
            "skipped": skipped_count
        }

    @staticmethod
    async def ingest_fees(session: AsyncSession, df: pd.DataFrame, field_mapping: Dict[str, str]) -> Dict[str, Any]:
        import decimal
        if field_mapping:
            df = df.rename(columns=field_mapping)

        required_cols = ["enrollment_no", "semester", "amount_due", "due_date", "status"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required column '{col}' after applying field mapping.",
                )

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for _, row in df.iterrows():
            enrollment_no = str(row["enrollment_no"]).strip()
            if not enrollment_no:
                skipped_count += 1
                continue

            # Fetch student ID
            stmt = select(Student.id).where(Student.enrollment_no == enrollment_no)
            student_id = (await session.execute(stmt)).scalar_one_or_none()
            if not student_id:
                skipped_count += 1
                continue

            try:
                sem = int(row["semester"])
                amt_due = decimal.Decimal(str(row["amount_due"]).strip())
                amt_paid = decimal.Decimal(str(row.get("amount_paid", "0.00")).strip()) if pd.notna(row.get("amount_paid")) else decimal.Decimal("0.00")
                
                # Parse dates
                raw_due = row["due_date"]
                if isinstance(raw_due, (pd.Timestamp, date)):
                    due_d = raw_due if isinstance(raw_due, date) else raw_due.date()
                else:
                    due_d = pd.to_datetime(str(raw_due).strip()).date()

                raw_paid = row.get("paid_date")
                paid_d = None
                if pd.notna(raw_paid):
                    if isinstance(raw_paid, (pd.Timestamp, date)):
                        paid_d = raw_paid if isinstance(raw_paid, date) else raw_paid.date()
                    else:
                        paid_d = pd.to_datetime(str(raw_paid).strip()).date()

                status_val = str(row["status"]).strip().lower()
            except Exception:
                skipped_count += 1
                continue

            # Check if record exists
            stmt = select(FeeRecord).where(
                FeeRecord.student_id == student_id,
                FeeRecord.semester == sem
            )
            existing = (await session.execute(stmt)).scalar_one_or_none()

            if existing:
                existing.amount_due = amt_due
                existing.amount_paid = amt_paid
                existing.due_date = due_d
                existing.paid_date = paid_d
                existing.status = status_val
                updated_count += 1
            else:
                new_record = FeeRecord(
                    student_id=student_id,
                    semester=sem,
                    amount_due=amt_due,
                    amount_paid=amt_paid,
                    due_date=due_d,
                    paid_date=paid_d,
                    status=status_val
                )
                session.add(new_record)
                created_count += 1

        await session.commit()

        return {
            "status": "success",
            "total_rows": len(df),
            "created": created_count,
            "updated": updated_count,
            "skipped": skipped_count
        }
