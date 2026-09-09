from typing import Any, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.water_source import WaterSource
from app.schemas.water_source import (
    WaterSource as WaterSourceSchema,
    WaterSourceCreate,
)

router = APIRouter()


@router.get("/", response_model=List[WaterSourceSchema])
def read_sources(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve water sources.
    """
    sources = db.query(WaterSource).offset(skip).limit(limit).all()
    return sources


@router.post("/", response_model=WaterSourceSchema)
def create_source(
    *,
    db: Session = Depends(deps.get_db),
    source_in: WaterSourceCreate,
) -> Any:
    """
    Create new water source.
    """
    source = WaterSource(
        id=source_in.id,
        name=source_in.name,
        type=source_in.type,
        status=source_in.status,
        distance=source_in.distance,
        lat=source_in.lat,
        lng=source_in.lng,
        householdsUsing=source_in.householdsUsing,
        lastTestResult=source_in.lastTestResult,
        groundwaterTrend=source_in.groundwaterTrend,
        health_cases_count=source_in.healthCasesCount,
        risk_explanation=source_in.riskExplanation,
        recommendedAlternativeId=source_in.recommendedAlternativeId,
    )

    db.add(source)
    db.commit()
    db.refresh(source)
    return source