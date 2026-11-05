from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_user
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, TokenResponse, SetupSuperAdminRequest,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest, RegisterRequest
)
from app.schemas.user import UserResponse
import app.services.auth_service as auth_service
from app.services.audit_service import log_action
from datetime import timedelta
from app.core.config import settings

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Allow new officials to register with role selection and immediately return auth token."""
    from app.core.security import hash_password
    from app.models.user import UserRole
    import uuid

    # Check if email exists
    existing = auth_service.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered. Please sign in.")

    # Assign role
    role_map = {
        "CITY_ADMIN": UserRole.CITY_ADMIN,
        "DEPARTMENT_OFFICER": UserRole.DEPARTMENT_OFFICER,
        "DATA_ANALYST": UserRole.DATA_ANALYST,
    }
    assigned_role = role_map.get(payload.role, UserRole.DEPARTMENT_OFFICER)

    dept_id = None
    if payload.department_id:
        try:
            dept_id = uuid.UUID(payload.department_id)
        except Exception:
            dept_id = None

    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=assigned_role,
        department_id=dept_id,
        phone=payload.phone,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth_service.create_access_token_for_user(new_user)
    log_action(db, str(new_user.id), "USER_REGISTRATION", "User", str(new_user.id), {"email": new_user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/token", response_model=dict, include_in_schema=True)
def swagger_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 password form endpoint for Swagger UI Authorize button."""
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    token = auth_service.create_access_token_for_user(user)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    token = auth_service.create_access_token_for_user(user)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/setup-super-admin", response_model=TokenResponse)
def setup_super_admin(payload: SetupSuperAdminRequest, db: Session = Depends(get_db)):
    user = auth_service.create_super_admin(db, payload)
    token = auth_service.create_access_token_for_user(user)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_active_user)):
    # JWT is stateless; client clears the token
    return {"message": "Logged out successfully"}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.core.security import verify_password, hash_password
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    log_action(db, str(current_user.id), "CHANGE_PASSWORD", "User", str(current_user.id), {})
    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # In production, send reset email. For now, we log and return generic response.
    user = auth_service.get_user_by_email(db, payload.email)
    if user:
        log_action(db, str(user.id), "FORGOT_PASSWORD_REQUEST", "User", str(user.id), {"email": payload.email})
    # Always return success to prevent email enumeration
    return {"message": "If this email is registered, password reset instructions will be sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Placeholder for token-based reset; in production, verify token from email
    return {"message": "Password reset functionality requires email configuration."}

