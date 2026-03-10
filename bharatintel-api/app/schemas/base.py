from pydantic import BaseModel, Field
from typing import Any, Optional, List
from datetime import datetime
from enum import Enum


class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    DEGRADED = "degraded"  # partial data — source unavailable


class BaseResponse(BaseModel):
    status: ResponseStatus = ResponseStatus.SUCCESS
    module: str                        # e.g. 'BizVerify / GSTIN'
    data: Any                          # module-specific payload
    ai_summary: str                    # LLM-ready paragraph
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str]                 # source URLs used
    credits_used: int = 1
    latency_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    degraded: bool = False
    degraded_reason: Optional[str] = None


class ErrorResponse(BaseModel):
    status: str = "error"
    code: str      # INVALID_GSTIN | RATE_LIMIT_EXCEEDED | SOURCE_UNAVAILABLE
    message: str
    details: Optional[Any] = None
