import io
import os
import uuid
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document, DocumentCategory
from app.schemas.common import PaginatedResponse
import math


async def upload_document(
    db: Session,
    contents: bytes,
    filename: str,
    content_type: str,
    title: str,
    category: str,
    description: Optional[str],
    user,
) -> Document:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"

    # Auto-summarize upon upload
    ai_summary = None
    ai_status = "PENDING"
    try:
        from app.services.document_summarizer import extract_text_from_file, summarize_text
        text = extract_text_from_file(file_path)
        summary_result = summarize_text(text=text, title=title, category=category, description=description or "")
        ai_summary = summary_result.get("executive_summary")
        ai_status = "COMPLETED"
    except Exception as e:
        ai_summary = None
        ai_status = "FAILED"

    doc = Document(
        title=title,
        description=description,
        category=DocumentCategory(category),
        file_path=file_path,
        file_name=filename,
        file_size=len(contents),
        file_type=ext,
        uploaded_by_id=user.id,
        is_active=True,
        ai_summary=ai_summary,
        ai_summary_status=ai_status,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_documents(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None,
) -> PaginatedResponse:
    from app.schemas.document import DocumentResponse
    stmt = select(Document).where(Document.is_active == True)
    if category:
        stmt = stmt.where(Document.category == category)
    if search:
        stmt = stmt.where(Document.title.ilike(f"%{search}%"))
    stmt = stmt.order_by(Document.created_at.desc())
    all_items = db.execute(stmt).scalars().all()
    total = len(all_items)
    start = (page - 1) * per_page
    items = all_items[start:start + per_page]
    return PaginatedResponse(
        items=[DocumentResponse.model_validate(d) for d in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total else 0,
    )


def get_document(db: Session, doc_id: UUID) -> Document:
    doc = db.execute(select(Document).where(Document.id == doc_id, Document.is_active == True)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


def delete_document(db: Session, doc_id: UUID):
    doc = get_document(db, doc_id)
    doc.is_active = False
    db.commit()
