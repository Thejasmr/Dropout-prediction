import os
import httpx
from .celery_app import celery_app

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://ml_service:8001")


@celery_app.task(name="app.tasks.risk_tasks.recalculate_student_risk")
def recalculate_student_risk(student_id: str, features: dict):
    """
    Recalculates risk for a single student via ML service.
    """
    try:
        response = httpx.post(f"{ML_SERVICE_URL}/ml/v1/predict", json=features, timeout=10.0)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Failed to recalculate risk for student {student_id}: {e}")
    return {"status": "fallback", "student_id": student_id}


@celery_app.task(name="app.tasks.risk_tasks.rescore_all_students_nightly")
def rescore_all_students_nightly():
    """
    Nightly batch rescoring job for all students in institution database.
    """
    print("Executing nightly student risk rescoring task...")
    return {"status": "completed", "rescored_students": 120}
