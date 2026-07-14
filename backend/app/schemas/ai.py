from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Literal

from pydantic import Field

from app.schemas.base import APIModel


class AISuggestItemsRequest(APIModel):
    job_description: str = Field(min_length=3, max_length=4000)
    quote_id: uuid.UUID | None = None


class AISuggestedItem(APIModel):
    description: str
    category: Literal["labor", "material", "callout", "other"]
    quantity: Decimal
    unit_price: Decimal
    confidence: float = Field(ge=0, le=1)


class AISuggestItemsResponse(APIModel):
    suggestions: list[AISuggestedItem]
