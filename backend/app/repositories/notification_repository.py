from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self):
        super().__init__(Notification)

    def get_for_user(self, db: Session, user_id: UUID, is_read: Optional[bool] = None):
        stmt = select(Notification).where(Notification.user_id == user_id)
        if is_read is not None:
            stmt = stmt.where(Notification.is_read == is_read)
        stmt = stmt.order_by(Notification.created_at.desc())
        return stmt

    def get_unread_count(self, db: Session, user_id: UUID) -> int:
        from sqlalchemy import func
        stmt = select(func.count()).select_from(Notification).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
        return db.execute(stmt).scalar_one()

    def mark_all_read(self, db: Session, user_id: UUID) -> None:
        from sqlalchemy import update
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        db.execute(stmt)
        db.commit()


notification_repository = NotificationRepository()
