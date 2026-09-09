from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.health_report import HealthCase
from app.models.water_source import WaterSource
from app.schemas.health_report import HealthCase as HealthCaseSchema, HealthCaseCreate

router = APIRouter()

@router.get("/", response_model=List[HealthCaseSchema])
def read_health_cases(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve health cases.
    """
    cases = db.query(HealthCase).offset(skip).limit(limit).all()
    return cases

@router.post("/", response_model=HealthCaseSchema)
def create_health_case(
    *,
    db: Session = Depends(deps.get_db),
    case_in: HealthCaseCreate,
) -> Any:
    """
    Report a new health case.
    """
    source = db.query(WaterSource).filter(WaterSource.id == case_in.sourceId).first()
    if source is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="The selected water source does not exist.")
    case = HealthCase(
        id=case_in.id,
        householdId=case_in.householdId,
        patientName=case_in.patientName,
        age=case_in.age,
        gender=case_in.gender,
        village=case_in.village,
        date=case_in.date,
        symptoms=case_in.symptoms,
        severity=case_in.severity,
        sourceId=case_in.sourceId,
        notes=case_in.notes,
        synced=True
    )
    db.add(case)
    from app.engines.decision_engine import recompute_source_status
    recompute_source_status(db, source, case)
    db.commit()
    db.refresh(case)
    return case
