from fastapi import APIRouter, Depends, Query
from app.schemas.base import BaseResponse
from app.core.regradar.feeds import get_latest_logic
from app.middleware.auth import validate_api_key
from app.middleware.rate_limit import check_rate_limit
from app.db.models.api_key import APIKey
import time

router = APIRouter(tags=["RegRadar"])


@router.get("/latest", response_model=BaseResponse,
    summary="Latest Regulatory Updates",
    description="Live RBI and SEBI circulars with impact scores. Falls back to Tavily if RSS unavailable.")
async def get_latest(
    regulators: str = Query(default="RBI,SEBI", description="Comma-separated: RBI, SEBI, MCA"),
    limit: int = Query(default=10, ge=1, le=50),
    key_obj: APIKey = Depends(validate_api_key),
):
    start = time.monotonic()
    await check_rate_limit(key_obj, credits=1)
    reg_list = [r.strip().upper() for r in regulators.split(",")]
    result = await get_latest_logic(reg_list, limit)
    result.latency_ms = round((time.monotonic() - start) * 1000, 2)
    return result
