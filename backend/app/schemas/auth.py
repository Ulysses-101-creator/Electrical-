from __future__ import annotations

import uuid

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import APIModel
from app.schemas.user import UserRead
from app.lib_validation import validate_password_strength, validate_phone_number


class RegisterRequest(APIModel):
    email: EmailStr | None = None
    phone: str | None = None
    password: str | None = None
    business_name: str = Field(min_length=1, max_length=255)

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str | None) -> str | None:
        return validate_phone_number(v) if v else v

    @field_validator("password")
    @classmethod
    def _validate_password(cls, v: str | None) -> str | None:
        if v is not None:
            validate_password_strength(v)
        return v


class LoginRequest(APIModel):
    email: EmailStr
    password: str = Field(min_length=1)


class OTPRequestRequest(APIModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str) -> str:
        return validate_phone_number(v)


class OTPVerifyRequest(APIModel):
    phone: str
    code: str = Field(min_length=6, max_length=6)


class RefreshRequest(APIModel):
    refresh_token: str


class ForgotPasswordRequest(APIModel):
    email: EmailStr


class ResetPasswordRequest(APIModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def _validate_password(cls, v: str) -> str:
        validate_password_strength(v)
        return v


class TokenPair(APIModel):
    access_token: str
    refresh_token: str


class AuthResponse(TokenPair):
    user: UserRead


class MessageResponse(APIModel):
    message: str
