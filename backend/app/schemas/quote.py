from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import Field

from app.schemas.base import APIModel

QuoteStatusLiteral = Literal["draft", "sent", "accepted", "declined", "expired"]
QuoteItemCategoryLiteral = Literal["labor", "material", "callout", "other"]


class QuoteItemCreateRequest(APIModel):
    description: str = Field(min_length=1, max_length=200)
    category: QuoteItemCategoryLiteral
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)


class QuoteItemUpdateRequest(APIModel):
    description: str | None = Field(default=None, min_length=1, max_length=200)
    category: QuoteItemCategoryLiteral | None = None
    quantity: Decimal | None = Field(default=None, gt=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    sort_order: int | None = None


class QuoteItemRead(APIModel):
    id: uuid.UUID
    description: str
    category: QuoteItemCategoryLiteral
    quantity: Decimal
    unit_price: Decimal
    sort_order: int
    is_ai_generated: bool


class QuotePhotoRead(APIModel):
    id: uuid.UUID
    storage_url: str
    sort_order: int


class QuoteCreateRequest(APIModel):
    customer_id: uuid.UUID
    job_description_input: str | None = Field(default=None, max_length=4000)


class QuoteUpdateRequest(APIModel):
    notes: str | None = Field(default=None, max_length=2000)
    valid_until: date | None = None
    material_markup_pct: Decimal | None = Field(default=None, ge=0, le=1000)
    tax_rate: Decimal | None = Field(default=None, ge=0, le=1)
    status: QuoteStatusLiteral | None = None


class QuoteStatusUpdateRequest(APIModel):
    status: Literal["accepted", "declined"]


class QuoteSendRequest(APIModel):
    channel: Literal["email", "whatsapp", "link_only"]


class QuoteRead(APIModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    status: QuoteStatusLiteral
    share_token: str
    subtotal: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    material_markup_pct: Decimal
    total: Decimal
    notes: str | None
    valid_until: date | None
    job_description_input: str | None
    pdf_url: str | None
    pdf_version: int
    sent_at: datetime | None
    responded_at: datetime | None
    created_at: datetime
    updated_at: datetime


class QuoteSummary(APIModel):
    id: uuid.UUID
    status: QuoteStatusLiteral
    total: Decimal
    created_at: datetime
    valid_until: date | None


class QuoteDetailResponse(APIModel):
    quote: QuoteRead
    items: list[QuoteItemRead]
    photos: list[QuotePhotoRead]


class QuoteListResponse(APIModel):
    items: list[QuoteRead]
    next_cursor: str | None = None


class QuoteTotals(APIModel):
    subtotal: Decimal
    tax_amount: Decimal
    total: Decimal


class QuoteItemCreateResponse(APIModel):
    item: QuoteItemRead
    quote_totals: QuoteTotals


class QuoteItemUpdateResponse(APIModel):
    item: QuoteItemRead
    quote_totals: QuoteTotals


class QuoteItemDeleteResponse(APIModel):
    quote_totals: QuoteTotals


class QuotePdfResponse(APIModel):
    pdf_url: str
    pdf_version: int


class QuoteSendResponse(APIModel):
    quote: QuoteRead
    share_url: str
    whatsapp_link: str | None = None
