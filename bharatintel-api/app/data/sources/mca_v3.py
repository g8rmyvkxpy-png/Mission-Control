from app.data.fetcher import DataFetcher


class MCAV3Fetcher(DataFetcher):
    def __init__(self):
        super().__init__(
            base_url="https://www.mca.gov.in",
            source_name="mca_v3",
            timeout=10.0,
        )

    async def search_by_name(self, name: str) -> dict | None:
        data = await self.get(
            "/mcafoportal/viewCompanyMasterData.do",
            params={"companyName": name, "limit": 5},
            cache_ttl=7200,
        )
        return self._normalise(data) if data else None

    async def search_by_cin(self, cin: str) -> dict | None:
        data = await self.get(
            "/mcafoportal/viewCompanyMasterData.do",
            params={"cin": cin.upper()},
            cache_ttl=7200,
        )
        return self._normalise(data) if data else None

    def _normalise(self, raw: dict) -> dict:
        c = raw.get("companyMasterData", raw)
        if isinstance(c, list):
            c = c[0] if c else {}
        return {
            "cin": c.get("CIN", c.get("cin")),
            "company_name": c.get("COMPANY_NAME", c.get("company_name", "Unknown")),
            "status": c.get("COMPANY_STATUS", c.get("company_status", "Unknown")),
            "incorporated": c.get("DATE_OF_INCORPORATION"),
            "roc": c.get("ROC_CODE"),
            "company_category": c.get("COMPANY_CATEGORY"),
            "authorised_capital": c.get("AUTHORISED_CAP"),
            "paid_up_capital": c.get("PAIDUP_CAPITAL"),
            "directors": self._directors(c),
            "last_agm": c.get("DATE_OF_LAST_AGM"),
            "last_balance_sheet": c.get("DATE_OF_BALANCE_SHEET"),
            "charges_outstanding": 0,
        }

    def _directors(self, c: dict) -> list:
        raw = c.get("listOfDirectors", c.get("DIRECTORS", []))
        if not isinstance(raw, list):
            return []
        return [{
            "name": d.get("name", d.get("DIRECTOR_NAME", "")),
            "din": d.get("din", d.get("DIN")),
            "designation": d.get("designation", d.get("DESIGNATION")),
            "status": "Active",
        } for d in raw[:10]]
