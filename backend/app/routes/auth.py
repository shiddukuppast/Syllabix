from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.security import (
    SESSION_COOKIE_NAME,
    check_rate_limit,
    create_session_token,
    extract_token,
    is_authenticated_request,
    is_pin_configured,
    record_failed_attempt,
    reset_rate_limit,
    revoke_session_token,
    verify_pin_constant_time,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class PinVerifyRequest(BaseModel):
    pin: str = Field(min_length=1, max_length=32)


@router.get("/status")
async def get_auth_status(request: Request) -> dict:
    """
    Returns the current authentication and lockout status.
    Safe for public consumption; never exposes the PIN.
    """
    settings = get_settings()
    is_locked_out, remaining_seconds = check_rate_limit()
    authenticated = is_authenticated_request(request)

    return {
        "authenticated": authenticated,
        "pin_configured": is_pin_configured(),
        "auto_lock_minutes": settings.app_auto_lock_minutes,
        "locked_out": is_locked_out,
        "lockout_remaining_seconds": remaining_seconds,
    }


@router.post("/verify")
async def verify_pin(body: PinVerifyRequest, response: Response) -> dict:
    """
    Verifies the entered PIN using constant-time comparison.
    Enforces rate-limiting and temporary lockout on consecutive failures.
    On success, issues an HTTP-only SameSite session cookie.
    """
    if not is_pin_configured():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="APP_ACCESS_PIN is not configured in backend environment.",
        )

    # 1. Check if temporary lockout is active
    is_locked_out, remaining_seconds = check_rate_limit()
    if is_locked_out:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many incorrect attempts. Please wait {remaining_seconds} seconds before trying again.",
        )

    # 2. Verify PIN in constant time
    is_correct = verify_pin_constant_time(body.pin)

    if not is_correct:
        is_now_locked, lock_seconds = record_failed_attempt()
        if is_now_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many incorrect attempts. Workspace locked for {lock_seconds} seconds.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect PIN. Please try again.",
        )

    # 3. Success: Reset rate limit counters & issue signed session token
    reset_rate_limit()
    session_token = create_session_token()
    settings = get_settings()
    max_age_seconds = max(1, settings.app_auto_lock_minutes) * 60

    # Set secure HTTP-only SameSite session cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        max_age=max_age_seconds,
        httponly=True,
        samesite="lax",
        path="/",
    )

    return {
        "success": True,
        "message": "Workspace unlocked successfully.",
        "auto_lock_minutes": settings.app_auto_lock_minutes,
    }


@router.post("/lock")
async def lock_session(request: Request, response: Response) -> dict:
    """
    Invalidates the current session token and deletes the HTTP-only cookie.
    """
    token = extract_token(request)
    if token:
        revoke_session_token(token)

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
    )

    return {
        "success": True,
        "message": "Workspace locked and session invalidated.",
    }

