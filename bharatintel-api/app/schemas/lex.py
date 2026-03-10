from pydantic import BaseModel
from typing import Optional, List


class CaseRequest(BaseModel):
    query: str
    court_type: Optional[str] = None  # district | high | supreme | nclt
    state: Optional[str] = None


class TrademarkRequest(BaseModel):
    query: str
    tm_class: Optional[int] = None  # Nice Classification 1-45


class CaseInfo(BaseModel):
    cnr: Optional[str] = None
    court: str
    filing_date: Optional[str] = None
    status: str
    case_type: Optional[str] = None
    petitioner: Optional[str] = None
    respondent: Optional[str] = None
    last_hearing: Optional[str] = None
    next_hearing: Optional[str] = None
    orders_count: Optional[int] = None


class CaseData(BaseModel):
    query: str
    cases_found: int
    cases: List[CaseInfo] = []
    source_note: str = "Data from Indian Kanoon + eCourts public search"


class TrademarkInfo(BaseModel):
    application_no: Optional[str] = None
    mark: str
    class_no: Optional[str] = None
    status: str
    applicant: Optional[str] = None
    filing_date: Optional[str] = None


class TrademarkData(BaseModel):
    query: str
    results: List[TrademarkInfo] = []
    similar_marks: List[str] = []
