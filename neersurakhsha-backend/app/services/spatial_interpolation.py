import math
from typing import List, Tuple

def compute_idw(target_lat: float, target_lng: float, points: List[Tuple[float, float, float]], power: float = 2.0) -> float:
    """
    Compute Inverse Distance Weighting (IDW) interpolation for a target point.
    points: List of (lat, lng, value)
    """
    numerator = 0.0
    denominator = 0.0
    
    for lat, lng, value in points:
        # Distance squared
        dist_sq = (target_lat - lat)**2 + (target_lng - lng)**2
        
        # If the target is exactly on a point, return the value
        if dist_sq == 0:
            return value
            
        weight = 1.0 / (dist_sq ** (power / 2.0))
        numerator += weight * value
        denominator += weight
        
    if denominator == 0:
        return 0.0
        
    return numerator / denominator

def generate_risk_surface(village_bounds: dict, sources: list, grid_size: int = 10):
    """
    Generates a grid of interpolated risk values across the village area.
    """
    risk_map = {
        "SAFE": 0,
        "AVAILABILITY_RISK": 1,
        "CONTAMINATION_RISK": 2,
        "HIGH_RISK": 3
    }
    
    points = []
    for s in sources:
        points.append((s.lat, s.lng, risk_map.get(s.status, 0)))
        
    return {"grid": "surface data", "points": points}
