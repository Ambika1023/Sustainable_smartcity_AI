import pytest
from unittest.mock import patch, MagicMock
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.user import User, UserRole
from tests.conftest import create_auth_headers
import uuid

def test_password_hashing():
    raw_pwd = "SecurePassword@123"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    user_id = str(uuid.uuid4())
    token = create_access_token(
        data={"sub": user_id, "email": "test@smartcity.gov", "role": "SUPER_ADMIN"}
    )
    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert payload["email"] == "test@smartcity.gov"
    assert payload["role"] == "SUPER_ADMIN"

def test_unauthenticated_access_denied(client):
    response = client.get("/api/complaints")
    assert response.status_code == 401

def test_login_invalid_credentials(client, mock_db):
    mock_db.execute.return_value.scalar_one_or_none.return_value = None
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@smartcity.gov",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

