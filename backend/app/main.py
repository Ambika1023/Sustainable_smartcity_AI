from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.utils.seed_data import seed_initial_data
import app.models  # ensure all models are registered with Base metadata
from app.routers import auth, users, departments, complaints, documents, analytics, predictions, anomalies, recommendations, notifications, audit_logs, setup

# Auto-initialize database tables and seed if empty
Base.metadata.create_all(bind=engine)
try:
    with SessionLocal() as db_session:
        seed_initial_data(db_session)
except Exception as e:
    print(f"Notice during seed initialization: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Government Official Portal API for Sustainable Smart City AI Assistant",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router,            prefix="/api/auth",          tags=["Authentication"])
app.include_router(setup.router,           prefix="/api/setup",         tags=["Setup"])
app.include_router(users.router,           prefix="/api/users",         tags=["Users"])
app.include_router(departments.router,     prefix="/api/departments",   tags=["Departments"])
app.include_router(complaints.router,      prefix="/api/complaints",    tags=["Complaints"])
app.include_router(documents.router,       prefix="/api/documents",     tags=["Documents"])
app.include_router(analytics.router,       prefix="/api/analytics",     tags=["Analytics"])
app.include_router(predictions.router,     prefix="/api/predictions",   tags=["Predictions"])
app.include_router(anomalies.router,       prefix="/api/anomalies",     tags=["Anomalies"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(notifications.router,   prefix="/api/notifications", tags=["Notifications"])
app.include_router(audit_logs.router,      prefix="/api/audit-logs",    tags=["Audit Logs"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Sustainable Smart City AI Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Root"])
async def health_check():
    return {"status": "healthy"}

