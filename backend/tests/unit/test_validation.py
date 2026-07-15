import pytest

from app.core.exceptions import (
    PayloadTooLargeError,
    UnsupportedMediaTypeError,
    ValidationAppError,
)
from app.lib_validation import (
    validate_file_upload,
    validate_password_strength,
    validate_phone_number,
)


def test_validate_phone_number_accepts_valid_number():
    assert validate_phone_number("+1 415-555-0132") == "+14155550132"


def test_validate_phone_number_rejects_too_short():
    with pytest.raises(ValidationAppError):
        validate_phone_number("123")


def test_validate_phone_number_rejects_letters():
    with pytest.raises(ValidationAppError):
        validate_phone_number("not-a-phone")


def test_validate_password_strength_rejects_short():
    with pytest.raises(ValidationAppError):
        validate_password_strength("Ab1")


def test_validate_password_strength_rejects_no_digit():
    with pytest.raises(ValidationAppError):
        validate_password_strength("abcdefgh")


def test_validate_password_strength_rejects_no_letter():
    with pytest.raises(ValidationAppError):
        validate_password_strength("12345678")


def test_validate_password_strength_rejects_common_password():
    with pytest.raises(ValidationAppError):
        validate_password_strength("password1")


def test_validate_password_strength_accepts_valid_password():
    validate_password_strength("Sup3rSecret")  # should not raise


def test_validate_file_upload_rejects_bad_content_type():
    with pytest.raises(UnsupportedMediaTypeError):
        validate_file_upload(
            content_type="application/pdf", size_bytes=1000, max_size_bytes=5_000_000
        )


def test_validate_file_upload_rejects_oversized_file():
    with pytest.raises(PayloadTooLargeError):
        validate_file_upload(
            content_type="image/png", size_bytes=10_000_000, max_size_bytes=5_000_000
        )


def test_validate_file_upload_accepts_valid_image():
    validate_file_upload(content_type="image/jpeg", size_bytes=1_000_000, max_size_bytes=5_000_000)
