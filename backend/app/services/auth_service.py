from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.repositories.user_repository import user_repository
from app.schemas.auth import SetupSuperAdminRequest


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Verify credentials and update last_login. Raises 401 on failure."""
    user = user_repository.get_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact administrator.",
        )
    user.last_login = datetime.utcnow()
    user.is_first_login = False
    db.commit()
    db.refresh(user)
    return user


def create_super_admin(db: Session, data: SetupSuperAdminRequest) -> User:
    """Create the initial super admin. Only works if setup is enabled and no SA exists."""
    if not settings.SUPER_ADMIN_SETUP_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin setup is disabled",
        )
    if data.setup_secret != settings.SUPER_ADMIN_SETUP_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid setup secret",
        )
    if user_repository.get_super_admin_exists(db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Super admin already exists",
        )
    if user_repository.get_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=UserRole.SUPER_ADMIN,
        is_active=True,
        is_first_login=False,
    )
    return user_repository.create(db, user)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return user_repository.get_by_email(db, email)


def create_access_token_for_user(user: User) -> str:
    """Generate a JWT access token for the given user."""
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=expires_delta,
    )
