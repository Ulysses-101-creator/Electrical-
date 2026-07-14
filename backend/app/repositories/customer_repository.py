from __future__ import annotations

import uuid

from sqlalchemy import or_, select

from app.models.customer import Customer
from app.repositories.base_repository import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    model = Customer

    async def get_by_id_for_user(
        self, customer_id: uuid.UUID, user_id: uuid.UUID
    ) -> Customer | None:
        """Tenant-scoped fetch: always filter by owning user_id, never trust
        a client-supplied ID alone."""
        result = await self.session.execute(
            select(Customer).where(Customer.id == customer_id, Customer.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        search: str | None = None,
        is_archived: bool | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Customer]:
        stmt = select(Customer).where(Customer.user_id == user_id)
        if is_archived is not None:
            stmt = stmt.where(Customer.is_archived == is_archived)
        if search:
            like = f"%{search}%"
            stmt = stmt.where(or_(Customer.name.ilike(like), Customer.phone.ilike(like)))
        stmt = stmt.order_by(Customer.name).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_duplicate_phone(
        self, user_id: uuid.UUID, phone: str, exclude_id: uuid.UUID | None = None
    ) -> Customer | None:
        stmt = select(Customer).where(Customer.user_id == user_id, Customer.phone == phone)
        if exclude_id:
            stmt = stmt.where(Customer.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
