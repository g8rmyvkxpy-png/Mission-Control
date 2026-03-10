from app.data.fetcher import DataFetcher
from app.config import settings


class IndianKanoonFetcher(DataFetcher):
    def __init__(self):
        super().__init__(
            base_url=settings.INDIAN_KANOON_BASE,
            source_name="indian_kanoon",
            timeout=12.0,
        )
        if settings.INDIAN_KANOON_API_KEY:
            self.client.headers.update({
                "Authorization": f"Token {settings.INDIAN_KANOON_API_KEY}"
            })

    async def search_cases(self, query: str, court_type: str = None) -> dict | None:
        params = {"formInput": query, "pagenum": 0}
        if court_type:
            params["doctypes"] = court_type
        data = await self.post("/search/", body=params, cache_ttl=3600)
        if not data:
            return {"query": query, "cases_found": 0, "cases": [],
                    "source_note": "Court case source temporarily unavailable."}
        return self._normalise(data, query)

    def _normalise(self, raw: dict, query: str) -> dict:
        cases = []
        for doc in raw.get("docs", [])[:5]:
            cases.append({
                "cnr": doc.get("tid"),
                "court": doc.get("docsource", "Unknown Court"),
                "filing_date": doc.get("publishdate"),
                "status": "Unknown",
                "case_type": doc.get("doctype"),
                "petitioner": None,
                "respondent": None,
                "last_hearing": None,
                "next_hearing": None,
                "orders_count": None,
            })
        return {
            "query": query,
            "cases_found": raw.get("total", len(cases)),
            "cases": cases,
        }
