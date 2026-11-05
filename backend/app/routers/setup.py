from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole

router = APIRouter()


@router.get("/status")
def setup_status(db: Session = Depends(get_db)):
    """Public endpoint: returns whether a super admin already exists."""
    exists = db.execute(
        select(User).where(User.role == UserRole.SUPER_ADMIN)
    ).scalar_one_or_none()
    return {"super_admin_exists": exists is not None}

