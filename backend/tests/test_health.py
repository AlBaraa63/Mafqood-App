"""
Tests for health check endpoint.
"""

from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """
    Test GET /health returns 200 with correct structure.
    """
    response = client.get("/health")
    
    assert response.status_code == 200
    
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"
    assert "version" in data
    assert "timestamp" in data


def test_root_endpoint(client: TestClient):
    """
    Test GET / returns API information.
    """
    response = client.get("/")
    
    assert response.status_code == 200
    
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert "description" in data
    assert "endpoints" in data
    
    endpoints = data["endpoints"]
    assert "docs" in endpoints
    assert "health" in endpoints
