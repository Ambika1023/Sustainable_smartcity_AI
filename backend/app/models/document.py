import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, GUID


class DocumentCategory(str, enum.Enum):
    SUSTAINABILITY_POLICIES = "Sustainability Policies"
    ENVIRONMENTAL_REPORTS = "Environmental Reports"
    GOVERNMENT_SCHEMES = "Government Schemes"
    MUNICIPAL_REPORTS = "Municipal Reports"
    INFRASTRUCTURE_DEVELOPMENT = "Infrastructure Development"
    WATER_MANAGEMENT = "Water Management"
    WASTE_MANAGEMENT = "Waste Management"


class Document(Base):
    __tablename__ = "government_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[DocumentCategory] = mapped_column(
        Enum(DocumentCategory, name="documentcategory"), nullable=False
    )
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_summary_status: Mapped[str] = mapped_column(String(50), default="NOT_CONFIGURED", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    uploaded_by = relationship("User", back_populates="documents_uploaded", foreign_keys=[uploaded_by_id])
