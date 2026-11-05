import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User, UserRole
import uuid

@pytest.fixture
def mock_db():
    db = MagicMock()
    return db

@pytest.fixture
def client(mock_db):
    app.dependency_overrides[get_db] = lambda: mock_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def super_admin_user():
    return User(
        id=uuid.uuid4(),
        email="super_admin@smartcity.gov",
        full_name="Super Administrator",
        role=UserRole.SUPER_ADMIN,
        is_active=True,
    )

@pytest.fixture
def city_admin_user():
    return User(
        id=uuid.uuid4(),
        email="city_admin@smartcity.gov",
        full_name="City Administrator",
        role=UserRole.CITY_ADMIN,
        is_active=True,
    )

@pytest.fixture
def officer_user():
    return User(
        id=uuid.uuid4(),
        email="officer@smartcity.gov",
        full_name="Department Officer",
        role=UserRole.DEPARTMENT_OFFICER,
        department_id=uuid.uuid4(),
        is_active=True,
    )

@pytest.fixture
def analyst_user():
    return User(
        id=uuid.uuid4(),
        email="analyst@smartcity.gov",
        full_name="Data Analyst",
        role=UserRole.DATA_ANALYST,
        is_active=True,
    )

def create_auth_headers(user: User):
    token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    return {"Authorization": f"Bearer {token}"}

