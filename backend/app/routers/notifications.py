from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
import app.services.notification_service as notif_service

router = APIRouter()


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    is_read: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return notif_service.get_notifications(db, current_user, is_read, page, per_page)


@router.get("/unread-count")
def unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    count = notif_service.get_unread_count(db, current_user)
    return {"unread_count": count}


@router.put("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    notif_service.mark_all_read(db, current_user)
    return {"message": "All notifications marked as read"}


@router.put("/{notif_id}/read")
def mark_read(
    notif_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    notif_service.mark_read(db, notif_id, current_user)
    return {"message": "Notification marked as read"}

