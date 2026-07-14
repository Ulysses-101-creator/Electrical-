from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field, field_validator

from app.lib_validation import validate_phone_number
from app.schemas.base import APIModel


class CustomerCreateRequest(APIModel):
    name: str = Field(min_length=1, max_length=255)
    phone: str
    email: str | None = None
    address: str | None = Field(default=None, max_length=1000)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str) -> str:
        return validate_phone_number(v)


class CustomerUpdateRequest(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = None
    email: str | None = None
    address: str | None = Field(default=None, max_length=1000)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str | None) -> str | None:
        return validate_phone_number(v) if v else v


class CustomerRead(APIModel):
    id: uuid.UUID
    name: str
    phone: str
    email: str | None
    address: str | None
    notes: str | None
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class CustomerCreateResponse(APIModel):
    customer: CustomerRead
    duplicate_warning: bool = False


class CustomerListResponse(APIModel):
    items: list[CustomerRead]
    next_cursor: str | None = None


class CustomerDetailResponse(APIModel):
    customer: CustomerRead
    quotes: list["QuoteSummary"]  # noqa: F821


from app.schemas.quote import QuoteSummary  # noqa: E402

CustomerDetailResponse.model_rebuild()
