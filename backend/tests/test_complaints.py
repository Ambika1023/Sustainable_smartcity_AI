import pytest
from unittest.mock import MagicMock
from app.core.dependencies import get_current_user, get_current_active_user
from app.main import app
from app.models.user import UserRole
import uuid

def test_complaint_priority_and_status_enums():
    from app.models.complaint import ComplaintCategory, ComplaintStatus, ComplaintPriority
    assert ComplaintStatus.SUBMITTED == "SUBMITTED"
    assert ComplaintStatus.RESOLVED == "RESOLVED"
    assert ComplaintPriority.HIGH == "HIGH"
    assert ComplaintPriority.CRITICAL == "CRITICAL"
    assert "Water Supply" in [c.value for c in ComplaintCategory]

def test_role_authorization_on_complaint_assignment(client, officer_user, mock_db):
    # Department officer cannot assign complaints (requires SUPER_ADMIN or CITY_ADMIN)
    app.dependency_overrides[get_current_user] = lambda: officer_user
    app.dependency_overrides[get_current_active_user] = lambda: officer_user

    cid = uuid.uuid4()
    did = uuid.uuid4()
    response = client.put(f"/api/complaints/{cid}/assign", json={
        "department_id": str(did)
    })
    assert response.status_code == 403
    app.dependency_overrides.clear()

