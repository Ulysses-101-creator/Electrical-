from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Literal

from app.schemas.base import APIModel
from app.schemas.quote import QuoteItemRead


class PublicBusinessInfo(APIModel):
    business_name: str
    logo_url: str | None


class PublicQuoteResponse(APIModel):
    business: PublicBusinessInfo
    customer_name: str
    items: list[QuoteItemRead]
    subtotal: Decimal
    tax_amount: Decimal
    total: Decimal
    valid_until: date | None
    status: str
    notes: str | None
    expired: bool = False


class PublicQuoteRespondRequest(APIModel):
    response: Literal["accepted", "declined"]


class PublicQuoteRespondResponse(APIModel):
    status: str
