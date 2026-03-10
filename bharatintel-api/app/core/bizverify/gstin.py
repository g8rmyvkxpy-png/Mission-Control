from app.data.sources.gstn_public import GSTNPublicFetcher
from app.core.ai_summary.summariser import generate_summary
from app.schemas.base import BaseResponse, ResponseStatus
from app.schemas.biz import GSTINData

fetcher = GSTNPublicFetcher()


async def verify_gstin_logic(gstin: str, include_filing: bool = False) -> BaseResponse:
    raw = await fetcher.verify_gstin(gstin)
    degraded = not raw or raw.get("legal_name") == "Source temporarily unavailable"
    data = GSTINData(**(raw or {"gstin": gstin, "legal_name": "Unavailable", "status": "Unknown"}))
    summary = await generate_summary("BizVerify/GSTIN", raw or {}, context=f"GSTIN: {gstin}")
    return BaseResponse(
        status=ResponseStatus.DEGRADED if degraded else ResponseStatus.SUCCESS,
        module="BizVerify / GSTIN",
        data=data, ai_summary=summary,
        confidence=0.3 if degraded else 0.92,
        sources=["gstn.gov.in"],
        credits_used=1, latency_ms=0,
        degraded=degraded,
        degraded_reason="GSTN source temporarily unavailable" if degraded else None,
    )
