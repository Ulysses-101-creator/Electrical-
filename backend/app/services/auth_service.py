"""Auth service: registration, login, OTP flows, token issuance and refresh.

Business rules live here, not in the API route handlers. Routes validate
input shape (via Pydantic) and delegate everything else to this service.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from redis.asyncio import Redis

from app.core.config import settings
from app.core.exceptions import (
    AccountLockedError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationAppError,
)
from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    generate_otp_code,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.integrations.sms_client import SMSClient
from app.models.session import Session
from app.models.user import User
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest

logger = get_logger(__name__)

_MAX_LOGIN_ATTEMPTS = 10
_LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60
_OTP_TTL_SECONDS = 5 * 60
_OTP_MAX_ATTEMPTS = 5


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        session_repo: SessionRepository,
        redis: Redis,
        sms_client: SMSClient,
    ) -> None:
        self.user_repo = user_repo
        self.session_repo = session_repo
        self.redis = redis
        self.sms_client = sms_client

    # --- Registration ---

    async def register(self, data: RegisterRequest) -> tuple[User, str, str]:
        if not data.email and not data.phone:
            raise ValidationAppError(
                "Either email or phone is required",
                field_errors=[{"field": "email", "issue": "email or phone is required"}],
            )

        if data.email and await self.user_repo.email_exists(data.email):
            raise ConflictError("An account with this email already exists")
        if data.phone and await self.user_repo.phone_exists(data.phone):
            raise ConflictError("An account with this phone number already exists")

        if data.email and not data.password:
            raise ValidationAppError(
                "Password is required for email registration",
                field_errors=[{"field": "password", "issue": "password is required"}],
            )

        user = User(
            email=data.email,
            phone=data.phone,
            password_hash=hash_password(data.password) if data.password else None,
            business_name=data.business_name,
        )
        user = await self.user_repo.add(user)
        await self.user_repo.commit()

        access_token, refresh_token = await self._issue_tokens(user)
        return user, access_token, refresh_token

    # --- Email/password login ---

    async def login(self, email: str, password: str) -> tuple[User, str, str]:
        attempts_key = f"login_attempts:{email.lower()}"
        attempts = int(await self.redis.get(attempts_key) or 0)
        if attempts >= _MAX_LOGIN_ATTEMPTS:
            raise AccountLockedError(
                "Too many failed login attempts. Please try again later."
            )

        user = await self.user_repo.get_by_email(email)
        if not user or not user.password_hash or not verify_password(password, user.password_hash):
            await self.redis.incr(attempts_key)
            await self.redis.expire(attempts_key, _LOGIN_ATTEMPT_WINDOW_SECONDS)
            raise UnauthorizedError("Invalid email or password")

        await self.redis.delete(attempts_key)
        access_token, refresh_token = await self._issue_tokens(user)
        return user, access_token, refresh_token

    # --- Phone/OTP login ---

    async def request_otp(self, phone: str) -> None:
        code = generate_otp_code()
        key = f"otp:{phone}"
        await self.redis.set(key, code, ex=_OTP_TTL_SECONDS)
        await self.redis.delete(f"otp_attempts:{phone}")
        await self.sms_client.send_otp(phone=phone, code=code)
        logger.info("otp_requested", extra={"phone": phone})

    async def verify_otp(self, phone: str, code: str) -> tuple[User, str, str]:
        attempts_key = f"otp_attempts:{phone}"
        attempts = int(await self.redis.get(attempts_key) or 0)
        if attempts >= _OTP_MAX_ATTEMPTS:
            raise AccountLockedError("Too many incorrect attempts. Request a new code.")

        stored_code = await self.redis.get(f"otp:{phone}")
        if not stored_code or stored_code != code:
            await self.redis.incr(attempts_key)
            await self.redis.expire(attempts_key, _OTP_TTL_SECONDS)
            raise UnauthorizedError("Invalid or expired verification code")

        await self.redis.delete(f"otp:{phone}")
        await self.redis.delete(attempts_key)

        user = await self.user_repo.get_by_phone(phone)
        if not user:
            # First-time phone login doubles as registration with a placeholder
            # business name the user completes during onboarding.
            user = User(phone=phone, business_name="My Business")
            user = await self.user_repo.add(user)
            await self.user_repo.commit()

        access_token, refresh_token = await self._issue_tokens(user)
        return user, access_token, refresh_token

    # --- Token issuance / refresh / revocation ---

    async def _issue_tokens(self, user: User, device_info: str | None = None) -> tuple[str, str]:
        access_token = create_access_token(subject=str(user.id))
        raw_refresh_token = generate_refresh_token()

        session = Session(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(raw_refresh_token),
            device_info=device_info,
            expires_at=datetime.now(UTC)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        await self.session_repo.add(session)
        await self.session_repo.commit()

        return access_token, raw_refresh_token

    async def refresh_tokens(self, raw_refresh_token: str) -> tuple[str, str]:
        token_hash = hash_refresh_token(raw_refresh_token)
        session = await self.session_repo.get_by_refresh_token_hash(token_hash)

        if not session or not self.session_repo.is_valid(session):
            raise UnauthorizedError("Invalid or expired refresh token")

        user = await self.user_repo.get_by_id(session.user_id)
        if not user:
            raise UnauthorizedError("Invalid or expired refresh token")

        # Rotate: revoke the old session, issue a new one.
        await self.session_repo.revoke(session)
        access_token, new_refresh_token = await self._issue_tokens(user, session.device_info)
        return access_token, new_refresh_token

    async def logout(self, raw_refresh_token: str) -> None:
        token_hash = hash_refresh_token(raw_refresh_token)
        session = await self.session_repo.get_by_refresh_token_hash(token_hash)
        if session:
            await self.session_repo.revoke(session)
            await self.session_repo.commit()

    # --- Password reset ---

    async def request_password_reset(self, email: str) -> None:
        user = await self.user_repo.get_by_email(email)
        if not user:
            # Do not reveal account existence.
            return
        reset_token = generate_refresh_token()
        await self.redis.set(
            f"password_reset:{reset_token}", str(user.id), ex=15 * 60
        )
        logger.info("password_reset_requested", extra={"user_id": str(user.id)})
        # NOTE: dispatch via EmailClient in the API layer/notification service.

    async def reset_password(self, token: str, new_password: str) -> None:
        user_id_str = await self.redis.get(f"password_reset:{token}")
        if not user_id_str:
            raise ValidationAppError("Invalid or expired reset token")

        user = await self.user_repo.get_by_id(uuid.UUID(user_id_str))
        if not user:
            raise NotFoundError("Account not found")

        user.password_hash = hash_password(new_password)
        await self.user_repo.commit()
        await self.redis.delete(f"password_reset:{token}")
        await self.session_repo.revoke_all_for_user(user.id)
        await self.session_repo.commit()
