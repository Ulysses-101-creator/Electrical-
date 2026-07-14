from __future__ import annotations

import uuid
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class QuoteItemCategory(StrEnum):
    LABOR = "labor"
    MATERIAL = "material"
    CALLOUT = "callout"
    OTHER = "other"


class QuoteItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "quote_items"
    __table_args__ = (
        CheckConstraint(
            "category IN ('labor','material','callout','other')", name="ck_quote_items_category"
        ),
        CheckConstraint("quantity > 0", name="ck_quote_items_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_quote_items_unit_price_non_negative"),
        Index("ix_quote_items_quote_sort", "quote_id", "sort_order"),
    )

    quote_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False
    )
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    quote: Mapped["Quote"] = relationship(back_populates="items")  # noqa: F821
