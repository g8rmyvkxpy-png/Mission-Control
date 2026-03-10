import enum
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Enum
from sqlalchemy.sql import func
from app.db.session import Base


class PlanTier(str, enum.Enum):
    STARTER = "starter"      # 2,000 calls/month — free
    BUILDER = "builder"      # 25,000 calls/month — ₹2,999/mo
    GROWTH = "growth"        # 100,000 calls/month — ₹9,999/mo
    ENTERPRISE = "enterprise"


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    organisation = Column(String(255), nullable=True)
    plan = Column(Enum(PlanTier), default=PlanTier.STARTER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    calls_this_month = Column(Integer, default=0, nullable=False)
    total_calls = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    reset_at = Column(DateTime(timezone=True), nullable=True)
