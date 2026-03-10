from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.db.models.api_key import PlanTier


class CreateKeyRequest(BaseModel):
    name: str
    email: str  # Use str not EmailStr to avoid extra dep
    organisation: Optional[str] = None
    plan: Optional[PlanTier] = PlanTier.STARTER


class KeyResponse(BaseModel):
    key: str
    plan: PlanTier
    created_at: datetime


class UsageResponse(BaseModel):
    plan: PlanTier
    calls_this_month: int
    total_calls: int
    limit: int
    remaining: int
