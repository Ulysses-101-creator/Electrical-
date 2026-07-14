"""Password hashing and JWT access/refresh token utilities.

Passwords are hashed with bcrypt plus a per-install pepper (in addition to
bcrypt's own per-password salt). Refresh tokens are opaque random strings
whose hash is stored server-side (see sessions table) so they can be revoked;
access tokens are short-lived, stateless JWTs.
"""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from typing import Any

import jwt
from passlib.context import CryptContext

from app.core.config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenType(StrEnum):
    ACCESS = "access"
    REFRESH = "refresh"


def _apply_pepper(raw_password: str) -> str:
    """Combine the raw password with a server-side pepper before hashing.

    The pepper is never stored alongside the hash (it lives only in
    application config/secrets), which means a database-only breach is not
    sufficient to brute-force passwords even if bcrypt were compromised.
    """
    return hashlib.sha256((raw_password + settings.PASSWORD_HASH_PEPPER).encode()).hexdigest()


def hash_password(raw_password: str) -> str:
    return _pwd_context.hash(_apply_pepper(raw_password))


def verify_password(raw_password: str, password_hash: str) -> bool:
    return _pwd_context.verify(_apply_pepper(raw_password), password_hash)


def create_access_token(*, subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": TokenType.ACCESS.value,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token.

    Raises jwt.PyJWTError subclasses on invalid/expired/malformed tokens;
    callers (auth dependency) are responsible for translating these into
    HTTP 401 responses.
    """
    payload: dict[str, Any] = jwt.decode(
        token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != TokenType.ACCESS.value:
        raise jwt.InvalidTokenError("Not an access token")
    return payload


def generate_refresh_token() -> str:
    """Generate a cryptographically random opaque refresh token."""
    return secrets.token_urlsafe(64)


def hash_refresh_token(raw_token: str) -> str:
    """Hash a refresh token for storage (never store raw tokens)."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


def generate_share_token() -> str:
    """Generate a non-sequential, non-guessable token for public quote links."""
    return secrets.token_urlsafe(32)


def generate_otp_code() -> str:
    """Generate a 6-digit numeric OTP code."""
    return f"{secrets.randbelow(1_000_000):06d}"
