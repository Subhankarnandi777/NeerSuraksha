from sqlalchemy import Column, String, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class WaterSource(Base):
    __tablename__ = "water_sources"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    status = Column(String)
    distance = Column(Float, nullable=True)
    lat = Column(Float)
    lng = Column(Float)
    householdsUsing = Column(Integer)
    lastTestResult = Column(String, nullable=True)
    groundwaterTrend = Column(String, nullable=True)
    health_cases_count = Column(Integer, default=0)
    risk_explanation = Column(JSON, default=list)
    recommendedAlternativeId = Column(String, ForeignKey("water_sources.id"), nullable=True)

    health_cases = relationship("HealthCase", back_populates="source")
