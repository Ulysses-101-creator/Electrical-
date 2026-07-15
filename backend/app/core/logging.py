"""Structured, JSON-formatted logging configuration.

Logs include request_id, user_id (when authenticated), route, latency, and
status code for every request. Sensitive fields (passwords, tokens, full PII)
must never be passed into log payloads — see redact_sensitive().
"""

from __future__ import annotations

import logging
import sys
from contextvars import ContextVar
from typing import Any

from pythonjsonlogger import jsonlogger

from app.core.config import settings

# Request-scoped context, populated by RequestContextMiddleware.
request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)
user_id_ctx: ContextVar[str | None] = ContextVar("user_id", default=None)

SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "new_password",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "otp",
    "code",
    "secret",
}


def redact_sensitive(payload: dict[str, Any]) -> dict[str, Any]:
    """Return a shallow copy of payload with sensitive keys redacted."""
    return {
        key: ("***REDACTED***" if key.lower() in SENSITIVE_KEYS else value)
        for key, value in payload.items()
    }


class ContextFilter(logging.Filter):
    """Injects request_id / user_id from context vars into every log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get()
        record.user_id = user_id_ctx.get()
        return True


def configure_logging() -> None:
    """Configure root logging handlers. Call once at application startup."""
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(settings.LOG_LEVEL)

    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        fmt=("%(asctime)s %(levelname)s %(name)s %(message)s " "%(request_id)s %(user_id)s"),
        rename_fields={"asctime": "timestamp", "levelname": "level", "name": "logger"},
    )
    handler.setFormatter(formatter)
    handler.addFilter(ContextFilter())
    root_logger.addHandler(handler)

    # Quiet noisy third-party loggers in local/dev.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
