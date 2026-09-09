from sqlalchemy.orm import Session
from app.models.water_source import WaterSource
from app.models.health_report import HealthCase
from app.engines.health_engine import evaluate_health_risk
from app.engines.aquifer_engine import evaluate_aquifer_trend
from app.engines.vwsi_engine import compute_vwsi
from app.services.notification_service import dispatch_alert

def recompute_source_status(db: Session, source: WaterSource, new_health_case: HealthCase = None):
    """
    Orchestrates engines and determines if an alert should be triggered.
    """
    if new_health_case:
        health_risk = evaluate_health_risk(db, source, new_health_case)
    else:
        if source.health_cases_count >= 3:
            health_risk = "HIGH"
        elif source.health_cases_count > 0:
            health_risk = "MODERATE"
        else:
            health_risk = "LOW"
            
    aquifer_trend = evaluate_aquifer_trend(db, source)
    
    old_status = source.status
    new_status = compute_vwsi(db, source, health_risk, aquifer_trend)
    
    if new_status in ["HIGH_RISK", "CONTAMINATION_RISK"] and old_status != new_status:
        dispatch_alert(source, new_status)
        
    return new_status
