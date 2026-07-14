from __future__ import annotations

import uuid
from decimal import Decimal

from pydantic import Field

from app.schemas.base import APIModel


class UserRead(APIModel):
    id: uuid.UUID
    email: str | None
    phone: str | None
    business_name: str
    logo_url: str | None
    default_labor_rate: Decimal
    default_callout_fee: Decimal
    default_tax_rate: Decimal
    default_material_markup_pct: Decimal
    email_verified: bool


class UserUpdateRequest(APIModel):
    business_name: str | None = Field(default=None, min_length=1, max_length=255)
    default_labor_rate: Decimal | None = Field(default=None, ge=0)
    default_callout_fee: Decimal | None = Field(default=None, ge=0)
    default_tax_rate: Decimal | None = Field(default=None, ge=0, le=1)
    default_material_markup_pct: Decimal | None = Field(default=None, ge=0, le=1000)


class LogoUploadResponse(APIModel):
    logo_url: str
