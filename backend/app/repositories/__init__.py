from app.repositories.base import BaseRepository
from app.repositories.user_repository import UserRepository, user_repository
from app.repositories.department_repository import DepartmentRepository, department_repository
from app.repositories.complaint_repository import ComplaintRepository, complaint_repository
from app.repositories.document_repository import DocumentRepository, document_repository
from app.repositories.analytics_repository import AnalyticsRepository, analytics_repository
from app.repositories.anomaly_repository import AnomalyRepository, anomaly_repository
from app.repositories.notification_repository import NotificationRepository, notification_repository

__all__ = [
    "BaseRepository",
    "UserRepository", "user_repository",
    "DepartmentRepository", "department_repository",
    "ComplaintRepository", "complaint_repository",
    "DocumentRepository", "document_repository",
    "AnalyticsRepository", "analytics_repository",
    "AnomalyRepository", "anomaly_repository",
    "NotificationRepository", "notification_repository",
]
