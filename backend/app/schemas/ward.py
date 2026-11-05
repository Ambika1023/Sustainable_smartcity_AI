import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.ward import Ward


class WardBase(BaseModel):
    name: str
    ward_number: int
    area_sqkm: float = 0.0
    population: int = 0
    is_active: bool = True


class WardCreate(WardBase):
    pass


class WardUpdate(BaseModel):
    name: Optional[str] = None
    area_sqkm: Optional[float] = None
    population: Optional[int] = None
    is_active: Optional[bool] = None


class WardResponse(BaseModel):
    id: uuid.UUID
    name: str
    ward_number: int
    area_sqkm: float
    population: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
