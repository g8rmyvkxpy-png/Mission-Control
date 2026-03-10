import feedparser
import json
import structlog
from app.cache.redis_client import get_redis_client
from app.config import settings

logger = structlog.get_logger()


class RBIFeedFetcher:
    FEED_URLS = {
        "circulars": "https://www.rbi.org.in/Scripts/RSS.aspx?Id=1",
        "press":     "https://www.rbi.org.in/Scripts/RSS.aspx?Id=2",
        "speeches":  "https://www.rbi.org.in/Scripts/RSS.aspx?Id=3",
    }

    IMPACT_KEYWORDS = {
        "repo rate": 9.5, "inflation": 8.5, "interest rate": 9.0,
        "digital lending": 7.5, "nbfc": 7.0, "kyc": 7.0,
        "msme": 6.5, "forex": 6.0, "payment": 6.5, "upi": 7.0,
    }

    async def fetch_latest(self, category: str = "circulars", n: int = 10) -> list[dict]:
        cache_key = f"rbi_feed:{category}"
        cached = await get_redis_client().get(cache_key)
        if cached:
            return json.loads(cached)[:n]

        url = self.FEED_URLS.get(category, self.FEED_URLS["circulars"])
        try:
            feed = feedparser.parse(url)
            items = []
            for entry in feed.entries[:25]:
                title = entry.get("title", "")
                items.append({
                    "external_id": entry.get("id", entry.get("link", title[:50])),
                    "regulator": "RBI",
                    "category": category,
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
            logger.error("rbi_feed_failed", error=str(e))
            return []

    def _score(self, title: str) -> float:
        tl = title.lower()
        for kw, score in self.IMPACT_KEYWORDS.items():
            if kw in tl:
                return score
        return 5.0

    def _tags(self, title: str) -> list[str]:
        tag_map = {
            "NBFC": ["nbfc", "non-banking"],
            "Digital Lending": ["digital lending", "digital loan"],
            "KYC": ["kyc", "know your customer"],
            "MSME": ["msme", "small enterprise"],
            "Forex": ["forex", "foreign exchange", "fema"],
            "Payments": ["payment", "upi", "neft", "rtgs"],
        }
        tl = title.lower()
        return [tag for tag, kws in tag_map.items() if any(k in tl for k in kws)]
