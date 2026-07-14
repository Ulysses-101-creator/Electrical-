"""FastAPI dependency providers.

Wires repositories and services together per-request using FastAPI's
dependency injection, so route handlers never construct these directly.
Keeps route handlers thin and every layer swappable/testable.
"""

from __future__ import annotations

import uuid
from typing import Annotated

import jwt
from fastapi import Depends, Header
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import UnauthorizedError
from app.core.logging import user_id_ctx
from app.core.rate_limit import get_redis
from app.core.security import decode_access_token
from app.db.session import get_db_session
from app.integrations.claude_client import ClaudeClient, get_claude_client
from app.integrations.email_client import EmailClient, get_email_client
from app.integrations.sms_client import SMSClient, get_sms_client
from app.integrations.storage_client import StorageClient, get_storage_client
from app.integrations.whatsapp_client import WhatsAppClient, get_whatsapp_client
from app.models.user import User
from app.repositories.customer_repository import CustomerRepository
from app.repositories.quote_repository import QuoteRepository
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.services.ai_service import AIService
from app.services.audit_service import AuditService
from app.services.auth_service import AuthService
from app.services.customer_service import CustomerService
from app.services.notification_service import NotificationService
from app.services.pdf_service import PDFService
from app.services.quote_service import QuoteService

# --- Infra-level dependencies ---

DBSession = Annotated[AsyncSession, Depends(get_db_session)]


def get_redis_dependency() -> Redis:
    return get_redis()


RedisDep = Annotated[Redis, Depends(get_redis_dependency)]


# --- Repositories ---


def get_user_repository(session: DBSession) -> UserRepository:
    return UserRepository(session)


def get_session_repository(session: DBSession) -> SessionRepository:
    return SessionRepository(session)


def get_customer_repository(session: DBSession) -> CustomerRepository:
    return CustomerRepository(session)


def get_quote_repository(session: DBSession) -> QuoteRepository:
    return QuoteRepository(session)


UserRepo = Annotated[UserRepository, Depends(get_user_repository)]
SessionRepo = Annotated[SessionRepository, Depends(get_session_repository)]
CustomerRepo = Annotated[CustomerRepository, Depends(get_customer_repository)]
QuoteRepo = Annotated[QuoteRepository, Depends(get_quote_repository)]


# --- Integration clients (process-level singletons) ---


def get_sms_client_dependency() -> SMSClient:
    return get_sms_client()


def get_email_client_dependency() -> EmailClient:
    return get_email_client()


def get_whatsapp_client_dependency() -> WhatsAppClient:
    return get_whatsapp_client()


def get_claude_client_dependency() -> ClaudeClient:
    return get_claude_client()


def get_storage_client_dependency() -> StorageClient:
    return get_storage_client()


# --- Services ---


def get_auth_service(
    user_repo: UserRepo,
    session_repo: SessionRepo,
    redis: RedisDep,
    sms_client: Annotated[SMSClient, Depends(get_sms_client_dependency)],
) -> AuthService:
    return AuthService(user_repo, session_repo, redis, sms_client)


def get_customer_service(customer_repo: CustomerRepo, quote_repo: QuoteRepo) -> CustomerService:
    return CustomerService(customer_repo, quote_repo)


def get_quote_service(quote_repo: QuoteRepo, customer_repo: CustomerRepo) -> QuoteService:
    return QuoteService(quote_repo, customer_repo)


def get_ai_service_dependency(
    claude_client: Annotated[ClaudeClient, Depends(get_claude_client_dependency)],
) -> AIService:
    return AIService(claude_client)


def get_pdf_service_dependency(
    storage_client: Annotated[StorageClient, Depends(get_storage_client_dependency)],
) -> PDFService:
    return PDFService(storage_client)


def get_notification_service_dependency(
    email_client: Annotated[EmailClient, Depends(get_email_client_dependency)],
    whatsapp_client: Annotated[WhatsAppClient, Depends(get_whatsapp_client_dependency)],
) -> NotificationService:
    return NotificationService(email_client, whatsapp_client)


def get_audit_service(session: DBSession) -> AuditService:
    return AuditService(session)


AuthSvc = Annotated[AuthService, Depends(get_auth_service)]
CustomerSvc = Annotated[CustomerService, Depends(get_customer_service)]
QuoteSvc = Annotated[QuoteService, Depends(get_quote_service)]
AISvc = Annotated[AIService, Depends(get_ai_service_dependency)]
PDFSvc = Annotated[PDFService, Depends(get_pdf_service_dependency)]
NotificationSvc = Annotated[NotificationService, Depends(get_notification_service_dependency)]
AuditSvc = Annotated[AuditService, Depends(get_audit_service)]


# --- Authentication ---


async def get_current_user(
    user_repo: UserRepo,
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Missing or malformed Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError as exc:
        raise UnauthorizedError("Access token has expired") from exc
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("Invalid access token") from exc

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Invalid access token")

    user = await user_repo.get_by_id(uuid.UUID(user_id_str))
    if user is None or user.deleted_at is not None:
        raise UnauthorizedError("Account no longer exists")

    # Populate structured-logging context now that we know who the user is.
    user_id_ctx.set(str(user.id))
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
