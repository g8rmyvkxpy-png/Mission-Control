import anthropic
import hashlib
import json
import structlog
from app.config import settings
from app.cache.redis_client import get_redis_client

logger = structlog.get_logger()
_client = None


def _get_client():
    global _client
    if _client is None and settings.ANTHROPIC_API_KEY:
        _client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


SYSTEM_PROMPT = (
    "You are a data summariser for BharatIntel API, India's AI agent data layer. "
    "Given structured Indian business, legal, or regulatory data, write a single "
    "paragraph of 50-120 words summarising the key facts for an AI agent to act on. "
    "Be factual and specific. Include the most important numbers, dates, and status flags. "
    "End with a risk or action signal such as: low risk, flag for review, or immediate action required. "
    "No markdown. No bullet points. Plain prose only."
)


async def generate_summary(module: str, data: dict, context: str = "") -> str:
    if not settings.LLM_SUMMARY_ENABLED or not settings.ANTHROPIC_API_KEY:
        return _fallback(module, data)

    cache_key = f"summary:{hashlib.md5(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()}"
    cached = await get_redis_client().get(cache_key)
    if cached:
        return cached

    client = _get_client()
    if not client:
        return _fallback(module, data)

    prompt = f"Module: {module}\nContext: {context}\nData:\n{json.dumps(data, indent=2, default=str)}"
    try:
        msg = await client.messages.create(
            model=settings.LLM_MODEL,
            max_tokens=settings.LLM_MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        summary = msg.content[0].text.strip()
        await get_redis_client().setex(cache_key, 21600, summary)
        return summary
    except Exception as e:
        logger.error("summary_failed", module=module, error=str(e))
        return _fallback(module, data)


def _fallback(module: str, data: dict) -> str:
    if "legal_name" in data:
        return (f"{data.get('legal_name', 'Entity')} — GSTIN status: "
                f"{data.get('status', 'unknown')}. State: {data.get('state', 'N/A')}. "
                f"AI summary temporarily unavailable — review raw data.")
    if "company_name" in data:
        return (f"{data.get('company_name')} is {data.get('status', 'unknown')}. "
                f"Incorporated: {data.get('incorporated', 'N/A')}. "
                f"AI summary temporarily unavailable — review raw data.")
    if "updates" in data or "total_items" in data:
        return (f"{data.get('total_items', 0)} regulatory updates retrieved. "
                f"AI summary temporarily unavailable — review raw data.")
    return f"[{module}] Data retrieved. AI summary unavailable — review raw data field."
