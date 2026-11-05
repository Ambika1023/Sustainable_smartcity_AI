import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class EnvironmentalDataBase(BaseModel):
    ward_id: Optional[uuid.UUID] = None
    recorded_date: date
    water_consumption_liters: float
    electricity_consumption_kwh: float
    waste_generation_kg: float
    air_quality_index: float
    traffic_congestion_index: float
    green_coverage_percent: float


class EnvironmentalDataResponse(EnvironmentalDataBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsSummaryResponse(BaseModel):
    total_complaints: int
    resolved_complaints: int
    pending_complaints: int
    high_priority_complaints: int
    sustainability_score: float
    avg_air_quality: float
    avg_water_consumption: float
    avg_electricity_consumption: float
    avg_waste_generation: float
    active_anomalies: int
    total_departments: int
    total_wards: int


class DepartmentPerformanceResponse(BaseModel):
    department_id: uuid.UUID
    department_name: str
    total_assigned: int
    resolved: int
    pending: int
    resolution_rate: float
    avg_resolution_days: float


class WardDistributionResponse(BaseModel):
    ward_id: uuid.UUID
    ward_name: str
    ward_number: int
    complaint_count: int


class ComplaintTrendResponse(BaseModel):
    date: str
    total: int
    resolved: int
    new: int
