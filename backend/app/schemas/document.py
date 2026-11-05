import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.document import DocumentCategory


class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: DocumentCategory


class DocumentResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    category: DocumentCategory
    file_name: str
    file_size: int
    file_type: str
    uploaded_by_id: uuid.UUID
    is_active: bool
    ai_summary: Optional[str] = None
    ai_summary_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
