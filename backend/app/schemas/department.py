import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DepartmentBase(BaseModel):
    name: str
    code: str
    description: str = ""
    head_officer_id: Optional[uuid.UUID] = None
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    head_officer_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    description: str
    head_officer_id: Optional[uuid.UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DepartmentStatsResponse(BaseModel):
    department_id: uuid.UUID
    department_name: str
    total_complaints: int
    resolved_complaints: int
    pending_complaints: int
    officer_count: int = 0
    resolution_rate: float
    avg_resolution_days: float = 0.0
