from typing import List, Optional
from pydantic import BaseModel
from .health_report import HealthCaseCreate, HealthCase
from .water_source import WaterSource
from .water_test import WaterTestCreate
from .groundwater_reading import GroundwaterReadingCreate

class SyncPayload(BaseModel):
    healthCases: List[HealthCaseCreate]
    waterTests: Optional[List[WaterTestCreate]] = []
    groundwaterReadings: Optional[List[GroundwaterReadingCreate]] = []
    
class SyncResponse(BaseModel):
    status: str
    syncedHealthCases: int
    syncedWaterTests: int = 0
    syncedGroundwaterReadings: int = 0
    updatedSources: List[WaterSource]
