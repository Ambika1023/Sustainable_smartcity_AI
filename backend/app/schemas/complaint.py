import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.complaint import ComplaintCategory, ComplaintStatus, ComplaintPriority


class ComplaintBase(BaseModel):
    citizen_name: str
    citizen_email: Optional[str] = None
    citizen_phone: Optional[str] = None
    title: str
    description: str
    category: ComplaintCategory
    priority: ComplaintPriority = ComplaintPriority.MEDIUM
    ward_id: uuid.UUID
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintAssign(BaseModel):
    department_id: uuid.UUID
    assigned_to_id: Optional[uuid.UUID] = None


class ComplaintStatusUpdate(BaseModel):
    new_status: ComplaintStatus
    remark: Optional[str] = None


class ComplaintRemarkUpdate(BaseModel):
    remark: str


class ComplaintResponse(BaseModel):
    id: uuid.UUID
    complaint_number: str
    citizen_name: str
    citizen_email: Optional[str] = None
    citizen_phone: Optional[str] = None
    title: str
    description: str
    category: ComplaintCategory
    status: ComplaintStatus
    priority: ComplaintPriority
    ward_id: uuid.UUID
    department_id: Optional[uuid.UUID] = None
    assigned_to_id: Optional[uuid.UUID] = None
    assigned_by_id: Optional[uuid.UUID] = None
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    resolved_at: Optional[datetime] = None
    official_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ComplaintHistoryResponse(BaseModel):
    id: uuid.UUID
    complaint_id: uuid.UUID
    changed_by_id: uuid.UUID
    old_status: Optional[ComplaintStatus] = None
    new_status: ComplaintStatus
    remark: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ComplaintStatsResponse(BaseModel):
    total: int
    submitted: int
    under_review: int
    assigned: int
    in_progress: int
    resolved: int
    rejected: int
    high_priority: int
    critical_priority: int
    avg_resolution_days: float
