from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class QuoteStatus(StrEnum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class Quote(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "quotes"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft','sent','accepted','declined','expired')",
            name="ck_quotes_status",
        ),
        Index("ix_quotes_user_status", "user_id", "status"),
        Index("ix_quotes_user_created", "user_id", "created_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False
    )

    status: Mapped[str] = mapped_column(String(20), nullable=False, default=QuoteStatus.DRAFT)
    share_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)

    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    material_markup_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)
    job_description_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_suggestion_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    pdf_version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="quotes")  # noqa: F821
    customer: Mapped["Customer"] = relationship(back_populates="quotes")  # noqa: F821
    items: Mapped[list["QuoteItem"]] = relationship(  # noqa: F821
        back_populates="quote", cascade="all, delete-orphan", order_by="QuoteItem.sort_order"
    )
    photos: Mapped[list["QuotePhoto"]] = relationship(  # noqa: F821
        back_populates="quote", cascade="all, delete-orphan", order_by="QuotePhoto.sort_order"
    )
