from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from app.models.session import Session
from app.repositories.base_repository import BaseRepository


class SessionRepository(BaseRepository[Session]):
    model = Session

    async def get_by_refresh_token_hash(self, token_hash: str) -> Session | None:
        result = await self.session.execute(
            select(Session).where(Session.refresh_token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def revoke(self, session: Session) -> None:
        session.revoked_at = datetime.now(timezone.utc)
        await self.session.flush()

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> None:
        result = await self.session.execute(
            select(Session).where(Session.user_id == user_id, Session.revoked_at.is_(None))
        )
        now = datetime.now(timezone.utc)
        for sess in result.scalars().all():
            sess.revoked_at = now
        await self.session.flush()

    def is_valid(self, session: Session) -> bool:
        now = datetime.now(timezone.utc)
        return session.revoked_at is None and session.expires_at > now
