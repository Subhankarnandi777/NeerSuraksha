from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.db.base_class import Base

class WaterTest(Base):
    __tablename__ = "water_tests"
    
    id = Column(String, primary_key=True, index=True)
    sourceId = Column(String, ForeignKey("water_sources.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    ph_level = Column(Float, nullable=True)
    turbidity = Column(Float, nullable=True)
    fluoride = Column(Float, nullable=True)
    arsenic = Column(Float, nullable=True)
    coliform = Column(Float, nullable=True)
    
    source = relationship("WaterSource", backref="water_tests")
