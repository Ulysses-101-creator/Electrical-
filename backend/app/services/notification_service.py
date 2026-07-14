"""Notification service: orchestrates quote delivery via email and WhatsApp.

Wraps the individual integration clients behind a single interface consumed
by the quotes API route, keeping channel-selection logic (and future
channels) out of the route handler.
"""

from __future__ import annotations

from app.core.config import settings
from app.core.exceptions import ValidationAppError
from app.integrations.email_client import EmailClient
from app.integrations.whatsapp_client import WhatsAppClient
from app.models.customer import Customer
from app.models.quote import Quote
from app.models.user import User


def _hosted_quote_url(share_token: str) -> str:
    return f"{settings.FRONTEND_BASE_URL.rstrip('/')}/q/{share_token}"


class NotificationService:
    def __init__(self, email_client: EmailClient, whatsapp_client: WhatsAppClient) -> None:
        self.email_client = email_client
        self.whatsapp_client = whatsapp_client

    async def send_quote_email(
        self, *, quote: Quote, user: User, customer: Customer, pdf_bytes: bytes | None
    ) -> None:
        if not customer.email:
            raise ValidationAppError(
                "This customer has no email address on file.",
                field_errors=[{"field": "email", "issue": "required to send via email"}],
            )

        quote_url = _hosted_quote_url(quote.share_token)
        html_body = (
            f"<p>Hi {customer.name},</p>"
            f"<p>Please find your quote from <b>{user.business_name}</b> for "
            f"<b>${quote.total:,.2f}</b>.</p>"
            f'<p><a href="{quote_url}">View your quote online</a></p>'
            f"<p>This quote is valid until {quote.valid_until.isoformat() if quote.valid_until else 'further notice'}.</p>"
        )

        await self.email_client.send_quote_email(
            to_email=customer.email,
            subject=f"Quote from {user.business_name}",
            html_body=html_body,
            pdf_bytes=pdf_bytes,
            pdf_filename=f"quote-{quote.id}.pdf",
        )

    def build_whatsapp_link(self, *, quote: Quote, user: User, customer: Customer) -> str:
        quote_url = _hosted_quote_url(quote.share_token)
        return self.whatsapp_client.build_share_link(
            phone=customer.phone,
            business_name=user.business_name,
            total=f"${quote.total:,.2f}",
            quote_url=quote_url,
        )


_notification_service: NotificationService | None = None


def get_notification_service() -> NotificationService:
    global _notification_service
    if _notification_service is None:
        from app.integrations.email_client import get_email_client
        from app.integrations.whatsapp_client import get_whatsapp_client

        _notification_service = NotificationService(get_email_client(), get_whatsapp_client())
    return _notification_service
