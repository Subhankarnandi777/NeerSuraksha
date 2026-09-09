from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.db.base_class import Base

class GroundwaterReading(Base):
    __tablename__ = "groundwater_readings"
    
    id = Column(String, primary_key=True, index=True)
    sourceId = Column(String, ForeignKey("water_sources.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    water_level_depth = Column(Float)
    
    source = relationship("WaterSource", backref="groundwater_readings")
