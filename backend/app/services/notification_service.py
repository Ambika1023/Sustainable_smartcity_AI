import math
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    user_id: UUID,
    title: str,
    message: str,
    notification_type: NotificationType,
    related_entity_id: Optional[UUID] = None,
    related_entity_type: Optional[str] = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_entity_id=related_entity_id,
        related_entity_type=related_entity_type,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_notifications(
    db: Session,
    user,
    is_read: Optional[bool] = None,
    page: int = 1,
    per_page: int = 30,
):
    from app.schemas.notification import NotificationResponse
    stmt = select(Notification).where(Notification.user_id == user.id)
    if is_read is not None:
        stmt = stmt.where(Notification.is_read == is_read)
    stmt = stmt.order_by(Notification.created_at.desc())
    all_items = db.execute(stmt).scalars().all()
    start = (page - 1) * per_page
    items = all_items[start:start + per_page]
    return [NotificationResponse.model_validate(n) for n in items]


def get_unread_count(db: Session, user) -> int:
    all_items = db.execute(
        select(Notification).where(Notification.user_id == user.id, Notification.is_read == False)
    ).scalars().all()
    return len(all_items)


def mark_read(db: Session, notif_id: UUID, user):
    notif = db.execute(
        select(Notification).where(Notification.id == notif_id, Notification.user_id == user.id)
    ).scalar_one_or_none()
    if notif:
        notif.is_read = True
        db.commit()


def mark_all_read(db: Session, user):
    notifs = db.execute(
        select(Notification).where(Notification.user_id == user.id, Notification.is_read == False)
    ).scalars().all()
    for n in notifs:
        n.is_read = True
    db.commit()
