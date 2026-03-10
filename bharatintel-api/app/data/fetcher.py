import httpx
import structlog
import json
import hashlib
import asyncio
from typing import Any, Optional, Dict
from app.cache.redis_client import get_redis_client
from app.config import settings

logger = structlog.get_logger()


class DataFetcher:
    """
    Base class for ALL external data source calls.
    NEVER call httpx directly from business logic — always use this class.
    Handles: caching, retries with exponential backoff, graceful degradation.
    """

    def __init__(self, base_url: str, source_name: str, timeout: float = 10.0):
        self.base_url = base_url
        self.source_name = source_name
        self.client = httpx.AsyncClient(
            base_url=base_url,
            timeout=timeout,
            follow_redirects=True,
            headers={"User-Agent": "BharatIntel-API/0.1 (+https://ppventures.tech)"},
        )

    def _cache_key(self, endpoint: str, params: Dict) -> str:
        raw = f"{self.source_name}:{endpoint}:{json.dumps(params, sort_keys=True)}"
        return f"fetch:{hashlib.md5(raw.encode()).hexdigest()}"

    async def get(
        self,
        endpoint: str,
        params: Dict = {},
        cache_ttl: int = settings.CACHE_TTL_SECONDS,
        retries: int = 3,
    ) -> Optional[Dict[str, Any]]:
        cache_key = self._cache_key(endpoint, params)

        redis_client = get_redis_client()
        
        # Cache check
        cached = await redis_client.get(cache_key)
        if cached:
            logger.debug("cache_hit", source=self.source_name, endpoint=endpoint)
            return json.loads(cached)

        # Fetch with retry + exponential backoff
        last_error = None
        for attempt in range(retries):
            try:
                resp = await self.client.get(endpoint, params=params)
                resp.raise_for_status()
                data = resp.json()
                await redis_client.setex(cache_key, cache_ttl, json.dumps(data))
                return data
            except httpx.HTTPStatusError as e:
                logger.warning("fetch_http_error",
                    source=self.source_name, status=e.response.status_code, attempt=attempt + 1)
                last_error = e
                if e.response.status_code < 500:
                    break  # Never retry 4xx
            except Exception as e:
                logger.warning("fetch_error",
                    source=self.source_name, error=str(e), attempt=attempt + 1)
                last_error = e

            if attempt < retries - 1:
                await asyncio.sleep(0.5 * (2 ** attempt))  # 0.5s, 1s, 2s

        logger.error("fetch_failed_all_retries",
            source=self.source_name, error=str(last_error))
        return None  # ALWAYS return None — never raise — caller handles degraded state

    async def post(
        self,
        endpoint: str,
        body: Dict = {},
        headers: Dict = {},
        cache_ttl: int = 0,
    ) -> Optional[Dict[str, Any]]:
        cache_key = self._cache_key(endpoint, body)

        redis_client = get_redis_client()

        if cache_ttl > 0:
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

        try:
            resp = await self.client.post(endpoint, json=body, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            if cache_ttl > 0:
                await redis_client.setex(cache_key, cache_ttl, json.dumps(data))
            return data
        except Exception as e:
            logger.error("post_failed", source=self.source_name, error=str(e))
            return None
