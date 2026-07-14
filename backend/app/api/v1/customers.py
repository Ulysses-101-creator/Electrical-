"""Customer management endpoints."""

from __future__ import annotations

import base64
import uuid

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, CustomerSvc
from app.schemas.customer import (
    CustomerCreateRequest,
    CustomerCreateResponse,
    CustomerDetailResponse,
    CustomerListResponse,
    CustomerRead,
    CustomerUpdateRequest,
)
from app.schemas.quote import QuoteSummary

router = APIRouter(prefix="/customers", tags=["customers"])

DEFAULT_PAGE_SIZE = 20


def _encode_cursor(offset: int) -> str:
    return base64.urlsafe_b64encode(str(offset).encode()).decode()


def _decode_cursor(cursor: str | None) -> int:
    if not cursor:
        return 0
    try:
        return int(base64.urlsafe_b64decode(cursor.encode()).decode())
    except (ValueError, UnicodeDecodeError):
        return 0


@router.get("", response_model=CustomerListResponse)
async def list_customers(
    current_user: CurrentUser,
    customer_service: CustomerSvc,
    search: str | None = None,
    is_archived: bool | None = None,
    cursor: str | None = None,
    limit: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=100),
):
    offset = _decode_cursor(cursor)
    customers = await customer_service.list(
        current_user.id, search=search, is_archived=is_archived, limit=limit + 1, offset=offset
    )
    has_more = len(customers) > limit
    customers = customers[:limit]
    next_cursor = _encode_cursor(offset + limit) if has_more else None
    return CustomerListResponse(
        items=[CustomerRead.model_validate(c) for c in customers], next_cursor=next_cursor
    )


@router.post("", response_model=CustomerCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreateRequest, current_user: CurrentUser, customer_service: CustomerSvc
):
    customer, duplicate_warning = await customer_service.create(current_user.id, payload)
    return CustomerCreateResponse(
        customer=CustomerRead.model_validate(customer), duplicate_warning=duplicate_warning
    )


@router.get("/{customer_id}", response_model=CustomerDetailResponse)
async def get_customer(
    customer_id: uuid.UUID, current_user: CurrentUser, customer_service: CustomerSvc
):
    customer, quotes = await customer_service.get_with_quotes(current_user.id, customer_id)
    return CustomerDetailResponse(
        customer=CustomerRead.model_validate(customer),
        quotes=[QuoteSummary.model_validate(q) for q in quotes],
    )


@router.patch("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: uuid.UUID,
    payload: CustomerUpdateRequest,
    current_user: CurrentUser,
    customer_service: CustomerSvc,
):
    customer = await customer_service.update(current_user.id, customer_id, payload)
    return CustomerRead.model_validate(customer)


@router.post("/{customer_id}/archive", response_model=CustomerRead)
async def archive_customer(
    customer_id: uuid.UUID, current_user: CurrentUser, customer_service: CustomerSvc
):
    customer = await customer_service.archive(current_user.id, customer_id)
    return CustomerRead.model_validate(customer)
