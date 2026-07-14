"""Aggregates all ORM models so Alembic's autogenerate can discover them
via app.db.session.Base.metadata.
"""

from app.models.audit_log import AuditLog
from app.models.customer import Customer
from app.models.quote import Quote, QuoteStatus
from app.models.quote_item import QuoteItem, QuoteItemCategory
from app.models.quote_photo import QuotePhoto
from app.models.session import Session
from app.models.user import User

__all__ = [
    "AuditLog",
    "Customer",
    "Quote",
    "QuoteStatus",
    "QuoteItem",
    "QuoteItemCategory",
    "QuotePhoto",
    "Session",
    "User",
]
