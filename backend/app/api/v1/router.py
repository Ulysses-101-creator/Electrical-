"""Aggregates all v1 route modules into a single router."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import ai, auth, customers, public, quotes, users

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(customers.router)
api_v1_router.include_router(quotes.router)
api_v1_router.include_router(ai.router)
api_v1_router.include_router(public.router)
