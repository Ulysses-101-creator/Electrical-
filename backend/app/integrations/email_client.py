"""Transactional email client.

V1 uses a generic HTTP-based provider interface (Postmark/SES-style) via
httpx, kept intentionally provider-agnostic so swapping providers later is a
config change, not a rewrite of call sites.
"""

from __future__ import annotations

import httpx

from app.core.config import settings
from app.core.exceptions import UpstreamServiceError
from app.core.logging import get_logger

logger = get_logger(__name__)

_PROVIDER_API_URL = "https://api.postmarkapp.com/email"


class EmailClient:
    async def send_quote_email(
        self,
        *,
        to_email: str,
        subject: str,
        html_body: str,
        pdf_bytes: bytes | None = None,
        pdf_filename: str = "quote.pdf",
    ) -> None:
        payload: dict = {
            "From": settings.EMAIL_FROM_ADDRESS,
            "To": to_email,
            "Subject": subject,
            "HtmlBody": html_body,
        }
        if pdf_bytes:
            import base64

            payload["Attachments"] = [
                {
                    "Name": pdf_filename,
                    "Content": base64.b64encode(pdf_bytes).decode(),
                    "ContentType": "application/pdf",
                }
            ]

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    _PROVIDER_API_URL,
                    json=payload,
                    headers={
                        "X-Postmark-Server-Token": settings.EMAIL_PROVIDER_API_KEY,
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                logger.warning("email_send_failed", extra={"to": to_email, "error": str(exc)})
                raise UpstreamServiceError("Failed to send email. Please try again.") from exc


_email_client: EmailClient | None = None


def get_email_client() -> EmailClient:
    global _email_client
    if _email_client is None:
        _email_client = EmailClient()
    return _email_client
