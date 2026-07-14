"""Redis-backed rate limiting.

Uses a simple fixed-window counter per (scope, identifier, minute-bucket).
Sufficient for V1; can be swapped for a sliding-window/token-bucket
implementation later without changing call sites.
"""

from __future__ import annotations

import time

from fastapi import Request
from redis.asyncio import Redis

from app.core.config import settings
from app.core.exceptions import RateLimitedError

_redis_client: Redis | None = None


def get_redis() -> Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


async def enforce_rate_limit(*, scope: str, identifier: str, limit_per_minute: int) -> None:
    """Raise RateLimitedError if the identifier has exceeded limit_per_minute for scope."""
    redis = get_redis()
    window = int(time.time() // 60)
    key = f"ratelimit:{scope}:{identifier}:{window}"

    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, 60)

    if count > limit_per_minute:
        raise RateLimitedError("Too many requests. Please try again shortly.")


def client_identifier(request: Request) -> str:
    """Best-effort client identifier for anonymous rate limiting (by IP)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
