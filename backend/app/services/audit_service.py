"""Lightweight audit trail writer.

Records key business events independent of the structured application logs,
per architecture doc Section 7. Failures here must never break the calling
request — audit logging is best-effort observability, not a transactional
guarantee.
"""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.audit_log import AuditLog

logger = get_logger(__name__)


class AuditService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def record(
        self,
        *,
        action: str,
        user_id: uuid.UUID | None = None,
        quote_id: uuid.UUID | None = None,
        metadata: dict | None = None,
    ) -> None:
        try:
            entry = AuditLog(
                user_id=user_id, quote_id=quote_id, action=action, log_metadata=metadata
            )
            self.session.add(entry)
            await self.session.flush()
        except Exception:  # noqa: BLE001
            logger.warning("audit_log_write_failed", extra={"action": action})
