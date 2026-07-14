"""Server-side Anthropic Claude API client.

Called only from the backend (never directly from the client) to protect the
API key and allow prompt/response auditing, caching, and rate control, per
the architecture doc's AI Integration section.
"""

from __future__ import annotations

import json
from decimal import Decimal

from anthropic import AsyncAnthropic, APIError, APITimeoutError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import UpstreamServiceError
from app.core.logging import get_logger
from app.schemas.ai import AISuggestedItem

logger = get_logger(__name__)

_SYSTEM_PROMPT = """You are a pricing assistant for a solo electrician's quoting tool.
Given a plain-language job description, output a JSON array of suggested line items.

Each item must have exactly these fields:
- description (string, concise, under 200 characters)
- category (one of: "labor", "material", "callout", "other")
- quantity (positive number)
- unit_price (non-negative number, in the electrician's local currency, a reasonable estimate)
- confidence (number between 0 and 1, your confidence in this estimate)

Respond with ONLY the JSON array, no other text, no markdown code fences.
Keep the list focused and realistic: typically 3-8 line items for a residential/small
commercial electrical job. Always include a "callout" category item for site visit/travel
unless the description clearly indicates otherwise."""


class ClaudeClient:
    def __init__(self) -> None:
        self._client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    @retry(
        retry=retry_if_exception_type(APITimeoutError),
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        reraise=True,
    )
    async def suggest_line_items(self, job_description: str) -> list[AISuggestedItem]:
        try:
            response = await self._client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=1500,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": job_description}],
            )
        except (APIError, APITimeoutError) as exc:
            logger.warning("claude_api_error", extra={"error": str(exc)})
            raise UpstreamServiceError(
                "AI suggestion service is temporarily unavailable. You can still add "
                "line items manually."
            ) from exc

        text_block = next((b for b in response.content if b.type == "text"), None)
        if text_block is None:
            raise UpstreamServiceError("AI suggestion service returned an unexpected response.")

        return self._parse_suggestions(text_block.text)

    def _parse_suggestions(self, raw_text: str) -> list[AISuggestedItem]:
        cleaned = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix(
            "```"
        ).strip()
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.warning("claude_response_parse_failed", extra={"raw": raw_text[:500]})
            raise UpstreamServiceError(
                "AI suggestion service returned an unreadable response."
            ) from exc

        suggestions: list[AISuggestedItem] = []
        for raw_item in data:
            try:
                suggestions.append(
                    AISuggestedItem(
                        description=str(raw_item["description"])[:200],
                        category=raw_item["category"],
                        quantity=Decimal(str(raw_item["quantity"])),
                        unit_price=Decimal(str(raw_item["unit_price"])),
                        confidence=float(raw_item.get("confidence", 0.5)),
                    )
                )
            except (KeyError, ValueError, TypeError):
                # Skip malformed individual items rather than failing the whole response.
                continue
        return suggestions


_claude_client: ClaudeClient | None = None


def get_claude_client() -> ClaudeClient:
    global _claude_client
    if _claude_client is None:
        _claude_client = ClaudeClient()
    return _claude_client
