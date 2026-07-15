"""Quote service: the central business logic for quote creation, editing,
line items, status transitions, and sharing.
"""

from __future__ import annotations

import uuid
from datetime import UTC, date, timedelta

from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.core.security import generate_share_token
from app.domain.quotes.pricing import LineItemInput, calculate_quote_totals
from app.domain.quotes.status_rules import (
    can_hard_delete,
    is_valid_transition,
)
from app.lib_validation import validate_quote_editable
from app.models.quote import Quote, QuoteStatus
from app.models.quote_item import QuoteItem
from app.models.quote_photo import QuotePhoto
from app.models.user import User
from app.repositories.customer_repository import CustomerRepository
from app.repositories.quote_repository import QuoteRepository
from app.schemas.quote import (
    QuoteCreateRequest,
    QuoteItemCreateRequest,
    QuoteItemUpdateRequest,
    QuoteUpdateRequest,
)

DEFAULT_QUOTE_VALIDITY_DAYS = 14
MAX_PHOTOS_PER_QUOTE = 5


class QuoteService:
    def __init__(self, quote_repo: QuoteRepository, customer_repo: CustomerRepository) -> None:
        self.quote_repo = quote_repo
        self.customer_repo = customer_repo

    # --- Creation ---

    async def create(self, user: User, data: QuoteCreateRequest) -> Quote:
        customer = await self.customer_repo.get_by_id_for_user(data.customer_id, user.id)
        if not customer:
            raise NotFoundError("Customer not found")

        quote = Quote(
            user_id=user.id,
            customer_id=customer.id,
            status=QuoteStatus.DRAFT,
            share_token=generate_share_token(),
            tax_rate=user.default_tax_rate,
            material_markup_pct=user.default_material_markup_pct,
            valid_until=date.today() + timedelta(days=DEFAULT_QUOTE_VALIDITY_DAYS),
            job_description_input=data.job_description_input,
        )
        quote = await self.quote_repo.add(quote)
        await self.quote_repo.commit()
        return quote

    async def duplicate(self, user_id: uuid.UUID, quote_id: uuid.UUID) -> Quote:
        source = await self.get(user_id, quote_id)

        new_quote = Quote(
            user_id=user_id,
            customer_id=source.customer_id,
            status=QuoteStatus.DRAFT,
            share_token=generate_share_token(),
            tax_rate=source.tax_rate,
            material_markup_pct=source.material_markup_pct,
            valid_until=date.today() + timedelta(days=DEFAULT_QUOTE_VALIDITY_DAYS),
            notes=source.notes,
        )
        new_quote = await self.quote_repo.add(new_quote)

        for item in source.items:
            new_quote.items.append(
                QuoteItem(
                    quote_id=new_quote.id,
                    description=item.description,
                    category=item.category,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    sort_order=item.sort_order,
                    is_ai_generated=False,
                )
            )

        await self._recalculate_totals(new_quote)
        await self.quote_repo.commit()
        return new_quote

    # --- Retrieval ---

    async def get(self, user_id: uuid.UUID, quote_id: uuid.UUID) -> Quote:
        quote = await self.quote_repo.get_by_id_for_user(quote_id, user_id)
        if not quote:
            raise NotFoundError("Quote not found")
        return quote

    async def list(
        self,
        user_id: uuid.UUID,
        *,
        status: str | None,
        customer_id: uuid.UUID | None,
        date_from: date | None,
        date_to: date | None,
        limit: int,
        offset: int,
    ) -> list[Quote]:
        return await self.quote_repo.list_for_user(
            user_id,
            status=status,
            customer_id=customer_id,
            date_from=date_from,
            date_to=date_to,
            limit=limit,
            offset=offset,
        )

    # --- Update / delete ---

    async def update(
        self, user_id: uuid.UUID, quote_id: uuid.UUID, data: QuoteUpdateRequest, *, force: bool = False
    ) -> Quote:
        quote = await self.get(user_id, quote_id)
        validate_quote_editable(quote.status, force=force)

        if data.notes is not None:
            quote.notes = data.notes
        if data.valid_until is not None:
            quote.valid_until = data.valid_until
        if data.material_markup_pct is not None:
            quote.material_markup_pct = data.material_markup_pct
        if data.tax_rate is not None:
            quote.tax_rate = data.tax_rate
        if data.status is not None and data.status != quote.status:
            if not is_valid_transition(quote.status, data.status):
                raise ConflictError(f"Cannot transition quote from {quote.status} to {data.status}")
            quote.status = data.status

        await self._recalculate_totals(quote)
        await self.quote_repo.commit()
        return quote

    async def delete(self, user_id: uuid.UUID, quote_id: uuid.UUID) -> None:
        quote = await self.get(user_id, quote_id)
        if not can_hard_delete(quote.status):
            raise ConflictError("Only draft quotes can be deleted")
        await self.quote_repo.delete(quote)
        await self.quote_repo.commit()

    async def set_status(
        self, user_id: uuid.UUID, quote_id: uuid.UUID, new_status: str
    ) -> Quote:
        quote = await self.get(user_id, quote_id)
        if not is_valid_transition(quote.status, new_status):
            raise ConflictError(f"Cannot transition quote from {quote.status} to {new_status}")
        quote.status = new_status
        if new_status in ("accepted", "declined"):
            from datetime import datetime

            quote.responded_at = datetime.now(UTC)
        await self.quote_repo.commit()
        return quote

    # --- Line items ---

    async def add_item(
        self, user_id: uuid.UUID, quote_id: uuid.UUID, data: QuoteItemCreateRequest
    ) -> tuple[QuoteItem, Quote]:
        quote = await self.get(user_id, quote_id)
        validate_quote_editable(quote.status)

        max_sort = max((i.sort_order for i in quote.items), default=-1)
        item = QuoteItem(
            quote_id=quote.id,
            description=data.description,
            category=data.category,
            quantity=data.quantity,
            unit_price=data.unit_price,
            sort_order=max_sort + 1,
            is_ai_generated=False,
        )
        quote.items.append(item)
        await self._recalculate_totals(quote)
        await self.quote_repo.commit()
        return item, quote

    async def update_item(
        self,
        user_id: uuid.UUID,
        quote_id: uuid.UUID,
        item_id: uuid.UUID,
        data: QuoteItemUpdateRequest,
    ) -> tuple[QuoteItem, Quote]:
        quote = await self.get(user_id, quote_id)
        validate_quote_editable(quote.status)

        item = await self.quote_repo.get_item_for_quote(quote_id, item_id)
        if not item:
            raise NotFoundError("Line item not found")

        if data.description is not None:
            item.description = data.description
        if data.category is not None:
            item.category = data.category
        if data.quantity is not None:
            item.quantity = data.quantity
        if data.unit_price is not None:
            item.unit_price = data.unit_price
        if data.sort_order is not None:
            item.sort_order = data.sort_order

        await self._recalculate_totals(quote)
        await self.quote_repo.commit()
        return item, quote

    async def delete_item(
        self, user_id: uuid.UUID, quote_id: uuid.UUID, item_id: uuid.UUID
    ) -> Quote:
        quote = await self.get(user_id, quote_id)
        validate_quote_editable(quote.status)

        item = await self.quote_repo.get_item_for_quote(quote_id, item_id)
        if not item:
            raise NotFoundError("Line item not found")

        quote.items.remove(item)
        await self.quote_repo.delete(item)
        await self._recalculate_totals(quote)
        await self.quote_repo.commit()
        return quote

    # --- Photos ---

    async def add_photo(
        self, user_id: uuid.UUID, quote_id: uuid.UUID, storage_url: str
    ) -> QuotePhoto:
        quote = await self.get(user_id, quote_id)
        if len(quote.photos) >= MAX_PHOTOS_PER_QUOTE:
            raise ConflictError(f"Maximum of {MAX_PHOTOS_PER_QUOTE} photos per quote reached")

        max_sort = max((p.sort_order for p in quote.photos), default=-1)
        photo = QuotePhoto(quote_id=quote.id, storage_url=storage_url, sort_order=max_sort + 1)
        quote.photos.append(photo)
        await self.quote_repo.commit()
        return photo

    async def delete_photo(
        self, user_id: uuid.UUID, quote_id: uuid.UUID, photo_id: uuid.UUID
    ) -> None:
        quote = await self.get(user_id, quote_id)
        photo = await self.quote_repo.get_photo_for_quote(quote_id, photo_id)
        if not photo:
            raise NotFoundError("Photo not found")
        quote.photos.remove(photo)
        await self.quote_repo.delete(photo)
        await self.quote_repo.commit()

    # --- Sending ---

    async def mark_sent(self, user_id: uuid.UUID, quote_id: uuid.UUID) -> Quote:
        quote = await self.get(user_id, quote_id)
        if len(quote.items) == 0:
            raise ValidationAppError("Cannot send a quote with no line items")

        if not is_valid_transition(quote.status, QuoteStatus.SENT.value):
            raise ConflictError(f"Cannot send a quote in status '{quote.status}'")

        from datetime import datetime

        quote.status = QuoteStatus.SENT
        quote.sent_at = datetime.now(UTC)
        await self.quote_repo.commit()
        return quote

    # --- Internal ---

    async def _recalculate_totals(self, quote: Quote) -> None:
        line_items = [
            LineItemInput(category=i.category, quantity=i.quantity, unit_price=i.unit_price)
            for i in quote.items
        ]
        result = calculate_quote_totals(
            line_items, tax_rate=quote.tax_rate, material_markup_pct=quote.material_markup_pct
        )
        quote.subtotal = result.subtotal
        quote.tax_amount = result.tax_amount
        quote.total = result.total
