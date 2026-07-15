"""Scheduled job: transitions 'sent' quotes past their valid_until date to
'expired'. Intended to run on a periodic schedule (e.g. hourly) via the
deployment platform's cron/scheduled-job feature (see infra/render.yaml).
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime

from app.core.logging import configure_logging, get_logger
from app.db.session import AsyncSessionLocal
from app.repositories.quote_repository import QuoteRepository

logger = get_logger(__name__)


async def expire_overdue_quotes() -> int:
    async with AsyncSessionLocal() as session:
        repo = QuoteRepository(session)
        overdue = await repo.find_expired_but_unmarked(datetime.now(UTC))

        for quote in overdue:
            quote.status = "expired"

        await session.commit()
        logger.info("quote_expiry_job_completed", extra={"expired_count": len(overdue)})
        return len(overdue)


async def _main() -> None:
    configure_logging()
    count = await expire_overdue_quotes()
    logger.info("quote_expiry_job_summary", extra={"expired_count": count})


if __name__ == "__main__":
    asyncio.run(_main())
