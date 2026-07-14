"""Core quote pricing/totals calculation.

Framework-agnostic: no database, no HTTP, no ORM imports. Pure functions
over plain values so this logic is trivially unit-testable and reusable
(e.g. also invoked client-side for optimistic UI updates via mirrored logic).
"""

from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal
from typing import NamedTuple


class LineItemInput(NamedTuple):
    category: str
    quantity: Decimal
    unit_price: Decimal


class QuoteTotalsResult(NamedTuple):
    subtotal: Decimal
    tax_amount: Decimal
    total: Decimal


def _round_currency(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_line_total(quantity: Decimal, unit_price: Decimal) -> Decimal:
    return _round_currency(quantity * unit_price)


def calculate_quote_totals(
    items: list[LineItemInput],
    *,
    tax_rate: Decimal,
    material_markup_pct: Decimal,
) -> QuoteTotalsResult:
    """Compute subtotal, tax, and total for a quote.

    Material markup is applied only to line items categorized as "material";
    labor, callout, and other line items are unaffected by markup, per the
    functional requirement in the PRD (Section 7.5).
    """
    subtotal = Decimal("0")
    for item in items:
        line_total = calculate_line_total(item.quantity, item.unit_price)
        if item.category == "material" and material_markup_pct > 0:
            markup_multiplier = Decimal("1") + (material_markup_pct / Decimal("100"))
            line_total = _round_currency(line_total * markup_multiplier)
        subtotal += line_total

    subtotal = _round_currency(subtotal)
    tax_amount = _round_currency(subtotal * tax_rate)
    total = _round_currency(subtotal + tax_amount)

    return QuoteTotalsResult(subtotal=subtotal, tax_amount=tax_amount, total=total)
