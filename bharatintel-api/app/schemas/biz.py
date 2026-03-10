from pydantic import BaseModel, Field
from typing import Optional, List


class GSTINRequest(BaseModel):
    gstin: str = Field(
        ..., min_length=15, max_length=15,
        pattern=r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    )
    include_filing_history: bool = False  # Stubbed — Phase 2


class CompanyRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=200)
    query_type: str = Field(default="name", pattern="^(name|cin)$")


class PANRequest(BaseModel):
    pan: str = Field(
        ..., min_length=10, max_length=10,
        pattern=r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    )


class DirectorInfo(BaseModel):
    name: str
    din: Optional[str] = None
    designation: Optional[str] = None
    status: str = "Active"


class GSTINData(BaseModel):
    gstin: str
    legal_name: str
    trade_name: Optional[str] = None
    status: str
    registration_date: Optional[str] = None
    business_type: Optional[str] = None
    state: Optional[str] = None
    compliance_score: Optional[int] = None
    filing_compliance: Optional[str] = None
    hsn_codes: List[str] = []
    phase1_note: str = "Full filing history available in Phase 2 (GSTN ASP)"


class CompanyData(BaseModel):
    cin: Optional[str] = None
    company_name: str
    status: str
    incorporated: Optional[str] = None
    roc: Optional[str] = None
    authorised_capital: Optional[str] = None
    paid_up_capital: Optional[str] = None
    company_category: Optional[str] = None
    directors: List[DirectorInfo] = []
    charges_outstanding: Optional[int] = None
    compliance_score: Optional[int] = None
    last_agm: Optional[str] = None
    last_balance_sheet: Optional[str] = None
