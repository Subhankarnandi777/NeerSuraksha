from pydantic import BaseModel
from datetime import datetime

class GroundwaterReadingBase(BaseModel):
    sourceId: str
    water_level_depth: float

class GroundwaterReadingCreate(GroundwaterReadingBase):
    id: str
    date: str

class GroundwaterReading(GroundwaterReadingBase):
    id: str
    date: datetime

    class Config:
        from_attributes = True
