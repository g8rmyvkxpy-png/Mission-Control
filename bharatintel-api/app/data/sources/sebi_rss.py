import feedparser
import json
import structlog
from app.cache.redis_client import get_redis_client
from app.config import settings

logger = structlog.get_logger()


class SEBIFeedFetcher:
    FEED_URL = "https://www.sebi.gov.in/sebirss.xml"

    async def fetch_latest(self, n: int = 10) -> list[dict]:
        cache_key = "sebi_feed:latest"
        cached = await get_redis_client().get(cache_key)
        if cached:
            return json.loads(cached)[:n]

        try:
            feed = feedparser.parse(self.FEED_URL)
            items = []
            for entry in feed.entries[:25]:
                title = entry.get("title", "")
                items.append({
                    "external_id": entry.get("id", entry.get("link", title[:50])),
                    "regulator": "SEBI",
                    "category": self._categorise(title),
                    "title": title,
                    "url": entry.get("link", ""),
                    "published_at": entry.get("published", ""),
                    "impact_score": self._score(title),
                    "tags": self._tags(title),
                    "summary": entry.get("summary", "")[:500],
                })
            if items:
                await get_redis_client().setex(
                    cache_key, settings.CACHE_TTL_REG_SECONDS, json.dumps(items)
                )
            return items[:n]
        except Exception as e:
            logger.error("sebi_feed_failed", error=str(e))
            return []

    def _categorise(self, title: str) -> str:
        tl = title.lower()
        if "circular" in tl: return "circular"
        if "order" in tl: return "order"
        if "notification" in tl: return "notification"
        return "press_release"

    def _score(self, title: str) -> float:
        high = ["penalty", "enforcement", "insider trading", "fraud", "order"]
        return 8.5 if any(k in title.lower() for k in high) else 6.0

    def _tags(self, title: str) -> list[str]:
        tag_map = {
            "Mutual Funds": ["mutual fund", "mf", "scheme"],
            "IPO": ["ipo", "public issue", "listing"],
            "Brokers": ["broker", "intermediary", "trading member"],
            "Insider Trading": ["insider", "upsi"],
            "ESG": ["esg", "sustainability"],
        }
        tl = title.lower()
        return [t for t, kws in tag_map.items() if any(k in tl for k in kws)]
