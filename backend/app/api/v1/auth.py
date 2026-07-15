"""Auth endpoints: register, login, OTP, refresh, logout, password reset."""

from __future__ import annotations

from fastapi import APIRouter, Request, status

from app.api.deps import AuthSvc
from app.core.config import settings
from app.core.rate_limit import client_identifier, enforce_rate_limit
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    OTPRequestRequest,
    OTPVerifyRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
)
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, request: Request, auth_service: AuthSvc):
    await enforce_rate_limit(
        scope="auth_register",
        identifier=client_identifier(request),
        limit_per_minute=settings.RATE_LIMIT_AUTH_PER_MINUTE,
    )
    user, access_token, refresh_token = await auth_service.register(payload)
    return AuthResponse(
        access_token=access_token, refresh_token=refresh_token, user=UserRead.model_validate(user)
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, request: Request, auth_service: AuthSvc):
    await enforce_rate_limit(
        scope="auth_login",
        identifier=client_identifier(request),
        limit_per_minute=settings.RATE_LIMIT_AUTH_PER_MINUTE,
    )
    user, access_token, refresh_token = await auth_service.login(payload.email, payload.password)
    return AuthResponse(
        access_token=access_token, refresh_token=refresh_token, user=UserRead.model_validate(user)
    )


@router.post("/otp/request", response_model=MessageResponse)
async def request_otp(payload: OTPRequestRequest, request: Request, auth_service: AuthSvc):
    await enforce_rate_limit(
        scope="auth_otp_request",
        identifier=payload.phone,
        limit_per_minute=settings.RATE_LIMIT_AUTH_PER_MINUTE,
    )
    await auth_service.request_otp(payload.phone)
    return MessageResponse(message="OTP sent")


@router.post("/otp/verify", response_model=AuthResponse)
async def verify_otp(payload: OTPVerifyRequest, request: Request, auth_service: AuthSvc):
    await enforce_rate_limit(
        scope="auth_otp_verify",
        identifier=payload.phone,
        limit_per_minute=settings.RATE_LIMIT_AUTH_PER_MINUTE,
    )
    user, access_token, refresh_token = await auth_service.verify_otp(payload.phone, payload.code)
    return AuthResponse(
        access_token=access_token, refresh_token=refresh_token, user=UserRead.model_validate(user)
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, auth_service: AuthSvc):
    access_token, refresh_token = await auth_service.refresh_tokens(payload.refresh_token)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: RefreshRequest, auth_service: AuthSvc):
    await auth_service.logout(payload.refresh_token)


@router.post("/password/forgot", response_model=MessageResponse)
async def forgot_password(payload: ForgotPasswordRequest, request: Request, auth_service: AuthSvc):
    await enforce_rate_limit(
        scope="auth_password_forgot",
        identifier=client_identifier(request),
        limit_per_minute=settings.RATE_LIMIT_AUTH_PER_MINUTE,
    )
    await auth_service.request_password_reset(payload.email)
    return MessageResponse(message="If the account exists, a reset link was sent")


@router.post("/password/reset", response_model=MessageResponse)
async def reset_password(payload: ResetPasswordRequest, auth_service: AuthSvc):
    await auth_service.reset_password(payload.token, payload.new_password)
    return MessageResponse(message="Password updated")
