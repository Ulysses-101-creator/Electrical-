"""PDF generation service.

Renders a branded, itemized quote PDF using ReportLab, uploads it to object
storage, and returns the resulting URL. Runs synchronously in V1 (target
<3s for <=30 line items per the architecture doc's performance NFR); the
scalability plan calls for moving this to an async worker queue at higher
scale without changing this service's public interface.
"""

from __future__ import annotations

import io
from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.integrations.storage_client import StorageClient
from app.models.quote import Quote
from app.models.user import User

_CATEGORY_LABELS = {
    "labor": "Labor",
    "material": "Materials",
    "callout": "Callout / Travel",
    "other": "Other",
}


class PDFService:
    def __init__(self, storage_client: StorageClient) -> None:
        self.storage_client = storage_client

    def render(self, *, quote: Quote, user: User, customer_name: str) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            topMargin=0.6 * inch,
            bottomMargin=0.6 * inch,
            leftMargin=0.6 * inch,
            rightMargin=0.6 * inch,
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "QuoteTitle", parent=styles["Title"], fontSize=20, spaceAfter=4
        )
        heading_style = ParagraphStyle(
            "SectionHeading", parent=styles["Heading2"], fontSize=12, spaceBefore=12, spaceAfter=6
        )
        normal = styles["Normal"]

        elements: list = []

        elements.append(Paragraph(user.business_name, title_style))
        elements.append(Paragraph("Quote", styles["Heading3"]))
        elements.append(Spacer(1, 12))

        elements.append(Paragraph(f"<b>Prepared for:</b> {customer_name}", normal))
        if quote.valid_until:
            elements.append(
                Paragraph(f"<b>Valid until:</b> {quote.valid_until.isoformat()}", normal)
            )
        elements.append(Spacer(1, 16))

        if quote.items:
            elements.append(Paragraph("Line Items", heading_style))
            table_data = [["Description", "Category", "Qty", "Unit Price", "Line Total"]]
            grouped: dict[str, list] = {}
            for item in quote.items:
                grouped.setdefault(item.category, []).append(item)

            for category in ("labor", "material", "callout", "other"):
                items = grouped.get(category, [])
                for item in items:
                    line_total = item.quantity * item.unit_price
                    table_data.append(
                        [
                            item.description,
                            _CATEGORY_LABELS.get(item.category, item.category),
                            f"{item.quantity:g}",
                            f"${item.unit_price:,.2f}",
                            f"${line_total:,.2f}",
                        ]
                    )

            table = Table(
                table_data,
                colWidths=[2.6 * inch, 1.1 * inch, 0.6 * inch, 1.0 * inch, 1.1 * inch],
            )
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                        (
                            "ROWBACKGROUNDS",
                            (0, 1),
                            (-1, -1),
                            [colors.white, colors.HexColor("#f9fafb")],
                        ),
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )
            elements.append(table)
        else:
            elements.append(Paragraph("No line items yet.", normal))

        elements.append(Spacer(1, 16))

        totals_data = [
            ["Subtotal", f"${quote.subtotal:,.2f}"],
            [f"Tax ({(quote.tax_rate * Decimal(100)):.2f}%)", f"${quote.tax_amount:,.2f}"],
            ["Total", f"${quote.total:,.2f}"],
        ]
        totals_table = Table(totals_data, colWidths=[5.4 * inch, 1.1 * inch])
        totals_table.setStyle(
            TableStyle(
                [
                    ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                    ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("LINEABOVE", (0, 2), (-1, 2), 1, colors.HexColor("#1f2937")),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        elements.append(totals_table)

        if quote.notes:
            elements.append(Spacer(1, 16))
            elements.append(Paragraph("Notes", heading_style))
            elements.append(Paragraph(quote.notes, normal))

        doc.build(elements)
        return buffer.getvalue()

    async def generate_and_upload(self, *, quote: Quote, user: User, customer_name: str) -> str:
        pdf_bytes = self.render(quote=quote, user=user, customer_name=customer_name)
        key = self.storage_client.build_key(
            prefix=f"quotes/{quote.id}/pdf", filename=f"quote-v{quote.pdf_version + 1}.pdf"
        )
        return await self.storage_client.upload_bytes(
            key=key, data=pdf_bytes, content_type="application/pdf"
        )


_pdf_service: PDFService | None = None


def get_pdf_service() -> PDFService:
    global _pdf_service
    if _pdf_service is None:
        from app.integrations.storage_client import get_storage_client

        _pdf_service = PDFService(get_storage_client())
    return _pdf_service
