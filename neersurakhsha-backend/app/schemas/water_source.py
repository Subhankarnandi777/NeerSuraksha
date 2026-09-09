from typing import Optional, List
from pydantic import AliasChoices, BaseModel, Field


class WaterSourceBase(BaseModel):
    name: str
    type: str
    status: str
    distance: Optional[float] = None
    lat: float
    lng: float
    householdsUsing: int
    lastTestResult: Optional[str] = None
    groundwaterTrend: Optional[str] = None

    healthCasesCount: int = Field(
        default=0,
        validation_alias=AliasChoices(
            "healthCasesCount",
            "health_cases_count"
        ),
    )

    riskExplanation: Optional[List[str]] = Field(
        default=None,
        validation_alias=AliasChoices(
            "riskExplanation",
            "risk_explanation"
        ),
    )

    recommendedAlternativeId: Optional[str] = None


class WaterSourceCreate(WaterSourceBase):
    id: str


class WaterSourceUpdate(WaterSourceBase):
    pass


class WaterSource(WaterSourceBase):
    id: str

    class Config:
        from_attributes = True