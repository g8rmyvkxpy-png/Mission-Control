from fastapi import Request, HTTPException, Depends
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models.api_key import APIKey
from app.cache.redis_client import get_redis_client
import structlog

logger = structlog.get_logger()
API_KEY_HEADER = APIKeyHeader(name="X-BharatIntel-Key", auto_error=False)


async def validate_api_key(
    api_key: str = Depends(API_KEY_HEADER),
    db: AsyncSession = Depends(get_db),
) -> APIKey:
    if not api_key:
        raise HTTPException(status_code=401, detail={
            "code": "MISSING_API_KEY",
            "message": "Provide your API key in the X-BharatIntel-Key header"
        })

    redis_client = get_redis_client()

    # Check Redis cache first (avoids DB hit on every request)
    cache_key = f"apikey:{api_key}"
    cached_plan = await redis_client.get(cache_key)

    if cached_plan == "invalid":
        raise HTTPException(status_code=401, detail={
            "code": "INVALID_API_KEY",
            "message": "API key not found or deactivated"
        })

    # DB lookup
    result = await db.execute(
        select(APIKey).where(APIKey.key == api_key, APIKey.is_active == True)
    )
    key_obj = result.scalar_one_or_none()

    if not key_obj:
        await redis_client.setex(cache_key, 300, "invalid")  # Cache miss for 5 min
        raise HTTPException(status_code=401, detail={
            "code": "INVALID_API_KEY",
            "message": "API key not found or deactivated"
        })

    # Cache valid key for 60 seconds
    await redis_client.setex(cache_key, 60, key_obj.plan.value)
    return key_obj
