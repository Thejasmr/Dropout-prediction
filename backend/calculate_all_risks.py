import sys
import os
import asyncio
import httpx
from datetime import date, datetime
import numpy as np

# Add backend directory to sys.path
sys.path.append(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")
os.chdir(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")

from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.models.attendance import AttendanceRecord
from app.models.assessment import AssessmentScore
from app.models.fee import FeeRecord
from app.models.risk_score import RiskScore
from app.models.alert import Alert
from sqlalchemy import select, desc


def calculate_composite_risk_score(
    attendance_rate: float,
    consecutive_absences: int,
    avg_test_score: float,
    score_trend: float,
    attempt_ratio: float,
    fee_delay_days: int,
    assignment_submission_rate: float
) -> float:
    att_risk = max(0.0, 100.0 - attendance_rate)
    if consecutive_absences > 7:
        att_risk = min(100.0, att_risk + 20.0)

    score_risk = max(0.0, 100.0 - avg_test_score)
    if score_trend < -5.0:
        score_risk = min(100.0, score_risk + 15.0)

    attempt_risk = min(100.0, (attempt_ratio - 1.0) * 33.3)
    fee_risk = min(100.0, (fee_delay_days / 30.0) * 50.0)
    assign_risk = max(0.0, 100.0 - assignment_submission_rate)

    composite = (
        0.35 * att_risk +
        0.25 * score_risk +
        0.20 * attempt_risk +
        0.15 * fee_risk +
        0.05 * assign_risk
    )
    return round(float(composite), 2)


def classify_risk_level(score: float) -> str:
    if score >= 70.0:
        return "high"
    elif score >= 40.0:
        return "medium"
    return "low"


async def compute_student_features(session, student_id):
    # 1. Attendance
    att_stmt = select(AttendanceRecord).where(AttendanceRecord.student_id == student_id).order_by(AttendanceRecord.date.asc())
    att_records = (await session.execute(att_stmt)).scalars().all()
    
    total_days = len(att_records)
    present_days = sum(1 for r in att_records if r.status == "present")
    attendance_rate = (present_days / total_days * 100.0) if total_days > 0 else 100.0
    
    consecutive_absences = 0
    for r in reversed(att_records):
        if r.status == "absent":
            consecutive_absences += 1
        else:
            break
            
    # 2. Assessments
    ass_stmt = select(AssessmentScore).where(AssessmentScore.student_id == student_id).order_by(AssessmentScore.assessment_date.asc())
    ass_records = (await session.execute(ass_stmt)).scalars().all()
    
    recent_scores = []
    attempt_numbers = []
    for r in ass_records:
        if r.max_score > 0:
            percentage = (r.score / r.max_score) * 100.0
            recent_scores.append(percentage)
        attempt_numbers.append(r.attempt_number)
        
    avg_test_score = sum(recent_scores) / len(recent_scores) if recent_scores else 75.0
    
    if len(recent_scores) >= 2:
        try:
            x = np.arange(len(recent_scores))
            y = np.array(recent_scores)
            slope, _ = np.polyfit(x, y, 1)
            score_trend = float(slope)
        except Exception:
            score_trend = 0.0
    else:
        score_trend = 0.0
        
    attempt_ratio = sum(attempt_numbers) / len(attempt_numbers) if attempt_numbers else 1.0
    
    # 3. Fees
    fee_stmt = select(FeeRecord).where(FeeRecord.student_id == student_id)
    fee_records = (await session.execute(fee_stmt)).scalars().all()
    
    fee_delay_days = 0
    today = date.today()
    for r in fee_records:
        if r.status == "overdue":
            delay = (today - r.due_date).days
            if delay > fee_delay_days:
                fee_delay_days = delay
                
    # 4. Default assignment rate
    assignment_submission_rate = 100.0
    
    return {
        "attendance_rate": round(attendance_rate, 2),
        "consecutive_absences": consecutive_absences,
        "score_trend": round(score_trend, 2),
        "avg_test_score": round(avg_test_score, 2),
        "attempt_ratio": round(attempt_ratio, 2),
        "fee_delay_days": fee_delay_days,
        "assignment_submission_rate": assignment_submission_rate
    }


async def main():
    print("Connecting to database and fetching students...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Student))
        students = result.scalars().all()
        print(f"Found {len(students)} students. Computing risk scores...")
        
        computed_count = 0
        async with httpx.AsyncClient() as client:
            for s in students:
                features = await compute_student_features(session, s.id)
                features["student_id"] = str(s.id)
                
                score = 0.0
                risk_level = "low"
                factors = []
                
                # Try calling ML service
                try:
                    ml_url = os.getenv("ML_SERVICE_URL", "http://localhost:8001")
                    res = await client.post(f"{ml_url}/ml/v1/predict", json=features, timeout=2.0)
                    if res.status_code == 200:
                        data = res.json()
                        score = data["score"]
                        risk_level = data["risk_level"]
                        factors = data.get("contributing_factors", [])
                        model_ver = data.get("model_version", "ml_v1.0")
                    else:
                        raise Exception("ML service returned status " + str(res.status_code))
                except Exception as e:
                    # Fallback to local calculation
                    score = calculate_composite_risk_score(
                        attendance_rate=features["attendance_rate"],
                        consecutive_absences=features["consecutive_absences"],
                        avg_test_score=features["avg_test_score"],
                        score_trend=features["score_trend"],
                        attempt_ratio=features["attempt_ratio"],
                        fee_delay_days=features["fee_delay_days"],
                        assignment_submission_rate=features["assignment_submission_rate"]
                    )
                    risk_level = classify_risk_level(score)
                    factors = ["Local rule-based calculation fallback"]
                    model_ver = "fallback_rule_v1.0"
                
                # Check if there is already a risk score calculated today for this student
                # We can just write a new risk score record
                risk_score_rec = RiskScore(
                    student_id=s.id,
                    score=score,
                    risk_level=risk_level,
                    contributing_factors={"features": features, "factors": factors},
                    model_version=model_ver,
                    is_overridden=False
                )
                session.add(risk_score_rec)
                
                # Proactively create a system alert for high and medium risk students
                if risk_level in ["high", "medium"]:
                    severity_map = {"high": "critical", "medium": "warning"}
                    msg_map = {
                        "high": f"Student {s.full_name} is flagged at HIGH dropout risk (Score: {score}%). Immediate counselor intervention recommended.",
                        "medium": f"Student {s.full_name} is flagged at MEDIUM dropout risk (Score: {score}%). Mentor follow-up recommended."
                    }
                    
                    alert_rec = Alert(
                        student_id=s.id,
                        alert_type=f"{risk_level}_risk",
                        message=msg_map[risk_level],
                        severity=severity_map[risk_level],
                        is_read=False
                    )
                    session.add(alert_rec)
                    
                computed_count += 1
                
            await session.commit()
            print(f"Successfully calculated and saved risk scores for {computed_count} students!")


if __name__ == "__main__":
    asyncio.run(main())
