from typing import Callable
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Decode JWT and return the authenticated User object."""
    from app.models.user import User

    payload = decode_access_token(token)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    stmt = select(User).where(User.id == UUID(user_id))
    user = db.execute(stmt).scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return user


def get_current_active_user(current_user=Depends(get_current_user)):
    """Return the currently active authenticated user."""
    return current_user


def require_roles(*roles: str) -> Callable:
    """Return a FastAPI dependency that restricts access to users with given roles."""

    def role_checker(current_user=Depends(get_current_user)):
        user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role_str not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}",
            )
        return current_user

    return role_checker


# ── Convenience role guards ──────────────────────────────────────────────────

def get_super_admin(current_user=Depends(get_current_user)):
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user


def get_city_admin_or_above(current_user=Depends(get_current_user)):
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role not in ("SUPER_ADMIN", "CITY_ADMIN"):
        raise HTTPException(status_code=403, detail="City admin or above access required")
    return current_user


def get_department_officer_or_above(current_user=Depends(get_current_user)):
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role not in ("SUPER_ADMIN", "CITY_ADMIN", "DEPARTMENT_OFFICER"):
        raise HTTPException(status_code=403, detail="Department officer or above access required")
    return current_user


def get_data_analyst_or_above(current_user=Depends(get_current_user)):
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role not in ("SUPER_ADMIN", "CITY_ADMIN", "DATA_ANALYST"):
        raise HTTPException(status_code=403, detail="Data analyst or above access required")
    return current_user
