import pytest
from app.core.dependencies import get_current_user, get_current_active_user
from app.main import app
from app.models.user import UserRole
import uuid

def test_city_admin_cannot_create_super_admin(client, city_admin_user, mock_db):
    app.dependency_overrides[get_current_user] = lambda: city_admin_user
    app.dependency_overrides[get_current_active_user] = lambda: city_admin_user

    response = client.post("/api/users", json={
        "email": "newadmin@smartcity.gov",
        "full_name": "New Admin",
        "role": "SUPER_ADMIN",
        "password": "Password@123"
    })
    # City admin is denied super admin creation
    assert response.status_code in [403]
    app.dependency_overrides.clear()

def test_data_analyst_cannot_create_user(client, analyst_user, mock_db):
    app.dependency_overrides[get_current_user] = lambda: analyst_user
    app.dependency_overrides[get_current_active_user] = lambda: analyst_user

    response = client.post("/api/users", json={
        "email": "officer2@smartcity.gov",
        "full_name": "Officer 2",
        "role": "DEPARTMENT_OFFICER",
        "password": "Password@123"
    })
    assert response.status_code == 403
    app.dependency_overrides.clear()

