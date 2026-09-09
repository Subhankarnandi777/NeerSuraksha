from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WaterTestBase(BaseModel):
    sourceId: str
    ph_level: Optional[float] = None
    turbidity: Optional[float] = None
    fluoride: Optional[float] = None
    arsenic: Optional[float] = None
    coliform: Optional[float] = None

class WaterTestCreate(WaterTestBase):
    id: str
    date: str

class WaterTest(WaterTestBase):
    id: str
    date: datetime

    class Config:
        from_attributes = True
