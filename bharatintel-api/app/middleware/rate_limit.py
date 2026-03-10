from fastapi import HTTPException
from app.cache.redis_client import get_redis_client
from app.db.models.api_key import APIKey, PlanTier
from app.config import settings
from datetime import datetime

PLAN_LIMITS = {
    PlanTier.STARTER: settings.RATE_LIMIT_STARTER,
    PlanTier.BUILDER: settings.RATE_LIMIT_BUILDER,
    PlanTier.GROWTH: settings.RATE_LIMIT_GROWTH,
    PlanTier.ENTERPRISE: 999_999_999,
}


async def check_rate_limit(key_obj: APIKey, credits: int = 1):
    """Atomic rate limit check using Redis pipeline. MUST be called at start of every endpoint."""
    redis_client = get_redis_client()
    month_key = f"ratelimit:{key_obj.key}:{datetime.utcnow().strftime('%Y-%m')}"
    limit = PLAN_LIMITS[key_obj.plan]

    pipe = redis_client.pipeline()
    pipe.incrby(month_key, credits)
    pipe.expire(month_key, 35 * 24 * 3600)  # 35-day TTL
    results = await pipe.execute()
    current_usage = results[0]

    if current_usage > limit:
        raise HTTPException(status_code=429, detail={
            "code": "RATE_LIMIT_EXCEEDED",
            "message": f"Monthly limit of {limit:,} calls reached. Upgrade at ppventures.tech/pricing",
            "current": current_usage,
            "limit": limit,
            "reset": "1st of next month (IST)"
        })

    return current_usage
