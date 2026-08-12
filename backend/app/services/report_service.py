import io
import csv
from datetime import datetime
from typing import Dict, Any
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.models.risk_score import RiskScore
from app.models.attendance import AttendanceRecord
from app.models.fee import FeeRecord
from app.models.assessment import AssessmentScore
from app.schemas.report import ReportSummaryResponse, CohortReportResponse, CohortRiskItem


class ReportService:

    @staticmethod
    async def get_summary_report(session: AsyncSession) -> ReportSummaryResponse:
        # Total students
        total_students = (await session.execute(select(func.count(Student.id)))).scalar() or 0

        # Subquery for latest risk score per student
        subq = (
            select(
                RiskScore.student_id,
                RiskScore.risk_level,
                func.row_number().over(
                    partition_by=RiskScore.student_id,
                    order_by=desc(RiskScore.calculated_at)
                ).label("rn")
            ).subquery()
        )

        high_stmt = select(func.count()).where((subq.c.rn == 1) & (subq.c.risk_level == "high"))
        med_stmt = select(func.count()).where((subq.c.rn == 1) & (subq.c.risk_level == "medium"))
        low_stmt = select(func.count()).where((subq.c.rn == 1) & (subq.c.risk_level == "low"))

        high_count = (await session.execute(high_stmt)).scalar() or 0
        med_count = (await session.execute(med_stmt)).scalar() or 0
        low_count = (await session.execute(low_stmt)).scalar() or 0

        # Attendance rate calculation
        present_count = (await session.execute(select(func.count()).where(AttendanceRecord.status == "present"))).scalar() or 0
        total_attendance = (await session.execute(select(func.count()).select_from(AttendanceRecord))).scalar() or 0
        avg_attendance = (present_count / total_attendance * 100.0) if total_attendance > 0 else 0.0

        # Overdue fee count
        overdue_count = (await session.execute(select(func.count()).where(FeeRecord.status == "overdue"))).scalar() or 0

        # Fetch attendance records for monthly trend
        att_stmt = select(AttendanceRecord.date, AttendanceRecord.status)
        att_rows = (await session.execute(att_stmt)).all()
        
        monthly_att = {}
        for d, status in att_rows:
            if not d:
                continue
            month_key = d.strftime("%Y-%m")
            if month_key not in monthly_att:
                monthly_att[month_key] = {"total": 0, "present": 0}
            monthly_att[month_key]["total"] += 1
            if status == "present":
                monthly_att[month_key]["present"] += 1
                
        # Fetch assessment scores for monthly trend
        ass_stmt = select(AssessmentScore.assessment_date, AssessmentScore.score, AssessmentScore.max_score)
        ass_rows = (await session.execute(ass_stmt)).all()
        
        monthly_ass = {}
        for d, score, max_score in ass_rows:
            if not d or not max_score:
                continue
            month_key = d.strftime("%Y-%m")
            if month_key not in monthly_ass:
                monthly_ass[month_key] = []
            monthly_ass[month_key].append((score / max_score) * 100.0)
            
        # Merge trends
        all_months = sorted(list(set(monthly_att.keys()) | set(monthly_ass.keys())))
        recent_months = all_months[-6:]
        
        monthly_trend = []
        for m in recent_months:
            att_rate = 100.0
            if m in monthly_att:
                att_rate = (monthly_att[m]["present"] / monthly_att[m]["total"]) * 100.0
                
            avg_score = 75.0
            if m in monthly_ass:
                avg_score = sum(monthly_ass[m]) / len(monthly_ass[m])
                
            try:
                dt = datetime.strptime(m, "%Y-%m")
                month_name = dt.strftime("%b %Y")
            except Exception:
                month_name = m
                
            monthly_trend.append({
                "month": month_name,
                "attendance": round(att_rate, 2),
                "score": round(avg_score, 2)
            })

        return ReportSummaryResponse(
            total_students=total_students,
            high_risk_count=high_count,
            medium_risk_count=med_count,
            low_risk_count=low_count,
            average_attendance_rate=round(avg_attendance, 2),
            overdue_fee_count=overdue_count,
            monthly_trend=monthly_trend
        )

    @staticmethod
    async def get_cohort_report(session: AsyncSession) -> CohortReportResponse:
        subq = (
            select(
                RiskScore.student_id,
                RiskScore.score,
                RiskScore.risk_level,
                func.row_number().over(
                    partition_by=RiskScore.student_id,
                    order_by=desc(RiskScore.calculated_at)
                ).label("rn")
            ).subquery()
        )

        stmt = (
            select(
                Student.batch_year,
                Student.current_semester,
                subq.c.score,
                subq.c.risk_level
            )
            .outerjoin(subq, (Student.id == subq.c.student_id) & (subq.c.rn == 1))
        )
        results = (await session.execute(stmt)).all()

        cohort_groups = {}
        for batch_year, semester, score, risk_level in results:
            cohort_name = f"Batch {batch_year or 'N/A'} - Semester {semester or 'N/A'}"
            if cohort_name not in cohort_groups:
                cohort_groups[cohort_name] = {
                    "total": 0,
                    "high": 0,
                    "medium": 0,
                    "low": 0,
                    "scores": []
                }
            
            group = cohort_groups[cohort_name]
            group["total"] += 1
            
            level = risk_level or "low"
            if level == "high":
                group["high"] += 1
            elif level == "medium":
                group["medium"] += 1
            else:
                group["low"] += 1
                
            if score is not None:
                group["scores"].append(score)

        cohorts = []
        for name, data in cohort_groups.items():
            avg_score = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0.0
            cohorts.append(
                CohortRiskItem(
                    cohort_name=name,
                    total_students=data["total"],
                    high_risk_count=data["high"],
                    medium_risk_count=data["medium"],
                    low_risk_count=data["low"],
                    average_risk_score=round(avg_score, 2)
                )
            )

        cohorts.sort(key=lambda c: c.cohort_name)
        return CohortReportResponse(cohorts=cohorts)

    @staticmethod
    async def generate_csv_report(session: AsyncSession) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Enrollment No", "Full Name", "Email", "Batch Year", "Current Semester", "Risk Level", "Risk Score"])

        subq = (
            select(
                RiskScore.student_id,
                RiskScore.score,
                RiskScore.risk_level,
                func.row_number().over(
                    partition_by=RiskScore.student_id,
                    order_by=desc(RiskScore.calculated_at)
                ).label("rn")
            ).subquery()
        )

        query = (
            select(Student, subq.c.score, subq.c.risk_level)
            .outerjoin(subq, (Student.id == subq.c.student_id) & (subq.c.rn == 1))
        )

        rows = (await session.execute(query)).all()
        for student, score, risk_level in rows:
            writer.writerow([
                student.enrollment_no,
                student.full_name,
                student.email or "",
                student.batch_year or "",
                student.current_semester or "",
                risk_level or "N/A",
                score if score is not None else "N/A"
            ])

        return output.getvalue()
