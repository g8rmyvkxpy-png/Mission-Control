from app.data.fetcher import DataFetcher


class GSTNPublicFetcher(DataFetcher):
    def __init__(self):
        super().__init__(
            base_url="https://services.gst.gov.in",
            source_name="gstn_public",
            timeout=8.0,
        )

    async def verify_gstin(self, gstin: str) -> dict | None:
        data = await self.get(f"/services/api/public/gstn/{gstin}", cache_ttl=3600)
        if not data:
            return self._fallback(gstin)
        return self._normalise(data)

    def _normalise(self, raw: dict) -> dict:
        return {
            "gstin": raw.get("gstin", ""),
            "legal_name": raw.get("lgnm", raw.get("legal_name", "Unknown")),
            "trade_name": raw.get("tradeNam", raw.get("trade_name")),
            "status": raw.get("sts", raw.get("status", "Unknown")),
            "registration_date": raw.get("rgdt"),
            "business_type": raw.get("ctb"),
            "state": raw.get("stj"),
            "hsn_codes": [],
            "compliance_score": None,
            "filing_compliance": None,
        }

    def _fallback(self, gstin: str) -> dict:
        state_codes = {
            "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
            "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
            "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
            "10": "Bihar", "18": "Assam", "19": "West Bengal",
            "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh",
            "23": "Madhya Pradesh", "24": "Gujarat", "27": "Maharashtra",
            "29": "Karnataka", "30": "Goa", "32": "Kerala",
            "33": "Tamil Nadu", "36": "Telangana",
        }
        return {
            "gstin": gstin,
            "legal_name": "Source temporarily unavailable",
            "trade_name": None,
            "status": "Unknown — degraded",
            "registration_date": None,
            "business_type": None,
            "state": state_codes.get(gstin[:2], "Unknown"),
            "hsn_codes": [],
            "compliance_score": None,
        }
