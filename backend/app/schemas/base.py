"""Shared Pydantic schema base configuration."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class APIModel(BaseModel):
    """Base class for all API request/response schemas.

    from_attributes=True allows constructing schemas directly from ORM
    model instances (repository -> schema, no manual dict mapping).
    """

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
