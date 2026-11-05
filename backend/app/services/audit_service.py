import math
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.schemas.common import PaginatedResponse


def log_action(
    db: Session,
    user_id: str,
    action: str,
    entity_type: str,
    entity_id: Optional[str],
    details: dict,
    ip_address: Optional[str] = None,
):
    log = AuditLog(
        user_id=UUID(user_id),
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(log)
    try:
        db.commit()
    except Exception:
        db.rollback()


def get_audit_logs(
    db: Session,
    page: int = 1,
    per_page: int = 50,
    action: Optional[str] = None,
) -> PaginatedResponse:
    from app.schemas.audit_log import AuditLogResponse
    stmt = select(AuditLog)
    if action:
        stmt = stmt.where(AuditLog.action == action)
    stmt = stmt.order_by(AuditLog.created_at.desc())
    all_items = db.execute(stmt).scalars().all()
    total = len(all_items)
    start = (page - 1) * per_page
    items = all_items[start:start + per_page]
    return PaginatedResponse(
        items=[AuditLogResponse.model_validate(a) for a in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total else 0,
    )

