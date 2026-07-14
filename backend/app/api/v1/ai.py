"""AI line-item suggestion endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.api.deps import AISvc, CurrentUser
from app.core.config import settings
from app.core.rate_limit import enforce_rate_limit
from app.schemas.ai import AISuggestItemsRequest, AISuggestItemsResponse

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/suggest-items", response_model=AISuggestItemsResponse)
async def suggest_items(
    payload: AISuggestItemsRequest,
    request: Request,
    current_user: CurrentUser,
    ai_service: AISvc,
):
    await enforce_rate_limit(
        scope="ai_suggest",
        identifier=str(current_user.id),
        limit_per_minute=settings.RATE_LIMIT_AI_PER_MINUTE,
    )
    suggestions = await ai_service.suggest_line_items(payload.job_description)
    return AISuggestItemsResponse(suggestions=suggestions)
