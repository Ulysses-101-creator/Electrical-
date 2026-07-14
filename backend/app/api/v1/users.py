"""User profile / business settings endpoints."""

from __future__ import annotations

from fastapi import APIRouter, UploadFile

from app.api.deps import CurrentUser, DBSession
from app.core.exceptions import PayloadTooLargeError, UnsupportedMediaTypeError
from app.integrations.storage_client import get_storage_client
from app.lib_validation import validate_file_upload
from app.schemas.user import LogoUploadResponse, UserRead, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["users"])

MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024


@router.get("/me", response_model=UserRead)
async def get_me(current_user: CurrentUser):
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead)
async def update_me(payload: UserUpdateRequest, current_user: CurrentUser, session: DBSession):
    if payload.business_name is not None:
        current_user.business_name = payload.business_name
    if payload.default_labor_rate is not None:
        current_user.default_labor_rate = payload.default_labor_rate
    if payload.default_callout_fee is not None:
        current_user.default_callout_fee = payload.default_callout_fee
    if payload.default_tax_rate is not None:
        current_user.default_tax_rate = payload.default_tax_rate
    if payload.default_material_markup_pct is not None:
        current_user.default_material_markup_pct = payload.default_material_markup_pct

    await session.commit()
    return UserRead.model_validate(current_user)


@router.post("/me/logo", response_model=LogoUploadResponse)
async def upload_logo(file: UploadFile, current_user: CurrentUser, session: DBSession):
    content = await file.read()
    if not file.content_type:
        raise UnsupportedMediaTypeError("Missing content type")
    validate_file_upload(
        content_type=file.content_type,
        size_bytes=len(content),
        max_size_bytes=MAX_LOGO_SIZE_BYTES,
    )
    if len(content) > MAX_LOGO_SIZE_BYTES:
        raise PayloadTooLargeError("Logo file exceeds 5MB")

    storage_client = get_storage_client()
    key = storage_client.build_key(
        prefix=f"users/{current_user.id}/logo", filename=file.filename or "logo.png"
    )
    logo_url = await storage_client.upload_bytes(
        key=key, data=content, content_type=file.content_type
    )
    current_user.logo_url = logo_url
    await session.commit()
    return LogoUploadResponse(logo_url=logo_url)
