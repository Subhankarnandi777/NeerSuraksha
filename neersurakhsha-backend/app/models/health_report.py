from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class HealthCase(Base):
    __tablename__ = "health_cases"
    
    id = Column(String, primary_key=True, index=True)
    householdId = Column(String, index=True)
    patientName = Column(String)
    age = Column(Integer)
    gender = Column(String)
    village = Column(String, index=True)
    date = Column(String, nullable=False)
    symptoms = Column(JSON, default=list)
    severity = Column(String, nullable=False)
    sourceId = Column(String, ForeignKey("water_sources.id"))
    notes = Column(String, nullable=True)
    synced = Column(Boolean, default=True)

    source = relationship("WaterSource", back_populates="health_cases")
