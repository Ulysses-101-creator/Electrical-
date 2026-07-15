"""Public, unauthenticated hosted quote view endpoints.

Accessed by customers via a non-guessable share_token, never the internal
quote UUID. No authentication; rate-limited independently of authenticated
traffic to prevent token-guessing abuse.
"""

from __future__ import annotations

from datetime import UTC, date, datetime

from fastapi import APIRouter, Request

from app.api.deps import AuditSvc, DBSession
from app.core.config import settings
from app.core.exceptions import ConflictError, NotFoundError
from app.core.rate_limit import client_identifier, enforce_rate_limit
from app.repositories.customer_repository import CustomerRepository
from app.repositories.quote_repository import QuoteRepository
from app.schemas.public import (
    PublicBusinessInfo,
    PublicQuoteRespondRequest,
    PublicQuoteRespondResponse,
    PublicQuoteResponse,
)
from app.schemas.quote import QuoteItemRead

router = APIRouter(prefix="/public/quotes", tags=["public"])


@router.get("/{share_token}", response_model=PublicQuoteResponse)
async def get_public_quote(share_token: str, request: Request, session: DBSession):
    await enforce_rate_limit(
        scope="public_quote_view",
        identifier=client_identifier(request),
        limit_per_minute=settings.RATE_LIMIT_DEFAULT_PER_MINUTE,
    )

    quote_repo = QuoteRepository(session)
    quote = await quote_repo.get_by_share_token(share_token)
    if quote is None:
        raise NotFoundError("This quote link is invalid or no longer available.")

    customer_repo = CustomerRepository(session)
    customer = await customer_repo.get_by_id(quote.customer_id)

    from app.repositories.user_repository import UserRepository

    user = await UserRepository(session).get_by_id(quote.user_id)

    is_expired = bool(quote.valid_until and quote.valid_until < date.today())

    return PublicQuoteResponse(
        business=PublicBusinessInfo(
            business_name=user.business_name if user else "",
            logo_url=user.logo_url if user else None,
        ),
        customer_name=customer.name if customer else "",
        items=[QuoteItemRead.model_validate(i) for i in quote.items],
        subtotal=quote.subtotal,
        tax_amount=quote.tax_amount,
        total=quote.total,
        valid_until=quote.valid_until,
        status=quote.status,
        notes=quote.notes,
        expired=is_expired,
    )


@router.post("/{share_token}/respond", response_model=PublicQuoteRespondResponse)
async def respond_to_public_quote(
    share_token: str,
    payload: PublicQuoteRespondRequest,
    request: Request,
    session: DBSession,
    audit_service: AuditSvc,
):
    await enforce_rate_limit(
        scope="public_quote_respond",
        identifier=client_identifier(request),
        limit_per_minute=settings.RATE_LIMIT_DEFAULT_PER_MINUTE,
    )

    quote_repo = QuoteRepository(session)
    quote = await quote_repo.get_by_share_token(share_token)
    if quote is None:
        raise NotFoundError("This quote link is invalid or no longer available.")

    if quote.status not in ("sent",):
        raise ConflictError("This quote has already been responded to or is not open for response.")

    if quote.valid_until and quote.valid_until < date.today():
        raise ConflictError("This quote has expired and can no longer be responded to.")

    quote.status = payload.response
    quote.responded_at = datetime.now(UTC)
    await session.commit()

    await audit_service.record(
        action="quote.customer_responded",
        quote_id=quote.id,
        metadata={"response": payload.response},
    )

    return PublicQuoteRespondResponse(status=quote.status)
