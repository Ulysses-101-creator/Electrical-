from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.quote import Quote
from app.models.quote_item import QuoteItem
from app.models.quote_photo import QuotePhoto
from app.repositories.base_repository import BaseRepository


class QuoteRepository(BaseRepository[Quote]):
    model = Quote

    def _with_relations(self):
        return select(Quote).options(selectinload(Quote.items), selectinload(Quote.photos))

    async def get_by_id_for_user(self, quote_id: uuid.UUID, user_id: uuid.UUID) -> Quote | None:
        stmt = self._with_relations().where(Quote.id == quote_id, Quote.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_share_token(self, share_token: str) -> Quote | None:
        stmt = self._with_relations().where(Quote.share_token == share_token)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        status: str | None = None,
        customer_id: uuid.UUID | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Quote]:
        stmt = self._with_relations().where(Quote.user_id == user_id)
        if status:
            stmt = stmt.where(Quote.status == status)
        if customer_id:
            stmt = stmt.where(Quote.customer_id == customer_id)
        if date_from:
            stmt = stmt.where(Quote.created_at >= date_from)
        if date_to:
            stmt = stmt.where(Quote.created_at <= date_to)
        stmt = stmt.order_by(Quote.created_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_for_customer(self, customer_id: uuid.UUID) -> list[Quote]:
        stmt = (
            select(Quote)
            .where(Quote.customer_id == customer_id)
            .order_by(Quote.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_item_for_quote(
        self, quote_id: uuid.UUID, item_id: uuid.UUID
    ) -> QuoteItem | None:
        stmt = select(QuoteItem).where(QuoteItem.id == item_id, QuoteItem.quote_id == quote_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_photo_for_quote(
        self, quote_id: uuid.UUID, photo_id: uuid.UUID
    ) -> QuotePhoto | None:
        stmt = select(QuotePhoto).where(
            QuotePhoto.id == photo_id, QuotePhoto.quote_id == quote_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_expired_but_unmarked(self, as_of: datetime) -> list[Quote]:
        """Used by the scheduled expiry job: quotes past valid_until still
        marked as 'sent' (not yet transitioned to 'expired')."""
        stmt = select(Quote).where(
            Quote.status == "sent",
            Quote.valid_until.is_not(None),
            Quote.valid_until < as_of.date(),
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
