from app.data.sources.tavily import TavilyFetcher
from app.core.ai_summary.summariser import generate_summary
from app.schemas.base import BaseResponse, ResponseStatus
from app.schemas.search import SearchData, SearchResult

fetcher = TavilyFetcher()


async def web_search_logic(query: str, language: str = "en", max_results: int = 5) -> BaseResponse:
    raw = await fetcher.search(query, lang=language, n=max_results)
    degraded = raw is None

    if degraded:
        data = SearchData(query=query, language=language, results=[], answer=None)
        summary = f"Web search for '{query}' temporarily unavailable. Please retry shortly."
        confidence = 0.3
    else:
        results = [SearchResult(**r) for r in fetcher.normalise_results(raw, max_results)]
        tavily_answer = fetcher.get_answer(raw)
        data = SearchData(query=query, language=language, results=results, answer=tavily_answer)
        summary = await generate_summary(
            "BharatSearch/Web",
            {"query": query, "tavily_answer": tavily_answer,
             "top_results": fetcher.normalise_results(raw, 3)},
            context=f"Indian web search: {query}",
        )
        confidence = 0.93

    return BaseResponse(
        status=ResponseStatus.DEGRADED if degraded else ResponseStatus.SUCCESS,
        module="BharatSearch / Web",
        data=data, ai_summary=summary,
        confidence=confidence,
        sources=["tavily.com → Indian web index"],
        credits_used=2, latency_ms=0,
        degraded=degraded,
        degraded_reason="Tavily source unavailable" if degraded else None,
    )
