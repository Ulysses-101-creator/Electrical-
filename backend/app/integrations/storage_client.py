"""S3-compatible object storage client.

Files are stored under non-guessable keys and served via signed, time-limited
URLs (or a public CDN base URL in production), never from a public bucket
listing. See architecture doc Section 6 (Security) - File upload safety.
"""

from __future__ import annotations

import uuid

import boto3
from botocore.client import Config as BotoConfig

from app.core.config import settings


class StorageClient:
    def __init__(self) -> None:
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.STORAGE_ENDPOINT_URL,
            aws_access_key_id=settings.STORAGE_ACCESS_KEY_ID,
            aws_secret_access_key=settings.STORAGE_SECRET_ACCESS_KEY,
            region_name=settings.STORAGE_REGION,
            config=BotoConfig(signature_version="s3v4"),
        )
        self._bucket = settings.STORAGE_BUCKET_NAME

    def build_key(self, *, prefix: str, filename: str) -> str:
        extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
        return f"{prefix}/{uuid.uuid4()}.{extension}"

    async def upload_bytes(self, *, key: str, data: bytes, content_type: str) -> str:
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return self.public_url(key)

    def public_url(self, key: str) -> str:
        if settings.STORAGE_PUBLIC_BASE_URL:
            return f"{settings.STORAGE_PUBLIC_BASE_URL.rstrip('/')}/{key}"
        return self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=3600 * 24 * 7,
        )

    def delete(self, key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=key)


_storage_client: StorageClient | None = None


def get_storage_client() -> StorageClient:
    global _storage_client
    if _storage_client is None:
        _storage_client = StorageClient()
    return _storage_client
