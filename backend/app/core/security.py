import hashlib
import hmac
import secrets
import time
from typing import Set

from fastapi import HTTPException, Request, status

from app.core.config import get_settings

# In-memory storage for active session tracking, revocations, and rate limiting
_revoked_sessions: Set[str] = set()
_rate_limit_state = {
    "failed_attempts": 0,
    "lockout_until": 0.0,
}

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 60
SESSION_COOKIE_NAME = "syllabix_session"


def is_pin_configured() -> bool:
    """Returns True if APP_ACCESS_PIN is configured and non-empty."""
    settings = get_settings()
    return bool(settings.app_access_pin and settings.app_access_pin.strip())


def check_rate_limit() -> tuple[bool, int]:
    """
    Checks if a temporary lockout is currently active.
    Returns (is_locked_out, remaining_seconds).
    """
    now = time.time()
    lockout_until = _rate_limit_state["lockout_until"]
    if lockout_until > now:
        remaining = int(lockout_until - now)
        return True, max(1, remaining)

    # Lockout has expired; reset if needed
    if lockout_until > 0 and lockout_until <= now:
        _rate_limit_state["failed_attempts"] = 0
        _rate_limit_state["lockout_until"] = 0.0

    return False, 0


def record_failed_attempt() -> tuple[bool, int]:
    """
    Records an incorrect PIN attempt.
    If attempts reach threshold, triggers temporary lockout.
    Returns (is_locked_out, remaining_seconds).
    """
    _rate_limit_state["failed_attempts"] += 1
    if _rate_limit_state["failed_attempts"] >= MAX_FAILED_ATTEMPTS:
        _rate_limit_state["lockout_until"] = time.time() + LOCKOUT_DURATION_SECONDS
        return True, LOCKOUT_DURATION_SECONDS
    return False, 0


def reset_rate_limit() -> None:
    """Resets failed attempt counters upon successful authentication."""
    _rate_limit_state["failed_attempts"] = 0
    _rate_limit_state["lockout_until"] = 0.0


def verify_pin_constant_time(entered_pin: str) -> bool:
    """
    Performs constant-time comparison against configured APP_ACCESS_PIN.
    Does not log or reveal any PIN digits.
    """
    settings = get_settings()
    configured_pin = settings.app_access_pin

    if not configured_pin or not configured_pin.strip():
        return False

    # Compare strictly using secrets.compare_digest to prevent timing attacks
    return secrets.compare_digest(entered_pin.strip(), configured_pin.strip())


def _generate_signature(data: str) -> str:
    settings = get_settings()
    secret = settings.app_session_secret.encode("utf-8")
    return hmac.new(secret, data.encode("utf-8"), hashlib.sha256).hexdigest()


def create_session_token() -> str:
    """
    Generates a cryptographically signed session token:
    <session_id>.<timestamp>.<hmac_signature>
    """
    session_id = secrets.token_hex(16)
    timestamp = str(int(time.time()))
    payload = f"{session_id}.{timestamp}"
    signature = _generate_signature(payload)
    return f"{payload}.{signature}"


def validate_session_token(token: str) -> bool:
    """
    Validates HMAC signature, expiration time based on APP_AUTO_LOCK_MINUTES,
    and checks against revoked sessions.
    """
    if not token or not isinstance(token, str):
        return False

    parts = token.split(".")
    if len(parts) != 3:
        return False

    session_id, timestamp_str, signature = parts

    # Check revocation
    if session_id in _revoked_sessions:
        return False

    # Verify signature
    payload = f"{session_id}.{timestamp_str}"
    expected_sig = _generate_signature(payload)
    if not hmac.compare_digest(signature, expected_sig):
        return False

    # Verify expiration
    try:
        ts = int(timestamp_str)
    except ValueError:
        return False

    settings = get_settings()
    max_age_seconds = max(1, settings.app_auto_lock_minutes) * 60
    if time.time() - ts > max_age_seconds:
        return False

    return True


def revoke_session_token(token: str) -> None:
    """Revokes a session token so it cannot be reused."""
    if not token or not isinstance(token, str):
        return
    parts = token.split(".")
    if len(parts) >= 1 and parts[0]:
        _revoked_sessions.add(parts[0])


def extract_token(request: Request) -> str | None:
    """Extracts session token from HTTP-only cookie or Authorization header."""
    cookie_token = request.cookies.get(SESSION_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    return None


def is_authenticated_request(request: Request) -> bool:
    """Helper to check if request is authenticated without raising an exception."""
    token = extract_token(request)
    if not token:
        return False
    return validate_session_token(token)


async def require_auth(request: Request) -> dict:
    """
    FastAPI dependency that enforces PIN session authentication.
    Raises 401 Unauthorized if session is missing, invalid, or expired.
    """
    token = extract_token(request)
    if not token or not validate_session_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized - PIN authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"authenticated": True}

