from pydantic import BaseModel, Field
from typing import Optional, List


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    language: str = Field(default="en")  # en | hi | ta | te | bn | mr
    max_results: int = Field(default=5, ge=1, le=10)
    include_domains: List[str] = []


class SearchResult(BaseModel):
    title: str
    url: str
    source: Optional[str] = None
    date: Optional[str] = None
    snippet: str
    relevance: float = Field(ge=0.0, le=1.0)


class SearchData(BaseModel):
    query: str
    language: str
    results: List[SearchResult]
    answer: Optional[str] = None
