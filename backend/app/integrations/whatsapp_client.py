"""WhatsApp sharing integration.

V1 uses zero-integration-cost `wa.me` deep links (per architecture doc
Section 1). The interface is deliberately narrow so a future swap to the
WhatsApp Business Cloud API requires no changes at call sites.
"""

from __future__ import annotations

from urllib.parse import quote


class WhatsAppClient:
    def build_share_link(
        self, *, phone: str | None, business_name: str, total: str, quote_url: str
    ) -> str:
        message = (
            f"Hi! Here is your quote from {business_name} for {total}. "
            f"View it here: {quote_url}"
        )
        encoded_message = quote(message)
        if phone:
            normalized = phone.lstrip("+")
            return f"https://wa.me/{normalized}?text={encoded_message}"
        return f"https://wa.me/?text={encoded_message}"


_whatsapp_client: WhatsAppClient | None = None


def get_whatsapp_client() -> WhatsAppClient:
    global _whatsapp_client
    if _whatsapp_client is None:
        _whatsapp_client = WhatsAppClient()
    return _whatsapp_client
