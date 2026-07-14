"""AI assistant service: orchestrates Claude line-item suggestions.

Per the PRD (7.5) and architecture doc, AI suggestions are strictly additive.
If the AI service fails or times out, quote creation must remain fully
possible via manual entry — this service raises UpstreamServiceError, which
the API layer surfaces as a 503 that the frontend treats as "fall back to
manual entry", never as a hard block.
"""

from __future__ import annotations

from app.core.exceptions import ValidationAppError
from app.integrations.claude_client import ClaudeClient
from app.schemas.ai import AISuggestedItem


class AIService:
    def __init__(self, claude_client: ClaudeClient) -> None:
        self.claude_client = claude_client

    async def suggest_line_items(self, job_description: str) -> list[AISuggestedItem]:
        if not job_description or not job_description.strip():
            raise ValidationAppError("Job description cannot be empty")

        suggestions = await self.claude_client.suggest_line_items(job_description.strip())
        # Cap defensively even if the model over-generates.
        return suggestions[:15]


_ai_service: AIService | None = None


def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        from app.integrations.claude_client import get_claude_client

        _ai_service = AIService(get_claude_client())
    return _ai_service
