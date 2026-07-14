from app.domain.quotes.status_rules import (
    can_edit_without_confirmation,
    can_hard_delete,
    is_valid_transition,
)


def test_draft_can_transition_to_sent():
    assert is_valid_transition("draft", "sent") is True


def test_draft_cannot_transition_to_accepted_directly():
    assert is_valid_transition("draft", "accepted") is False


def test_sent_can_transition_to_accepted_declined_or_expired():
    assert is_valid_transition("sent", "accepted") is True
    assert is_valid_transition("sent", "declined") is True
    assert is_valid_transition("sent", "expired") is True


def test_accepted_is_terminal():
    assert is_valid_transition("accepted", "sent") is False
    assert is_valid_transition("accepted", "declined") is False


def test_same_status_is_always_valid_transition():
    assert is_valid_transition("draft", "draft") is True
    assert is_valid_transition("accepted", "accepted") is True


def test_only_draft_quotes_can_be_hard_deleted():
    assert can_hard_delete("draft") is True
    assert can_hard_delete("sent") is False
    assert can_hard_delete("accepted") is False


def test_accepted_quotes_require_confirmation_to_edit():
    assert can_edit_without_confirmation("accepted") is False
    assert can_edit_without_confirmation("draft") is True
    assert can_edit_without_confirmation("sent") is True
