"""Shared pytest fixtures.

Unit tests (tests/unit) exercise domain/service logic with no real database.
Integration tests (tests/integration) require a running Postgres + Redis
(see infra/docker-compose.yml) and are skipped automatically if unavailable.
"""

from __future__ import annotations

import pytest


@pytest.fixture
def sample_line_items():
    from decimal import Decimal

    from app.domain.quotes.pricing import LineItemInput

    return [
        LineItemInput(category="labor", quantity=Decimal("4"), unit_price=Decimal("75.00")),
        LineItemInput(category="material", quantity=Decimal("10"), unit_price=Decimal("12.50")),
        LineItemInput(category="callout", quantity=Decimal("1"), unit_price=Decimal("50.00")),
    ]
