from tavily import AsyncTavilyClient
import json
import hashlib
import structlog
from app.cache.redis_client import get_redis_client
from app.config import settings

logger = structlog.get_logger()


class TavilyFetcher:
    """
    Tavily search — LLM-optimised results with extracted page content.
    Configured for India-biased results on every query.
    """

    def __init__(self):
        self.client = AsyncTavilyClient(api_key=settings.TAVILY_API_KEY)

    async def search(self, query: str, lang: str = "en", n: int = 5) -> dict | None:
        cache_key = f"tavily:{hashlib.md5(f'{query}{lang}{n}'.encode()).hexdigest()}"
        cached = await get_redis_client().get(cache_key)
        if cached:
            return json.loads(cached)

        try:
            response = await self.client.search(
                query=self._augment(query, lang),
                search_depth="advanced",
                max_results=n,
                include_answer=True,
                include_raw_content=False,
                country="IN",
            )
            await get_redis_client().setex(cache_key, 14400, json.dumps(response))
            return response
        except Exception as e:
            logger.error("tavily_search_failed", error=str(e), query=query)
            return None

    async def search_regulatory(self, query: str, regulator: str = "") -> dict | None:
        """Scoped search restricted to official Indian government domains."""
        cache_key = f"tavily:reg:{hashlib.md5(f'{query}{regulator}'.encode()).hexdigest()}"
        cached = await get_redis_client().get(cache_key)
        if cached:
            return json.loads(cached)

        include_domains = [
            "rbi.org.in", "sebi.gov.in", "mca.gov.in", "incometax.gov.in",
            "gst.gov.in", "pib.gov.in", "msme.gov.in", "irdai.gov.in",
            "trai.gov.in", "epfindia.gov.in",
        ]

        try:
            response = await self.client.search(
                query=f"{query} {regulator} India official".strip(),
                search_depth="advanced",
                max_results=5,
                include_answer=True,
                include_domains=include_domains,
                country="IN",
            )
            await get_redis_client().setex(cache_key, 3600, json.dumps(response))
            return response
        except Exception as e:
            logger.error("tavily_reg_search_failed", error=str(e), query=query)
            return None

    def normalise_results(self, raw: dict, n: int) -> list[dict]:
        results = []
        for i, item in enumerate(raw.get("results", [])[:n]):
            results.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "source": self._domain(item.get("url", "")),
                "date": item.get("published_date"),
                "snippet": item.get("content", item.get("snippet", ""))[:400],
                "relevance": item.get("score", max(0.1, 1.0 - i * 0.08)),
            })
        return results

    def get_answer(self, raw: dict) -> str | None:
        return raw.get("answer")

    def _augment(self, query: str, lang: str) -> str:
        q = query.strip()
        if lang == "en" and "india" not in q.lower():
            q = f"{q} India"
        return q

    def _domain(self, url: str) -> str:
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc.replace("www.", "")
        except Exception:
            return url
