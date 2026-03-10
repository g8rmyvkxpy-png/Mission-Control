from fastapi import APIRouter, Depends
from app.schemas.search import SearchRequest
from app.schemas.base import BaseResponse
from app.core.bharatsearch.search import web_search_logic
from app.middleware.auth import validate_api_key
from app.middleware.rate_limit import check_rate_limit
from app.db.models.api_key import APIKey
import time

router = APIRouter(tags=["BharatSearch"])


@router.post("/web", response_model=BaseResponse,
    summary="Indian Web Search",
    description="AI-native Indian web search via Tavily. Indic language support included.")
async def web_search(body: SearchRequest, key_obj: APIKey = Depends(validate_api_key)):
    start = time.monotonic()
    await check_rate_limit(key_obj, credits=2)
    result = await web_search_logic(body.query, body.language, body.max_results)
    result.latency_ms = round((time.monotonic() - start) * 1000, 2)
    return result
