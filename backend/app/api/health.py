"""Liveness and readiness health check endpoints for deployment platform probes."""

from __future__ import annotations

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.rate_limit import get_redis
from app.db.session import check_db_connection

router = APIRouter(tags=["health"])


@router.get("/health")
async def liveness() -> dict:
    """Liveness probe: process is up and able to respond."""
    return {"status": "ok"}


@router.get("/health/ready")
async def readiness() -> JSONResponse:
    """Readiness probe: confirms database and Redis connectivity."""
    db_ok = await check_db_connection()

    redis_ok = True
    try:
        await get_redis().ping()
    except Exception:  # noqa: BLE001
        redis_ok = False

    ready = db_ok and redis_ok
    body = {"status": "ready" if ready else "not_ready", "database": db_ok, "redis": redis_ok}
    return JSONResponse(
        status_code=status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE,
        content=body,
    )
