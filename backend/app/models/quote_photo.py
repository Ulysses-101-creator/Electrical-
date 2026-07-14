from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class QuotePhoto(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "quote_photos"
    __table_args__ = (Index("ix_quote_photos_quote_sort", "quote_id", "sort_order"),)

    quote_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False
    )
    storage_url: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    quote: Mapped["Quote"] = relationship(back_populates="photos")  # noqa: F821
