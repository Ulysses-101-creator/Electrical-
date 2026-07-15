"""Shared validation utilities used by Pydantic schemas and service logic.

Named lib_validation (rather than app/validation.py) to avoid any ambiguity
with Pydantic's internal "validation" naming inside schema modules.
"""

from __future__ import annotations

import re

from app.core.exceptions import ValidationAppError

_PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")

# Denylist of extremely common breached passwords. In production this should
# be backed by a proper breached-password check (e.g. k-anonymity against
# the HaveIBeenPwned range API) rather than a static list; this is the V1
# baseline guard.
_COMMON_PASSWORDS = {
    "password",
    "password1",
    "12345678",
    "123456789",
    "qwerty123",
    "letmein1",
    "admin123",
    "welcome1",
}


def validate_phone_number(raw: str) -> str:
    """Validate and normalize a phone number to a consistent stored format.

    Accepts optional leading '+', 7-15 digits. Strips whitespace/dashes
    before validating.
    """
    cleaned = re.sub(r"[\s\-().]", "", raw)
    if not _PHONE_RE.match(cleaned):
        raise ValidationAppError(
            "Invalid phone number format",
            field_errors=[{"field": "phone", "issue": "must be a valid phone number"}],
        )
    return cleaned


def validate_password_strength(password: str) -> None:
    """Enforce minimum password rules: 8+ chars, at least one letter and one digit."""
    if len(password) < 8:
        raise ValidationAppError(
            "Password too short",
            field_errors=[{"field": "password", "issue": "must be at least 8 characters"}],
        )
    if not re.search(r"[A-Za-z]", password):
        raise ValidationAppError(
            "Password must contain a letter",
            field_errors=[{"field": "password", "issue": "must contain at least one letter"}],
        )
    if not re.search(r"[0-9]", password):
        raise ValidationAppError(
            "Password must contain a digit",
            field_errors=[{"field": "password", "issue": "must contain at least one number"}],
        )
    if password.lower() in _COMMON_PASSWORDS:
        raise ValidationAppError(
            "Password is too common",
            field_errors=[{"field": "password", "issue": "choose a less common password"}],
        )


def validate_file_upload(*, content_type: str, size_bytes: int, max_size_bytes: int) -> None:
    """Validate an uploaded file's MIME type and size (images only, V1)."""
    from app.core.exceptions import PayloadTooLargeError, UnsupportedMediaTypeError

    allowed_types = {"image/png", "image/jpeg", "image/jpg"}
    if content_type not in allowed_types:
        raise UnsupportedMediaTypeError(
            f"Unsupported file type: {content_type}. Allowed: PNG, JPEG."
        )
    if size_bytes > max_size_bytes:
        raise PayloadTooLargeError(
            f"File exceeds maximum size of {max_size_bytes // (1024 * 1024)}MB"
        )


def validate_quote_editable(status: str, *, force: bool = False) -> None:
    """Raise if a quote in the given status cannot be edited without confirmation."""
    from app.core.exceptions import ConflictError

    if status == "accepted" and not force:
        raise ConflictError("This quote has been accepted. Confirm to continue editing it.")
