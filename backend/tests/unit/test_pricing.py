from decimal import Decimal

from app.domain.quotes.pricing import LineItemInput, calculate_line_total, calculate_quote_totals


def test_calculate_line_total_basic():
    assert calculate_line_total(Decimal("2"), Decimal("50.00")) == Decimal("100.00")


def test_calculate_line_total_rounds_half_up():
    assert calculate_line_total(Decimal("1"), Decimal("10.005")) == Decimal("10.01")


def test_quote_totals_no_markup_no_tax(sample_line_items):
    result = calculate_quote_totals(
        sample_line_items, tax_rate=Decimal("0"), material_markup_pct=Decimal("0")
    )
    # 4*75 + 10*12.5 + 1*50 = 300 + 125 + 50 = 475
    assert result.subtotal == Decimal("475.00")
    assert result.tax_amount == Decimal("0.00")
    assert result.total == Decimal("475.00")


def test_quote_totals_applies_markup_to_materials_only(sample_line_items):
    result = calculate_quote_totals(
        sample_line_items, tax_rate=Decimal("0"), material_markup_pct=Decimal("20")
    )
    # labor: 300 (unaffected), material: 125 * 1.20 = 150, callout: 50 (unaffected)
    assert result.subtotal == Decimal("500.00")


def test_quote_totals_applies_tax_after_markup(sample_line_items):
    result = calculate_quote_totals(
        sample_line_items, tax_rate=Decimal("0.15"), material_markup_pct=Decimal("0")
    )
    assert result.subtotal == Decimal("475.00")
    assert result.tax_amount == Decimal("71.25")
    assert result.total == Decimal("546.25")


def test_quote_totals_empty_items():
    result = calculate_quote_totals([], tax_rate=Decimal("0.1"), material_markup_pct=Decimal("0"))
    assert result.subtotal == Decimal("0.00")
    assert result.tax_amount == Decimal("0.00")
    assert result.total == Decimal("0.00")


def test_quote_totals_zero_markup_on_non_material_categories():
    items = [
        LineItemInput(category="labor", quantity=Decimal("1"), unit_price=Decimal("100")),
        LineItemInput(category="other", quantity=Decimal("1"), unit_price=Decimal("50")),
    ]
    result = calculate_quote_totals(items, tax_rate=Decimal("0"), material_markup_pct=Decimal("50"))
    assert result.subtotal == Decimal("150.00")
