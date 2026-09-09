from typing import Optional, List
from pydantic import BaseModel

class HealthCaseBase(BaseModel):
    householdId: str
    patientName: str
    age: int
    gender: str
    village: str
    date: str
    symptoms: List[str]
    severity: str
    sourceId: str
    notes: Optional[str] = None
    synced: bool = True

class HealthCaseCreate(HealthCaseBase):
    id: str

class HealthCaseUpdate(HealthCaseBase):
    pass

class HealthCase(HealthCaseBase):
    id: str

    class Config:
        from_attributes = True
