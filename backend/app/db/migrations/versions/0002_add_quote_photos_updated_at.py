"""Add missing updated_at column to quote_photos

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-25
"""
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "quote_photos",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("quote_photos", "updated_at")
