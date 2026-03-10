from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db.session import Base


class RegulatoryItem(Base):
    __tablename__ = "regulatory_items"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(200), unique=True, index=True)
    regulator = Column(String(20), index=True)     # RBI, SEBI, MCA, CBDT
    category = Column(String(50), index=True)      # circular, notification
    title = Column(String(500), nullable=False)
    url = Column(String(500), nullable=False)
    published_at = Column(DateTime(timezone=True), index=True, nullable=True)
    summary = Column(Text, nullable=True)          # AI-generated
    impact_score = Column(Float, nullable=True)    # 0.0 to 10.0
    tags = Column(String(500), nullable=True)      # comma-separated
    full_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
