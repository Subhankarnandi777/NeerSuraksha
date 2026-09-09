import uuid
from sqlalchemy.orm import Session
from app.schemas.water_test import WaterTestCreate
from app.models.water_test import WaterTest
from app.models.water_source import WaterSource
from app.engines.decision_engine import recompute_source_status

def ingest_water_test(db: Session, payload: WaterTestCreate):
    new_test = WaterTest(
        id=str(uuid.uuid4()),
        sourceId=payload.sourceId,
        ph_level=payload.ph_level,
        turbidity=payload.turbidity,
        fluoride=payload.fluoride,
        arsenic=payload.arsenic,
        coliform=payload.coliform
    )
    db.add(new_test)
    
    source = db.query(WaterSource).filter(WaterSource.id == payload.sourceId).first()
    if source:
        recompute_source_status(db, source)
        
    db.commit()
    db.refresh(new_test)
    return new_test
