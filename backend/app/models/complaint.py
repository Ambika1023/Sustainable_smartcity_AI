import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, GUID


class ComplaintCategory(str, enum.Enum):
    WASTE_MANAGEMENT = "Waste Management"
    WATER_SUPPLY = "Water Supply"
    ELECTRICITY = "Electricity"
    ROAD_INFRASTRUCTURE = "Road Infrastructure"
    AIR_POLLUTION = "Air Pollution"
    DRAINAGE = "Drainage"
    TRAFFIC_MANAGEMENT = "Traffic Management"
    PUBLIC_SANITATION = "Public Sanitation"
    STREET_LIGHTING = "Street Lighting"
    OTHER = "Other"


class ComplaintStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class ComplaintPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    complaint_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    citizen_name: Mapped[str] = mapped_column(String(255), nullable=False)
    citizen_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    citizen_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[ComplaintCategory] = mapped_column(
        Enum(ComplaintCategory, name="complaintcategory"), nullable=False
    )
    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus, name="complaintstatus"),
        nullable=False,
        default=ComplaintStatus.SUBMITTED,
    )
    priority: Mapped[ComplaintPriority] = mapped_column(
        Enum(ComplaintPriority, name="complaintpriority"),
        nullable=False,
        default=ComplaintPriority.MEDIUM,
    )
    ward_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("wards.id", ondelete="RESTRICT"), nullable=False
    )
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True
    )
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    assigned_by_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    location_address: Mapped[str] = mapped_column(String(500), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    official_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    ward = relationship("Ward", foreign_keys=[ward_id])
    department = relationship("Department", back_populates="complaints", foreign_keys=[department_id])
    assigned_to = relationship("User", back_populates="complaints_assigned", foreign_keys=[assigned_to_id])
    assigned_by = relationship("User", back_populates="complaints_assigned_by", foreign_keys=[assigned_by_id])
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    complaint_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False
    )
    changed_by_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    old_status: Mapped[ComplaintStatus | None] = mapped_column(
        Enum(ComplaintStatus, name="complaintstatus"), nullable=True
    )
    new_status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus, name="complaintstatus"), nullable=False
    )
    remark: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    complaint = relationship("Complaint", back_populates="history")
    changed_by = relationship("User", back_populates="complaint_history", foreign_keys=[changed_by_id])
