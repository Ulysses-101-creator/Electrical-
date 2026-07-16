from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.customer import Customer  # noqa: F401
    from app.models.quote import Quote  # noqa: F401
    from app.models.session import Session  # noqa: F401

class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("email IS NOT NULL OR phone IS NOT NULL", name="ck_users_email_or_phone"),
    )

    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)

    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    default_labor_rate: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    default_callout_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    default_tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    default_material_markup_pct: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False, default=0
    )

    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    customers: Mapped[list[Customer]] = relationship(back_populates="user")  # noqa: F821
    quotes: Mapped[list[Quote]] = relationship(back_populates="user")  # noqa: F821
    sessions: Mapped[list[Session]] = relationship(back_populates="user")  # noqa: F821
