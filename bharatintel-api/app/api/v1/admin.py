import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models.api_key import APIKey, PlanTier
from app.schemas.admin import CreateKeyRequest, KeyResponse, UsageResponse
from app.config import settings

router = APIRouter(tags=["Admin"])


def _generate_key() -> str:
    return f"{settings.API_KEY_PREFIX}{secrets.token_hex(24)}"


@router.post("/keys", response_model=KeyResponse, summary="Create API Key")
async def create_key(body: CreateKeyRequest, db: AsyncSession = Depends(get_db)):
    key = _generate_key()
    key_obj = APIKey(
        key=key, name=body.name, email=body.email,
        organisation=body.organisation, plan=body.plan or PlanTier.STARTER,
    )
    db.add(key_obj)
    await db.commit()
    await db.refresh(key_obj)
    return KeyResponse(key=key, plan=key_obj.plan, created_at=key_obj.created_at)


@router.get("/keys/{key}/usage", response_model=UsageResponse)
async def get_usage(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(APIKey).where(APIKey.key == key))
    key_obj = result.scalar_one_or_none()
    if not key_obj:
        raise HTTPException(404, "Key not found")
    limit = getattr(settings, f"RATE_LIMIT_{key_obj.plan.value.upper()}", 2000)
    return UsageResponse(
        plan=key_obj.plan,
        calls_this_month=key_obj.calls_this_month,
        total_calls=key_obj.total_calls,
        limit=limit,
        remaining=max(0, limit - key_obj.calls_this_month),
    )


@router.delete("/keys/{key}")
async def revoke_key(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(APIKey).where(APIKey.key == key))
    key_obj = result.scalar_one_or_none()
    if not key_obj:
        raise HTTPException(404, "Key not found")
    key_obj.is_active = False
    await db.commit()
    return {"status": "revoked", "key": key[:22] + "..."}
