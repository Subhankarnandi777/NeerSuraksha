from sqlalchemy.orm import Session
from app.models.water_source import WaterSource
from app.models.health_report import HealthCase

def evaluate_health_risk(db: Session, source: WaterSource, new_case: HealthCase):
    """
    Given a new HealthCase, update the source's health_cases_count.
    If conditions are met, append a risk explanation.
    Returns a health risk score or boolean to feed into vwsi_engine.
    """
    source.health_cases_count += 1
    
    # Simple prototype logic: >=3 cases is high risk
    if source.health_cases_count >= 3:
        if not source.risk_explanation:
            source.risk_explanation = []
        
        # We need to recreate the list to trigger SQLAlchemy JSON mutation detection if not using mutable JSON
        new_explanation = list(source.risk_explanation)
        msg = f"High health risk: {source.health_cases_count} cases reported."
        if msg not in new_explanation:
            new_explanation.append(msg)
        source.risk_explanation = new_explanation
            
        return "HIGH"
    elif source.health_cases_count > 0:
        return "MODERATE"
    return "LOW"
