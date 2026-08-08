import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Context-managed test client that triggers FastAPI lifespan events (DB connection)."""
    with TestClient(app) as c:
        yield c


def test_root_endpoint(client):
    """Verify that root endpoint is alive and returns correct details."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "InfraControl API"


def test_auth_login_validation(client):
    """Verify login validation works on incorrect schemas."""
    response = client.post("/api/auth/login", json={"email": "not-an-email", "password": "short"})
    assert response.status_code == 422


def test_password_recovery_flow_validation(client):
    """Verify password recovery request validates schema inputs."""
    response = client.post("/api/auth/forgot-password", json={"email": "nonexistent@infracontrol.com"})
    # Since email doesn't exist, it should return 404
    assert response.status_code == 404


def test_assets_permissions_validation(client):
    """Verify listing assets requires authentication header."""
    response = client.get("/api/assets")
    assert response.status_code == 401


def test_maintenance_schema_validation(client):
    """Verify maintenance creation requires valid payload fields."""
    response = client.post("/api/maintenance", json={"title": "Test Maintenance"})
    assert response.status_code in [401, 422]


def test_ai_predictions_unauthenticated(client):
    """Verify AI predictive endpoints are protected."""
    response = client.get("/api/ai/predictive/some_id")
    assert response.status_code == 401


def test_audit_logs_unauthenticated(client):
    """Verify audit logs route requires admin level validation."""
    response = client.get("/api/audit")
    assert response.status_code == 401
