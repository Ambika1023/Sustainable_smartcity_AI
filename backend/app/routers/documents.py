import os
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_city_admin_or_above
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.schemas.common import PaginatedResponse
import app.services.document_service as doc_service
from app.services.audit_service import log_action

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
def list_documents(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return doc_service.get_documents(db, page, per_page, category, search)


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    if file.content_type not in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
    doc = await doc_service.upload_document(db, contents, file.filename, file.content_type, title, category, description, current_user)
    log_action(db, str(current_user.id), "UPLOAD_DOCUMENT", "Document", str(doc.id), {"title": title})
    return DocumentResponse.model_validate(doc)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return DocumentResponse.model_validate(doc_service.get_document(db, doc_id))


@router.get("/{doc_id}/download")
def download_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    doc = doc_service.get_document(db, doc_id)
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(
        path=doc.file_path,
        filename=doc.file_name,
        media_type="application/octet-stream",
    )


@router.post("/{doc_id}/summarize")
async def summarize_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Summarize document using Intelligent Extractive NLP or IBM Granite if configured."""
    from app.services.granite_ai_service import granite_service
    from app.services.document_summarizer import extract_text_from_file, summarize_text

    doc = doc_service.get_document(db, doc_id)
    text_content = extract_text_from_file(doc.file_path)
    
    # If IBM Granite credentials are provided, use Watsonx cloud
    if granite_service.is_configured:
        res = await granite_service.summarize_document(text_content or f"{doc.title}: {doc.description}")
        if res.get("status") == "SUCCESS":
            doc.ai_summary = res.get("summary")
            doc.ai_summary_status = "COMPLETED"
            db.commit()
            return res

    # Fast intelligent NLP summarizer
    summary_data = summarize_text(
        text=text_content,
        title=doc.title,
        category=doc.category.value if hasattr(doc.category, 'value') else str(doc.category),
        description=doc.description or ""
    )

    doc.ai_summary = summary_data["executive_summary"]
    doc.ai_summary_status = "COMPLETED"
    db.commit()
    db.refresh(doc)

    return {
        "status": "SUCCESS",
        "document_id": str(doc.id),
        "title": doc.title,
        "summary": summary_data["executive_summary"],
        "key_highlights": summary_data["key_highlights"],
        "model": summary_data["model"],
        "word_count": summary_data["word_count"]
    }


@router.delete("/{doc_id}", status_code=200)
def delete_document(
    doc_id: UUID,
    current_user: User = Depends(get_city_admin_or_above),
    db: Session = Depends(get_db),
):
    doc_service.delete_document(db, doc_id)
    log_action(db, str(current_user.id), "DELETE_DOCUMENT", "Document", str(doc_id), {})
    return {"message": "Document deleted successfully"}

