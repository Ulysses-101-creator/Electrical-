"""Quote endpoints: CRUD, line items, photos, PDF generation, sending, status."""

from __future__ import annotations

import base64
import uuid
from datetime import date

from fastapi import APIRouter, Query, Request, UploadFile, status

from app.api.deps import (
    AuditSvc,
    CurrentUser,
    CustomerRepo,
    NotificationSvc,
    PDFSvc,
    QuoteSvc,
)
from app.core.config import settings
from app.core.exceptions import (
    NotFoundError,
    UnsupportedMediaTypeError,
    ValidationAppError,
)
from app.core.rate_limit import enforce_rate_limit
from app.integrations.storage_client import get_storage_client
from app.lib_validation import validate_file_upload
from app.schemas.quote import (
    QuoteCreateRequest,
    QuoteDetailResponse,
    QuoteItemCreateRequest,
    QuoteItemCreateResponse,
    QuoteItemDeleteResponse,
    QuoteItemRead,
    QuoteItemUpdateRequest,
    QuoteItemUpdateResponse,
    QuoteListResponse,
    QuotePdfResponse,
    QuotePhotoRead,
    QuoteRead,
    QuoteSendRequest,
    QuoteSendResponse,
    QuoteStatusUpdateRequest,
    QuoteTotals,
    QuoteUpdateRequest,
)

router = APIRouter(prefix="/quotes", tags=["quotes"])

DEFAULT_PAGE_SIZE = 20
MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024


def _encode_cursor(offset: int) -> str:
    return base64.urlsafe_b64encode(str(offset).encode()).decode()


def _decode_cursor(cursor: str | None) -> int:
    if not cursor:
        return 0
    try:
        return int(base64.urlsafe_b64decode(cursor.encode()).decode())
    except (ValueError, UnicodeDecodeError):
        return 0


def _to_detail_response(quote) -> QuoteDetailResponse:
    return QuoteDetailResponse(
        quote=QuoteRead.model_validate(quote),
        items=[QuoteItemRead.model_validate(i) for i in quote.items],
        photos=[QuotePhotoRead.model_validate(p) for p in quote.photos],
    )


@router.get("", response_model=QuoteListResponse)
async def list_quotes(
    current_user: CurrentUser,
    quote_service: QuoteSvc,
    status_filter: str | None = Query(default=None, alias="status"),
    customer_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    cursor: str | None = None,
    limit: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=100),
):
    offset = _decode_cursor(cursor)
    quotes = await quote_service.list(
        current_user.id,
        status=status_filter,
        customer_id=customer_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit + 1,
        offset=offset,
    )
    has_more = len(quotes) > limit
    quotes = quotes[:limit]
    next_cursor = _encode_cursor(offset + limit) if has_more else None
    return QuoteListResponse(
        items=[QuoteRead.model_validate(q) for q in quotes], next_cursor=next_cursor
    )


@router.post("", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
async def create_quote(
    payload: QuoteCreateRequest,
    current_user: CurrentUser,
    quote_service: QuoteSvc,
    audit_service: AuditSvc,
):
    quote = await quote_service.create(current_user, payload)
    await audit_service.record(
        action="quote.created", user_id=current_user.id, quote_id=quote.id
    )
    return QuoteRead.model_validate(quote)


@router.get("/{quote_id}", response_model=QuoteDetailResponse)
async def get_quote(quote_id: uuid.UUID, current_user: CurrentUser, quote_service: QuoteSvc):
    quote = await quote_service.get(current_user.id, quote_id)
    return _to_detail_response(quote)


@router.patch("/{quote_id}", response_model=QuoteRead)
async def update_quote(
    quote_id: uuid.UUID,
    payload: QuoteUpdateRequest,
    current_user: CurrentUser,
    quote_service: QuoteSvc,
    force: bool = Query(default=False),
):
    quote = await quote_service.update(current_user.id, quote_id, payload, force=force)
    return QuoteRead.model_validate(quote)


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote(quote_id: uuid.UUID, current_user: CurrentUser, quote_service: QuoteSvc):
    await quote_service.delete(current_user.id, quote_id)


@router.post("/{quote_id}/duplicate", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
async def duplicate_quote(quote_id: uuid.UUID, current_user: CurrentUser, quote_service: QuoteSvc):
    quote = await quote_service.duplicate(current_user.id, quote_id)
    return QuoteRead.model_validate(quote)


@router.post(
    "/{quote_id}/items", response_model=QuoteItemCreateResponse, status_code=status.HTTP_201_CREATED
)
async def add_item(
    quote_id: uuid.UUID,
    payload: QuoteItemCreateRequest,
    current_user: CurrentUser,
    quote_service: QuoteSvc,
):
    item, quote = await quote_service.add_item(current_user.id, quote_id, payload)
    return QuoteItemCreateResponse(
        item=QuoteItemRead.model_validate(item),
        quote_totals=QuoteTotals(
            subtotal=quote.subtotal, tax_amount=quote.tax_amount, total=quote.total
        ),
    )


@router.patch("/{quote_id}/items/{item_id}", response_model=QuoteItemUpdateResponse)
async def update_item(
    quote_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: QuoteItemUpdateRequest,
    current_user: CurrentUser,
    quote_service: QuoteSvc,
):
    item, quote = await quote_service.update_item(current_user.id, quote_id, item_id, payload)
    return QuoteItemUpdateResponse(
        item=QuoteItemRead.model_validate(item),
        quote_totals=QuoteTotals(
            subtotal=quote.subtotal, tax_amount=quote.tax_amount, total=quote.total
        ),
    )


@router.delete("/{quote_id}/items/{item_id}", response_model=QuoteItemDeleteResponse)
async def delete_item(
    quote_id: uuid.UUID, item_id: uuid.UUID, current_user: CurrentUser, quote_service: QuoteSvc
):
    quote = await quote_service.delete_item(current_user.id, quote_id, item_id)
    return QuoteItemDeleteResponse(
        quote_totals=QuoteTotals(
            subtotal=quote.subtotal, tax_amount=quote.tax_amount, total=quote.total
        )
    )


@router.post(
    "/{quote_id}/photos", response_model=QuotePhotoRead, status_code=status.HTTP_201_CREATED
)
async def upload_photo(
    quote_id: uuid.UUID, file: UploadFile, current_user: CurrentUser, quote_service: QuoteSvc
):
    content = await file.read()
    if not file.content_type:
        raise UnsupportedMediaTypeError("Missing content type")
    validate_file_upload(
        content_type=file.content_type,
        size_bytes=len(content),
        max_size_bytes=MAX_PHOTO_SIZE_BYTES,
    )

    storage_client = get_storage_client()
    key = storage_client.build_key(
        prefix=f"quotes/{quote_id}/photos", filename=file.filename or "photo.jpg"
    )
    storage_url = await storage_client.upload_bytes(
        key=key, data=content, content_type=file.content_type
    )
    photo = await quote_service.add_photo(current_user.id, quote_id, storage_url)
    return QuotePhotoRead.model_validate(photo)


@router.delete("/{quote_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    quote_id: uuid.UUID, photo_id: uuid.UUID, current_user: CurrentUser, quote_service: QuoteSvc
):
    await quote_service.delete_photo(current_user.id, quote_id, photo_id)


@router.post("/{quote_id}/pdf", response_model=QuotePdfResponse)
async def generate_pdf(
    quote_id: uuid.UUID,
    current_user: CurrentUser,
    quote_service: QuoteSvc,
    customer_repo: CustomerRepo,
    pdf_service: PDFSvc,
):
    quote = await quote_service.get(current_user.id, quote_id)
    if len(quote.items) == 0:
        raise ValidationAppError("Cannot generate a PDF for a quote with no line items")

    customer = await customer_repo.get_by_id_for_user(quote.customer_id, current_user.id)
    if customer is None:
        raise NotFoundError("Customer not found")

    pdf_url = await pdf_service.generate_and_upload(
        quote=quote, user=current_user, customer_name=customer.name
    )
    quote.pdf_url = pdf_url
    quote.pdf_version += 1
    await quote_service.quote_repo.commit()

    return QuotePdfResponse(pdf_url=pdf_url, pdf_version=quote.pdf_version)


@router.post("/{quote_id}/send", response_model=QuoteSendResponse)
async def send_quote(
    quote_id: uuid.UUID,
    payload: QuoteSendRequest,
    request: Request,
    current_user: CurrentUser,
    quote_service: QuoteSvc,
    customer_repo: CustomerRepo,
    notification_service: NotificationSvc,
    pdf_service: PDFSvc,
    audit_service: AuditSvc,
):
    await enforce_rate_limit(
        scope="quote_send",
        identifier=str(current_user.id),
        limit_per_minute=settings.RATE_LIMIT_DEFAULT_PER_MINUTE,
    )

    quote = await quote_service.get(current_user.id, quote_id)
    customer = await customer_repo.get_by_id_for_user(quote.customer_id, current_user.id)
    if customer is None:
        raise NotFoundError("Customer not found")

    whatsapp_link: str | None = None

    if payload.channel == "email":
        if not customer.email:
            raise ValidationAppError(
                "This customer has no email on file.",
                field_errors=[{"field": "email", "issue": "required to send via email"}],
            )
        pdf_bytes = pdf_service.render(
            quote=quote, user=current_user, customer_name=customer.name
        )
        await notification_service.send_quote_email(
            quote=quote, user=current_user, customer=customer, pdf_bytes=pdf_bytes
        )
    elif payload.channel == "whatsapp":
        if not customer.phone:
            raise ValidationAppError(
                "This customer has no phone number on file.",
                field_errors=[{"field": "phone", "issue": "required to send via WhatsApp"}],
            )
        whatsapp_link = notification_service.build_whatsapp_link(
            quote=quote, user=current_user, customer=customer
        )

    quote = await quote_service.mark_sent(current_user.id, quote_id)
    await audit_service.record(
        action="quote.sent",
        user_id=current_user.id,
        quote_id=quote.id,
        metadata={"channel": payload.channel},
    )

    share_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/q/{quote.share_token}"
    return QuoteSendResponse(
        quote=QuoteRead.model_validate(quote), share_url=share_url, whatsapp_link=whatsapp_link
    )


@router.post("/{quote_id}/status", response_model=QuoteRead)
async def set_quote_status(
    quote_id: uuid.UUID,
    payload: QuoteStatusUpdateRequest,
    current_user: CurrentUser,
    quote_service: QuoteSvc,
    audit_service: AuditSvc,
):
    quote = await quote_service.set_status(current_user.id, quote_id, payload.status)
    await audit_service.record(
        action="quote.status_changed",
        user_id=current_user.id,
        quote_id=quote.id,
        metadata={"status": payload.status},
    )
    return QuoteRead.model_validate(quote)
