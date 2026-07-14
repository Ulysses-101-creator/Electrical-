"""SMS/OTP delivery client. Provider-agnostic HTTP interface (e.g. Twilio-style)."""

from __future__ import annotations

import httpx

from app.core.config import settings
from app.core.exceptions import UpstreamServiceError
from app.core.logging import get_logger

logger = get_logger(__name__)


class SMSClient:
    async def send_otp(self, *, phone: str, code: str) -> None:
        if not settings.SMS_PROVIDER_API_KEY:
            # Local/dev fallback: log instead of sending (never do this in production).
            logger.info("otp_dev_fallback", extra={"phone": phone})
            return

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    "https://api.sms-provider.example.com/v1/messages",
                    json={
                        "to": phone,
                        "from": settings.SMS_PROVIDER_FROM_NUMBER,
                        "body": f"Your ElectricQuote AI verification code is {code}",
                    },
                    headers={"Authorization": f"Bearer {settings.SMS_PROVIDER_API_KEY}"},
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                logger.warning("sms_send_failed", extra={"phone": phone, "error": str(exc)})
                raise UpstreamServiceError("Failed to send verification code.") from exc


_sms_client: SMSClient | None = None


def get_sms_client() -> SMSClient:
    global _sms_client
    if _sms_client is None:
        _sms_client = SMSClient()
    return _sms_client
