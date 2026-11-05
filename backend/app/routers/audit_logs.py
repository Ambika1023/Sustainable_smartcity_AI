from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_super_admin
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse
from app.schemas.common import PaginatedResponse
import app.services.audit_service as audit_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    action: str = None,
    current_user: User = Depends(get_super_admin),
    db: Session = Depends(get_db),
):
    return audit_service.get_audit_logs(db, page, per_page, action)

