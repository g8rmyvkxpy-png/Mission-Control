from fastapi import APIRouter, Depends
from app.schemas.lex import CaseRequest, TrademarkRequest
from app.schemas.base import BaseResponse, ResponseStatus
from app.core.lexintel.cases import search_cases_logic
from app.middleware.auth import validate_api_key
from app.middleware.rate_limit import check_rate_limit
from app.db.models.api_key import APIKey
import time

router = APIRouter(tags=["LexIntel"])


@router.post("/case", response_model=BaseResponse,
    summary="Court Case Search",
    description="Search Indian court cases by party name or CNR number.")
async def search_cases(body: CaseRequest, key_obj: APIKey = Depends(validate_api_key)):
    start = time.monotonic()
    await check_rate_limit(key_obj, credits=3)
    result = await search_cases_logic(body.query, body.court_type)
    result.latency_ms = round((time.monotonic() - start) * 1000, 2)
    return result


@router.post("/trademark", response_model=BaseResponse,
    summary="Trademark Search",
    description="IP India trademark registry search. Full integration in Phase 2.")
async def search_trademark(body: TrademarkRequest, key_obj: APIKey = Depends(validate_api_key)):
    start = time.monotonic()
    await check_rate_limit(key_obj, credits=2)
    return BaseResponse(
        status=ResponseStatus.SUCCESS,
        module="LexIntel / Trademark",
        data={"query": body.query, "results": [], "similar_marks": []},
        ai_summary=(f"Trademark search for '{body.query}' is available in Phase 2. "
                    "Full IP India registry integration is currently in development. "
                    "Flag for manual review via ipindiaonline.gov.in in the meantime."),
        confidence=0.5,
        sources=["ipindiaonline.gov.in"],
        credits_used=2,
        latency_ms=round((time.monotonic() - start) * 1000, 2),
    )
