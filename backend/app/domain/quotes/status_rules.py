"""Quote status transition rules.

Encodes the valid state machine for quote.status, independent of persistence.
"""

from __future__ import annotations

_VALID_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"sent"},
    "sent": {"accepted", "declined", "expired"},
    "accepted": set(),  # Terminal in V1; edits require explicit force-confirmation.
    "declined": {"sent"},  # Allows re-sending an updated quote after a decline.
    "expired": {"sent"},  # Allows re-sending (refreshing validity) after expiry.
}


def is_valid_transition(current_status: str, new_status: str) -> bool:
    if current_status == new_status:
        return True
    return new_status in _VALID_TRANSITIONS.get(current_status, set())


def can_hard_delete(status: str) -> bool:
    """Only draft quotes may be permanently deleted."""
    return status == "draft"


def can_edit_without_confirmation(status: str) -> bool:
    return status != "accepted"
