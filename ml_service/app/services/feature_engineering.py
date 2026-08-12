import numpy as np
import pandas as pd
from typing import Dict, Any, List


def calculate_attendance_rate(present_days: int, total_days: int) -> float:
    if total_days <= 0:
        return 100.0
    return round((present_days / total_days) * 100.0, 2)


def calculate_score_trend(recent_scores: List[float]) -> float:
    if not recent_scores or len(recent_scores) < 2:
        return 0.0
    # Linear regression slope or delta
    x = np.arange(len(recent_scores))
    y = np.array(recent_scores)
    slope, _ = np.polyfit(x, y, 1)
    return round(float(slope), 2)


def calculate_composite_risk_score(
    attendance_rate: float,
    consecutive_absences: int,
    avg_test_score: float,
    score_trend: float,
    attempt_ratio: float,
    fee_delay_days: int,
    assignment_submission_rate: float
) -> float:
    """
    Weighted rule-based risk score formula (0-100 scale):
    - Attendance Risk (35%)
    - Academic Score Risk (25%)
    - Attempt Count Risk (20%)
    - Fee Payment Delay (15%)
    - Assignment Submission (5%)
    """
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
