import pytest
from fastapi.testclient import TestClient

from ml_service.main import app
from ml_service.app.services.predictor import predictor_instance
from ml_service.app.services.explainer import explainer_instance


def test_ml_health_check():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "ml_service"
    assert response.json()["port"] == 8001


def test_predict_single_endpoint():
    client = TestClient(app)
    payload = {
        "student_id": "std-1001",
        "attendance_rate": 60.0,
        "consecutive_absences": 5,
        "score_trend": -4.2,
        "avg_test_score": 55.0,
        "attempt_ratio": 1.5,
        "fee_delay_days": 20,
        "assignment_submission_rate": 65.0
    }
    response = client.post("/ml/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == "std-1001"
    assert 0.0 <= data["score"] <= 100.0
    assert data["risk_level"] in ["high", "medium", "low"]
    assert "contributing_factors" in data
    assert len(data["contributing_factors"]) > 0


def test_predict_batch_endpoint():
    client = TestClient(app)
    payload = {
        "students": [
            {
                "student_id": "std-1",
                "attendance_rate": 95.0,
                "consecutive_absences": 0,
                "score_trend": 2.0,
                "avg_test_score": 88.0,
                "attempt_ratio": 1.0,
                "fee_delay_days": 0,
                "assignment_submission_rate": 95.0
            },
            {
                "student_id": "std-2",
                "attendance_rate": 20.0,
                "consecutive_absences": 12,
                "score_trend": -15.0,
                "avg_test_score": 25.0,
                "attempt_ratio": 3.0,
                "fee_delay_days": 60,
                "assignment_submission_rate": 10.0
            }
        ]
    }
    response = client.post("/ml/v1/predict/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 2
    assert data["predictions"][0]["risk_level"] == "low"
    assert data["predictions"][1]["risk_level"] in ["high", "medium"]


def test_explain_endpoint():
    client = TestClient(app)
    response = client.get("/ml/v1/explain/std-1001")
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == "std-1001"
    assert "top_contributing_factors" in data


def test_model_info_and_feature_importance():
    client = TestClient(app)
    info_resp = client.get("/ml/v1/model/info")
    assert info_resp.status_code == 200
    info_data = info_resp.json()
    assert info_data["version"] == "v1.0.0"
    assert "attendance_rate" in info_data["features"]

    importance_resp = client.get("/ml/v1/features/importance")
    assert importance_resp.status_code == 200
    importance_data = importance_resp.json()
    assert "feature_importance" in importance_data
    assert "attendance_rate" in importance_data["feature_importance"]


def test_celery_task_imports():
    from backend.app.tasks.risk_tasks import recalculate_student_risk, rescore_all_students_nightly
    from backend.app.tasks.notification_tasks import send_high_risk_alert, dispatch_weekly_digests

    assert recalculate_student_risk is not None
    assert rescore_all_students_nightly is not None
    assert send_high_risk_alert is not None
    assert dispatch_weekly_digests is not None
