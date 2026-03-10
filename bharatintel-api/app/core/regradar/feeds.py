from app.data.sources.rbi_rss import RBIFeedFetcher
from app.data.sources.sebi_rss import SEBIFeedFetcher
from app.core.ai_summary.summariser import generate_summary
from app.schemas.base import BaseResponse, ResponseStatus
from app.schemas.reg import RegData, RegUpdateItem

rbi = RBIFeedFetcher()
sebi = SEBIFeedFetcher()


async def get_latest_logic(regulators: list[str], limit: int = 10) -> BaseResponse:
    all_items = []

    for reg in regulators:
        reg_upper = reg.upper()
        if reg_upper in ["RBI", "ALL"]:
            all_items.extend(await rbi.fetch_latest("circulars", n=limit))
        if reg_upper in ["SEBI", "ALL"]:
            all_items.extend(await sebi.fetch_latest(n=limit))

    # If RSS failed, fall back to Tavily scoped to .gov.in domains
    if not all_items:
        from app.data.sources.tavily import TavilyFetcher
        tavily = TavilyFetcher()
        for reg in regulators:
            raw = await tavily.search_regulatory(
                query=f"latest {reg} circular notification 2025", regulator=reg
            )
            if raw:
                for item in tavily.normalise_results(raw, limit):
                    all_items.append({
                        "external_id": item["url"],
                        "regulator": reg.upper(),
                        "category": "circular",
                        "title": item["title"],
                        "url": item["url"],
                        "published_at": item.get("date", ""),
                        "impact_score": 6.0,
                        "tags": [],
                        "summary": item["snippet"],
                    })

    all_items.sort(key=lambda x: x.get("impact_score", 0), reverse=True)
    all_items = all_items[:limit]

    updates = [RegUpdateItem(
        id=item.get("external_id", ""),
        regulator=item.get("regulator", ""),
        category=item.get("category", ""),
        title=item.get("title", ""),
        url=item.get("url", ""),
        date=item.get("published_at", ""),
        impact_score=item.get("impact_score"),
        summary=item.get("summary", ""),
        tags=item.get("tags", []),
    ) for item in all_items]

    data = RegData(
        regulators_queried=regulators,
        total_items=len(updates),
        updates=updates,
    )
    summary = await generate_summary(
        "RegRadar/Latest",
        {"count": len(updates), "top": all_items[:3]},
        context=f"Regulators: {', '.join(regulators)}",
    )
    return BaseResponse(
        status=ResponseStatus.SUCCESS,
        module="RegRadar / Latest",
        data=data, ai_summary=summary,
        confidence=0.97,
        sources=["rbi.org.in", "sebi.gov.in"],
        credits_used=1, latency_ms=0,
    )
