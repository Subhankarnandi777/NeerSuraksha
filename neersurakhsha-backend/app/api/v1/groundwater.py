"""
Groundwater endpoints — exposes the aquifer model through the app's router stack.

Mounted by app/api/v1/api_router.py under /api/v1/groundwater.

The engine is a singleton loaded once at import: it reads precomputed artifacts
from data/ and does NO training at request time, so every call is milliseconds.

All figures reported here come from the committed public Kaggle notebook (v2).
Do not edit them by hand — regenerate the artifacts and they follow.
"""
from datetime import date
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.engines.aquifer_engine import AquiferEngine
from app.engines import vwsi_engine as vwsi

router = APIRouter()

# loaded once, shared across requests
engine = AquiferEngine()


# ------------------------------------------------------------------ schemas
class RopeReading(BaseModel):
    """One measurement taken with a marked rope or tape by a health worker."""
    date: str = Field(..., examples=["2025-09-14"])
    depth_m: float = Field(..., gt=0, examples=[3.4])


class UngaugedRequest(BaseModel):
    """A village with no DWLR. This is the normal case, not the exception."""
    village: str = Field("unnamed village", examples=["Kartik Chapori"])
    horizon_days: int = Field(60, ge=1, le=365)
    confidence: float = Field(0.90, ge=0.5, le=0.99)
    readings: list[RopeReading]


# ------------------------------------------------------------------ routes
@router.get("/stations")
def list_stations() -> Any:
    """All monitored DWLR stations with their current state and routing decision."""
    return {
        "count": len(engine.stations),
        "model_version": engine.version,
        "stations": [
            {
                "station": s["station"],
                "district": s.get("district"),
                "lat": s.get("Latitude"),
                "lon": s.get("Longitude"),
                "depth_now_m": s["depth_now_m"],
                "buffer_margin_m": round(s["depth_now_m"] - vwsi.DEFAULT.latrine_base_depth_m, 2),
                "trend": s.get("trend"),
                "sensor": s.get("sensor"),
                "health_score": s.get("health_score"),
                "flag": s.get("flag"),
                "volatility_m": s["volatility"].get("60"),
                "routed_method": s["routes"].get("60"),
                "vulnerability": (s.get("vulnerability_measured") or {}).get("band"),
            }
            for s in engine.list_stations()
        ],
    }


@router.get("/sensor-health")
def sensor_health() -> Any:
    """
    The CGWB action list — which stations should not be trusted.

    12.5% of the national feed is unusable: 1,557 undocumented sentinel error
    codes and one sensor flatlined for 80.2% of its operational life. Nobody
    currently triages this.
    """
    rows = sorted(engine.list_stations(), key=lambda s: s.get("health_score") or 0)
    return {
        "stations": [
            {
                "station": s["station"], "district": s.get("district"),
                "status": s.get("sensor"), "health_score": s.get("health_score"),
                "coverage_pct": s.get("coverage_%"), "rejected_pct": s.get("bad_%"),
                "flatline_pct": s.get("flatline_%"), "n_readings": s.get("n_readings"),
            }
            for s in rows
        ]
    }


@router.get("/vulnerability")
def vulnerability() -> Any:
    """
    Measured aquifer vulnerability — how fast rain reaches each water table.

    Not a static index. Daily rainfall and daily water-level change are both
    de-seasonalised, lags 0-90 days are scanned, and the peak is accepted only
    if it beats a block-bootstrap null (300 resamples, 30-day blocks) at p<0.05.

    Searching 91 lags will always produce some peak, so the significance test is
    what makes the number mean anything. 7 of 14 tested stations passed; the
    rest are reported as insufficient signal rather than given an invented band.
    """
    meta = engine.artifact_vulnerability()
    rows = []
    for s in engine.list_stations():
        m = s.get("vulnerability_measured") or {}
        rows.append({
            "station": s["station"], "district": s.get("district"),
            "depth_now_m": s["depth_now_m"],
            "buffer_margin_m": round(s["depth_now_m"] - vwsi.DEFAULT.latrine_base_depth_m, 2),
            "lag_days": m.get("lag_days"), "peak_r": m.get("peak_r"),
            "null_95": m.get("null_95"), "p_value": m.get("p"),
            "significant": m.get("significant"), "band": m.get("band"),
            "vulnerability": m.get("vulnerability"),
        })
    rows.sort(key=lambda r: (not r["significant"],
                            r["lag_days"] if r["lag_days"] is not None else 999))
    return {
        "method": meta.get("method"), "significance": meta.get("significance"),
        "rainfall_source": meta.get("rainfall_source"),
        "n_significant": meta.get("n_significant"), "n_tested": meta.get("n_tested"),
        "note": meta.get("note"), "stations": rows,
    }


@router.get("/{station}/forecast")
def forecast(
    station: str,
    horizon_days: int = Query(60, ge=1, le=365),
    confidence: float = Query(0.90, ge=0.5, le=0.99),
) -> Any:
    """
    Forecast depth-to-water, with a calibrated prediction interval.

    Routing is on two axes: the horizon, and how much this particular well
    actually moves. A well that shifts 16 cm over 60 days cannot be beaten by
    any model, and the response says so in `rationale` rather than pretending.

    Interval coverage was measured at 89.0% against a 90% target.
    """
    try:
        out = engine.forecast(station, horizon_days, alpha=1 - confidence)
    except KeyError:
        raise HTTPException(404, f"unknown station: {station}")
    out["days_to_critical"] = engine.days_to_critical(station)
    return out


@router.get("/{station}/series")
def series(station: str, limit: int = Query(180, ge=7, le=1000)) -> Any:
    """Cleaned daily depth series for charting."""
    if station not in engine.stations:
        raise HTTPException(404, f"unknown station: {station}")
    return engine.series(station, limit)


@router.post("/ungauged/forecast")
def ungauged_forecast(req: UngaugedRequest) -> Any:
    """
    Forecast the water table for a village that has NO sensor.

    Most villages in rural Northeast India have no DWLR, so a model that only
    works at monitored sites is a dashboard, not a public-health tool. This takes
    occasional rope readings from an ASHA worker and applies a regional seasonal
    shape learned from monitored stations.

    Validated leave-one-station-out — the scored station was excluded from
    training entirely: +18.4% skill at 60 days, +23.6% at 90 days vs persistence.

    Note the advisory fires on `c_buffer_worst_case`, computed from the LOWER
    bound of the interval. Acting on the plausible worst case is the correct
    public-health posture, and it is why the intervals exist at all.
    """
    try:
        out = engine.forecast_ungauged(
            [r.model_dump() for r in req.readings],
            horizon_days=req.horizon_days,
            alpha=1 - req.confidence,
        )
    except ValueError as e:
        raise HTTPException(422, str(e))

    out["village"] = req.village
    cb = vwsi.c_buffer(out["depth_forecast_m"])
    cb_worst = vwsi.c_buffer(out["interval_lower_m"])
    out["c_buffer_forecast"] = cb
    out["c_buffer_worst_case"] = cb_worst
    out["advisory"] = (
        "Forecast crosses the pit-latrine safety line. Schedule a water test and "
        "pre-position chlorine."
        if (cb_worst or 0) >= 60
        else "No buffer-collapse risk indicated within the forecast interval."
    )
    return out


@router.get("/model/card")
def model_card() -> Any:
    """
    What this model can and cannot do, served as data so nobody takes it on trust.

    Every figure here is reproduced by the public Kaggle notebook.
    """
    return {
        "version": engine.version,
        "routing": engine.routing,
        "validation": engine.validation,
        "interval_half_widths_m": {
            h: engine.interval(int(h)) for h in engine.routing["horizons"]
        },
        "limitations": [
            "15 stations, Meghalaya only. Not yet validated outside the state.",
            "Vulnerability significant at 7 of 14 tested stations; the rest use a neutral prior.",
            "Rainfall drives the vulnerability index but is not yet a forecast feature.",
            "Specific yield assumed 0.08 pending real CGWB aquifer values.",
            "Seven months of held-out data, covering one monsoon.",
            "Leave-one-station-out covers 8 stations at each horizon.",
        ],
    }
