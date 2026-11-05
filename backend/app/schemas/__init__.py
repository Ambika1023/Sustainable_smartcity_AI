from app.schemas.common import PaginatedResponse, SuccessResponse, ErrorResponse
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse, UserListResponse
from app.schemas.department import DepartmentBase, DepartmentCreate, DepartmentUpdate, DepartmentResponse, DepartmentStatsResponse
from app.schemas.ward import WardBase, WardCreate, WardUpdate, WardResponse
from app.schemas.complaint import (
    ComplaintBase, ComplaintCreate, ComplaintAssign, ComplaintStatusUpdate,
    ComplaintRemarkUpdate, ComplaintResponse, ComplaintHistoryResponse, ComplaintStatsResponse
)
from app.schemas.document import DocumentBase, DocumentResponse
from app.schemas.analytics import (
    EnvironmentalDataBase, EnvironmentalDataResponse, AnalyticsSummaryResponse,
    DepartmentPerformanceResponse, WardDistributionResponse, ComplaintTrendResponse
)
from app.schemas.prediction import PredictionResponse, PredictionResultResponse, ModelInfoResponse
from app.schemas.anomaly import AnomalyBase, AnomalyStatusUpdate, AnomalyResponse
from app.schemas.recommendation import (
    RecommendationBase, RecommendationCreate, RecommendationUpdate,
    RecommendationStatusUpdate, RecommendationResponse
)
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.schemas.audit_log import AuditLogResponse
from app.schemas.auth import (
    LoginRequest, TokenResponse, SetupSuperAdminRequest,
    ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest
)

__all__ = [
    "PaginatedResponse", "SuccessResponse", "ErrorResponse",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "UserListResponse",
    "DepartmentBase", "DepartmentCreate", "DepartmentUpdate", "DepartmentResponse", "DepartmentStatsResponse",
    "WardBase", "WardCreate", "WardUpdate", "WardResponse",
    "ComplaintBase", "ComplaintCreate", "ComplaintAssign", "ComplaintStatusUpdate",
    "ComplaintRemarkUpdate", "ComplaintResponse", "ComplaintHistoryResponse", "ComplaintStatsResponse",
    "DocumentBase", "DocumentResponse",
    "EnvironmentalDataBase", "EnvironmentalDataResponse", "AnalyticsSummaryResponse",
    "DepartmentPerformanceResponse", "WardDistributionResponse", "ComplaintTrendResponse",
    "PredictionResponse", "PredictionResultResponse", "ModelInfoResponse",
    "AnomalyBase", "AnomalyStatusUpdate", "AnomalyResponse",
    "RecommendationBase", "RecommendationCreate", "RecommendationUpdate",
    "RecommendationStatusUpdate", "RecommendationResponse",
    "NotificationResponse", "UnreadCountResponse",
    "AuditLogResponse",
    "LoginRequest", "TokenResponse", "SetupSuperAdminRequest",
    "ChangePasswordRequest", "ForgotPasswordRequest", "ResetPasswordRequest",
]
