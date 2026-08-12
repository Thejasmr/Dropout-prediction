import pytest
from uuid import uuid4
from fastapi.testclient import TestClient

from main import app
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.utils.pagination import encode_cursor, decode_cursor


def test_health_check_endpoint():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_routes_registered():
    openapi_paths = list(app.openapi()["paths"].keys())

    assert "/api/v1/auth/login" in openapi_paths
    assert "/api/v1/auth/refresh" in openapi_paths
    assert "/api/v1/students" in openapi_paths
    assert "/api/v1/students/{student_id}" in openapi_paths
    assert "/api/v1/ingestion/upload" in openapi_paths
    assert "/api/v1/alerts" in openapi_paths
    assert "/api/v1/reports/summary" in openapi_paths
    assert "/api/v1/chatbot/query" in openapi_paths


def test_password_hashing():
    raw_pass = "SecurePass123!"
    hashed = get_password_hash(raw_pass)
    assert verify_password(raw_pass, hashed)
    assert not verify_password("WrongPassword", hashed)


def test_jwt_tokens():
    user_id = str(uuid4())
    data = {"sub": user_id, "role": "admin"}
    
    access_token = create_access_token(data)
    decoded_access = decode_token(access_token)
    assert decoded_access is not None
    assert decoded_access["sub"] == user_id
    assert decoded_access["role"] == "admin"
    assert decoded_access["type"] == "access"

    refresh_token = create_refresh_token(data)
    decoded_refresh = decode_token(refresh_token)
    assert decoded_refresh is not None
    assert decoded_refresh["sub"] == user_id
    assert decoded_refresh["type"] == "refresh"


def test_cursor_pagination():
    test_id = str(uuid4())
    encoded = encode_cursor(test_id)
    decoded = decode_cursor(encoded)
    assert decoded == test_id
