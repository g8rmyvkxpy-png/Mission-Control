from fastapi import APIRouter, Depends
from app.schemas.biz import GSTINRequest, CompanyRequest
from app.schemas.base import BaseResponse
from app.core.bizverify.gstin import verify_gstin_logic
from app.core.bizverify.company import search_company_logic
from app.middleware.auth import validate_api_key
from app.middleware.rate_limit import check_rate_limit
from app.db.models.api_key import APIKey
import time

router = APIRouter(tags=["BizVerify"])


@router.post("/gstin", response_model=BaseResponse,
    summary="Verify GSTIN",
    description="Verify any Indian GSTIN. Returns legal name, GST status, state, and compliance signals.")
async def verify_gstin(body: GSTINRequest, key_obj: APIKey = Depends(validate_api_key)):
    start = time.monotonic()
    await check_rate_limit(key_obj, credits=1)
    result = await verify_gstin_logic(body.gstin, body.include_filing_history)
    result.latency_ms = round((time.monotonic() - start) * 1000, 2)
    return result


@router.post("/company", response_model=BaseResponse,
    summary="Company Search",
    description="Search MCA/ROC by company name or CIN. Returns directors, charges, capital.")
async def search_company(body: CompanyRequest, key_obj: APIKey = Depends(validate_api_key)):
    start = time.monotonic()
    await check_rate_limit(key_obj, credits=2)
    result = await search_company_logic(body.query, body.query_type)
    result.latency_ms = round((time.monotonic() - start) * 1000, 2)
    return result
