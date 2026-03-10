from app.data.sources.mca_v3 import MCAV3Fetcher
from app.core.ai_summary.summariser import generate_summary
from app.schemas.base import BaseResponse, ResponseStatus
from app.schemas.biz import CompanyData

fetcher = MCAV3Fetcher()


async def search_company_logic(query: str, query_type: str = "name") -> BaseResponse:
    raw = await (fetcher.search_by_cin(query) if query_type == "cin"
                 else fetcher.search_by_name(query))
    degraded = raw is None
    data = CompanyData(**(raw or {"company_name": query, "status": "Unavailable"}))
    summary = (await generate_summary("BizVerify/Company", raw, context=f"Company: {query}")
               if not degraded else f"MCA data for '{query}' temporarily unavailable.")
    return BaseResponse(
        status=ResponseStatus.DEGRADED if degraded else ResponseStatus.SUCCESS,
        module="BizVerify / Company",
        data=data, ai_summary=summary,
        confidence=0.3 if degraded else 0.94,
        sources=["mca.gov.in"],
        credits_used=2, latency_ms=0,
        degraded=degraded,
        degraded_reason="MCA source temporarily unavailable" if degraded else None,
    )
