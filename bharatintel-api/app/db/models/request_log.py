from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base


class RequestLog(Base):
    __tablename__ = "request_logs"

    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), index=True)
    module = Column(String(50), index=True)
    endpoint = Column(String(100))
    # NEVER log raw GSTIN/PAN — hash it
    query_hash = Column(String(64), nullable=True)
    status_code = Column(Integer)
    response_status = Column(String(20))
    credits_used = Column(Integer, default=1)
    latency_ms = Column(Float)
    confidence = Column(Float, nullable=True)
    degraded = Column(Integer, default=0)  # 0=false, 1=true
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
