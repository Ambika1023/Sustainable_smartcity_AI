import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, String, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base, GUID


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    CITY_ADMIN = "CITY_ADMIN"
    DEPARTMENT_OFFICER = "DEPARTMENT_OFFICER"
    DATA_ANALYST = "DATA_ANALYST"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole"), nullable=False, default=UserRole.DEPARTMENT_OFFICER
    )
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_first_login: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    department = relationship("Department", back_populates="officers", foreign_keys=[department_id])
    complaints_assigned = relationship(
        "Complaint", back_populates="assigned_to", foreign_keys="Complaint.assigned_to_id"
    )
    complaints_assigned_by = relationship(
        "Complaint", back_populates="assigned_by", foreign_keys="Complaint.assigned_by_id"
    )
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    complaint_history = relationship("ComplaintHistory", back_populates="changed_by", foreign_keys="ComplaintHistory.changed_by_id")
    documents_uploaded = relationship("Document", back_populates="uploaded_by", foreign_keys="Document.uploaded_by_id")
    anomalies_investigated = relationship("Anomaly", back_populates="investigated_by", foreign_keys="Anomaly.investigated_by_id")
    recommendations_reviewed = relationship("SustainabilityRecommendation", back_populates="reviewed_by", foreign_keys="SustainabilityRecommendation.reviewed_by_id")
