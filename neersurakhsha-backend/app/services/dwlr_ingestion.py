import uuid
from sqlalchemy.orm import Session
from app.schemas.groundwater_reading import GroundwaterReadingCreate
from app.models.groundwater_reading import GroundwaterReading
from app.models.water_source import WaterSource
from app.engines.decision_engine import recompute_source_status

def ingest_dwlr_reading(db: Session, payload: GroundwaterReadingCreate):
    new_reading = GroundwaterReading(
        id=str(uuid.uuid4()),
        sourceId=payload.sourceId,
        water_level_depth=payload.water_level_depth
    )
    db.add(new_reading)
    
    source = db.query(WaterSource).filter(WaterSource.id == payload.sourceId).first()
    if source:
        recompute_source_status(db, source)
        
    db.commit()
    db.refresh(new_reading)
    return new_reading
