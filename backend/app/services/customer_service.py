from __future__ import annotations

import uuid

from app.core.exceptions import NotFoundError
from app.models.customer import Customer
from app.repositories.customer_repository import CustomerRepository
from app.repositories.quote_repository import QuoteRepository
from app.schemas.customer import CustomerCreateRequest, CustomerUpdateRequest


class CustomerService:
    def __init__(self, customer_repo: CustomerRepository, quote_repo: QuoteRepository) -> None:
        self.customer_repo = customer_repo
        self.quote_repo = quote_repo

    async def create(
        self, user_id: uuid.UUID, data: CustomerCreateRequest
    ) -> tuple[Customer, bool]:
        duplicate = await self.customer_repo.find_duplicate_phone(user_id, data.phone)
        customer = Customer(
            user_id=user_id,
            name=data.name,
            phone=data.phone,
            email=data.email,
            address=data.address,
            notes=data.notes,
        )
        customer = await self.customer_repo.add(customer)
        await self.customer_repo.commit()
        return customer, duplicate is not None

    async def get(self, user_id: uuid.UUID, customer_id: uuid.UUID) -> Customer:
        customer = await self.customer_repo.get_by_id_for_user(customer_id, user_id)
        if not customer:
            raise NotFoundError("Customer not found")
        return customer

    async def get_with_quotes(self, user_id: uuid.UUID, customer_id: uuid.UUID):
        customer = await self.get(user_id, customer_id)
        quotes = await self.quote_repo.list_for_customer(customer_id)
        return customer, quotes

    async def list(
        self,
        user_id: uuid.UUID,
        *,
        search: str | None,
        is_archived: bool | None,
        limit: int,
        offset: int,
    ) -> list[Customer]:
        return await self.customer_repo.list_for_user(
            user_id, search=search, is_archived=is_archived, limit=limit, offset=offset
        )

    async def update(
        self, user_id: uuid.UUID, customer_id: uuid.UUID, data: CustomerUpdateRequest
    ) -> Customer:
        customer = await self.get(user_id, customer_id)
        if data.name is not None:
            customer.name = data.name
        if data.phone is not None:
            customer.phone = data.phone
        if data.email is not None:
            customer.email = data.email
        if data.address is not None:
            customer.address = data.address
        if data.notes is not None:
            customer.notes = data.notes
        await self.customer_repo.commit()
        return customer

    async def archive(self, user_id: uuid.UUID, customer_id: uuid.UUID) -> Customer:
        customer = await self.get(user_id, customer_id)
        customer.is_archived = True
        await self.customer_repo.commit()
        return customer
