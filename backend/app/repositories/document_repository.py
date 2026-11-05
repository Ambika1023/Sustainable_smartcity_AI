from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentCategory
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self):
        super().__init__(Document)

    def get_filtered(self, db: Session, category: Optional[str] = None, search: Optional[str] = None, active_only: bool = True):
        stmt = select(Document)
        if active_only:
            stmt = stmt.where(Document.is_active == True)
        if category:
            stmt = stmt.where(Document.category == category)
        if search:
            term = f"%{search}%"
            from sqlalchemy import or_
            stmt = stmt.where(
                or_(Document.title.ilike(term), Document.description.ilike(term))
            )
        stmt = stmt.order_by(Document.created_at.desc())
        return stmt


document_repository = DocumentRepository()
