from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RegLatestRequest(BaseModel):
    regulators: List[str] = Field(default=["RBI", "SEBI"])
    limit: int = Field(default=10, ge=1, le=50)
    days_back: int = Field(default=30, ge=1, le=365)


class RegSearchRequest(BaseModel):
    q: str = Field(..., min_length=2)
    regulator: Optional[str] = None
    date_from: Optional[str] = None


class RegUpdateItem(BaseModel):
    id: str
    regulator: str
    category: str
    title: str
    url: str
    date: Optional[str] = None
    impact_score: Optional[float] = None
    summary: Optional[str] = None
    tags: List[str] = []


class RegData(BaseModel):
    regulators_queried: List[str]
    total_items: int
    updates: List[RegUpdateItem] = []
