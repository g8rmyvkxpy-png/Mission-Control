from app.data.sources.indian_kanoon import IndianKanoonFetcher
from app.core.ai_summary.summariser import generate_summary
from app.schemas.base import BaseResponse, ResponseStatus
from app.schemas.lex import CaseData

fetcher = IndianKanoonFetcher()


async def search_cases_logic(query: str, court_type: str = None) -> BaseResponse:
    raw = await fetcher.search_cases(query, court_type)
    data = CaseData(**(raw or {"query": query, "cases_found": 0, "cases": []}))
    summary = await generate_summary("LexIntel/Cases", raw or {}, context=f"Case query: {query}")
    return BaseResponse(
        status=ResponseStatus.SUCCESS,
        module="LexIntel / Court Cases",
        data=data, ai_summary=summary,
        confidence=0.85,
        sources=["indiankanoon.org", "ecourts.gov.in"],
        credits_used=3, latency_ms=0,
    )
