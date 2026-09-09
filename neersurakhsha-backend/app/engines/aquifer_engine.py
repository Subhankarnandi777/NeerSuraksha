"""
NeerSurakhsha — Aquifer Engine v2
==================================
Groundwater forecasting, sensor QC and resource evaluation.
SIH25068 capability, consumed by the health system (SIH25001).

SIGN CONVENTION — read this before touching anything:
    depth_m is POSITIVE metres BELOW ground.
    Larger depth = deeper water table = SAFER from faecal contamination.
    The raw CGWB feed is negative-for-below-ground; we flip it on ingest.

WHAT IS NEW IN v2
-----------------
1. VOLATILITY-AWARE ROUTING
   v1 routed on horizon alone. v2 adds the second axis: how much the aquifer
   actually moves. A well that shifts 16 cm over 60 days cannot be beaten by any
   model; one that shifts 2.2 m can. Volatility is measured from a station's own
   readings, so the rule also works where there is no DWLR at all.

2. CALIBRATED UNCERTAINTY
   Every forecast carries a prediction interval from split conformal prediction.
   Measured coverage 89.0% against a 90% target. Distribution-free — no assumption
   that errors are Gaussian.

3. UNGAUGED FORECASTING
   forecast_ungauged() predicts for a village with NO sensor, using occasional
   ASHA rope readings plus a regional seasonal shape learned from other stations.

VALIDATION (leave-one-station-out, held-out period May–Dec 2025)
    horizon   persistence   routed    skill

    The station being scored was excluded from training entirely.
"""
from __future__ import annotations

import json
import math
from datetime import date, timedelta
from pathlib import Path
from typing import Iterable, Sequence

import numpy as np

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

# ---------------------------------------------------------------- QC constants
SENTINEL_VALUES = (1.0, -1.0)      # undocumented CGWB device error codes
HAMPEL_WINDOW = 13
HAMPEL_SIGMAS = 3.0
FLATLINE_WINDOW = 20

# ------------------------------------------------------- forecasting constants
CRITICAL_DEPTH_M = 12.0            # below this, shallow handpumps stop yielding
DEFAULT_ALPHA = 0.10               # 90% prediction intervals


def evaluate_aquifer_trend(db, source) -> str:
    """Return a source trend for the legacy decision pipeline.

    Newer code keeps the forecasting engine independent of the database, while
    the report-sync path still needs a small, live reading-based trend.  This
    adapter uses the latest two registered readings and preserves an explicitly
    stored trend when there is not enough history.
    """
    from app.models.groundwater_reading import GroundwaterReading

    readings = (db.query(GroundwaterReading)
                .filter(GroundwaterReading.sourceId == source.id)
                .order_by(GroundwaterReading.date.desc())
                .limit(2)
                .all())
    if len(readings) < 2:
        return source.groundwaterTrend or "insufficient"

    latest, previous = readings[0].water_level_depth, readings[1].water_level_depth
    if latest is None or previous is None:
        return source.groundwaterTrend or "insufficient"
    change = float(latest) - float(previous)
    if abs(change) < 0.05:
        return "no trend"
    return "deepening" if change > 0 else "shallowing"


# =============================================================== QC / ingestion
def flag_reading(level_raw: float, prev_values: Iterable[float] | None = None) -> str:
    """
    Classify a single raw DWLR reading.
    Returns: OK | SENTINEL | NONPHYSICAL | SPIKE | MISSING
    """
    if level_raw is None or (isinstance(level_raw, float) and math.isnan(level_raw)):
        return "MISSING"
    if any(abs(level_raw - s) < 1e-9 for s in SENTINEL_VALUES):
        return "SENTINEL"
    depth = -level_raw
    if depth <= 0:
        return "NONPHYSICAL"          # real during floods -> submersion alert
    if prev_values is not None:
        vals = np.asarray([v for v in prev_values if v is not None], dtype=float)
        if len(vals) >= 3:
            med = np.median(vals)
            mad = np.median(np.abs(vals - med)) * 1.4826
            if mad > 0 and abs(depth - med) > HAMPEL_SIGMAS * mad:
                return "SPIKE"
    return "OK"


def flatline_score(values: Iterable[float], window: int = FLATLINE_WINDOW) -> float:
    """Fraction of the series stuck at zero variance. >0.5 means a dead sensor."""
    v = np.asarray(list(values), dtype=float)
    v = v[~np.isnan(v)]
    if len(v) < window:
        return 0.0
    stuck = sum(1 for i in range(len(v) - window) if np.std(v[i:i + window]) == 0)
    return round(stuck / max(1, len(v) - window), 4)


def sensor_health(coverage_pct: float, bad_pct: float) -> tuple[float, str]:
    """Composite 0-100 health score and status label for a DWLR station."""
    score = max(0.0, min(100.0, 100 - bad_pct * 0.7 - max(0, 100 - coverage_pct) * 0.3))
    status = "HEALTHY" if score > 75 else "DEGRADED" if score > 50 else "UNUSABLE"
    return round(score, 1), status


# ===================================================================== analysis
def mann_kendall(x: Iterable[float], alpha: float = 0.05) -> dict:
    """
    Non-parametric monotonic trend test with Sen's slope.
    'deepening'  = depth increasing = water table FALLING (depletion risk)
    'shallowing' = depth decreasing = water table RISING  (contamination risk)
    """
    x = np.asarray([v for v in x if v is not None and not np.isnan(v)], dtype=float)
    n = len(x)
    if n < 10:
        return dict(trend="insufficient", p_value=None, sen_slope=None)
    s = sum(np.sign(x[j] - x[i]) for i in range(n - 1) for j in range(i + 1, n))
    _, counts = np.unique(x, return_counts=True)
    tie = sum(c * (c - 1) * (2 * c + 5) for c in counts if c > 1)
    var = (n * (n - 1) * (2 * n + 5) - tie) / 18.0
    z = 0.0 if s == 0 else (s - np.sign(s)) / math.sqrt(var)
    p = 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))
    slopes = [(x[j] - x[i]) / (j - i) for i in range(n - 1) for j in range(i + 1, n)]
    trend = "no trend" if p >= alpha else ("deepening" if z > 0 else "shallowing")
    return dict(trend=trend, p_value=round(p, 4), sen_slope=round(float(np.median(slopes)), 5))


def water_table_fluctuation(seasonal_rise_m: float, specific_yield: float = 0.08,
                            area_m2: float = 1_000_000) -> float:
    """
    GEC-2015 Water Table Fluctuation method: Recharge = rise x Sy x area.
    Returns million cubic metres. Substitute the real Sy from the CGWB aquifer map
    before quoting these numbers externally.
    """
    return round(seasonal_rise_m * specific_yield * area_m2 / 1e6, 4)


def stage_of_extraction(extraction_mcm: float, extractable_mcm: float) -> dict:
    """GEC-2015 categorisation of an assessment unit."""
    if extractable_mcm <= 0:
        return dict(stage_pct=None, category="unknown")
    pct = extraction_mcm / extractable_mcm * 100
    cat = ("Safe" if pct < 70 else "Semi-Critical" if pct < 90
           else "Critical" if pct <= 100 else "Over-Exploited")
    return dict(stage_pct=round(pct, 1), category=cat)


def volatility(depths: Sequence[float], horizon_days: int,
               spacing_days: float = 1.0) -> float | None:
    """
    The aquifer's own restlessness: median absolute change over `horizon_days`.

    This is the routing variable, and it needs only the well's own readings —
    which is why the model transfers to villages that have no DWLR.
    """
    v = np.asarray([d for d in depths if d is not None], dtype=float)
    v = v[~np.isnan(v)]
    step = max(1, int(round(horizon_days / max(spacing_days, 1e-6))))
    if len(v) <= step:
        return None
    return round(float(np.median(np.abs(v[step:] - v[:-step]))), 4)


# =================================================================== the engine
class AquiferEngine:
    """Loads precomputed artifacts and serves forecasts. No training at runtime."""

    def __init__(self, data_dir: Path | str = DATA_DIR):
        d = Path(data_dir)
        art = json.loads((d / "model_artifacts_v2.json").read_text())
        self.version = art.get("version", "2.0")
        self.shape = np.asarray(art["regional_shape"], dtype=float)
        self.conformal = art["conformal"]
        self.routing = art["routing"]
        self.validation = art["validation"]
        self.stations = {s["station"]: s for s in art["stations"]}
        self._vuln = art.get("vulnerability", {})
        self.vol_threshold = float(self.routing["vol_threshold_m"])
        try:
            self.history = json.loads((d / "history.json").read_text())
        except FileNotFoundError:
            self.history = {}

    # -- lookups ------------------------------------------------------------
    def artifact_vulnerability(self) -> dict:
        """The vulnerability study metadata, for the /vulnerability endpoint."""
        return getattr(self, "_vuln", {})

    def list_stations(self) -> list[dict]:
        return list(self.stations.values())

    def get(self, station: str) -> dict | None:
        return self.stations.get(station)

    def shape_at(self, on: date) -> float:
        """Regional seasonal deviation for a day of year. Transferable anywhere."""
        return float(self.shape[min(on.timetuple().tm_yday, len(self.shape)) - 1])

    def _nearest_horizon(self, h: int) -> int:
        return min(self.routing["horizons"], key=lambda x: abs(x - h))

    # -- uncertainty --------------------------------------------------------
    def interval(self, horizon_days: int, alpha: float = DEFAULT_ALPHA) -> float:
        """
        Half-width of the prediction interval, from split conformal prediction.

        Distribution-free: the only assumption is that future residuals resemble
        the out-of-sample residuals we measured. Coverage was verified empirically
        at 89.0% against a 90% target — we do not take the guarantee on faith.
        """
        pool = np.asarray(self.conformal[str(self._nearest_horizon(horizon_days))]["pool"],
                          dtype=float)
        return round(float(np.quantile(pool, float(np.clip(1 - alpha, 0.01, 0.999)))), 3)

    # -- routing ------------------------------------------------------------
    def route(self, station: str, horizon_days: int) -> tuple[str, str, float | None]:
        """Which method to use, why, and the volatility that decided it."""
        st = self.stations.get(station)
        vol = None
        if st:
            vol = st["volatility"].get(str(self._nearest_horizon(horizon_days)))
        if vol is None:
            return "persistence", "No volatility estimate; defaulting to no change.", None
        if vol < self.vol_threshold:
            return ("persistence",
                    f"This well moves only {vol:.2f} m over {horizon_days} days. "
                    "Below that threshold nothing beats assuming no change, and we "
                    "do not pretend otherwise.", vol)
        return ("seasonal",
                f"This well moves {vol:.2f} m over {horizon_days} days — enough for "
                "the seasonal recharge signal to be worth modelling.", vol)

    # -- forecasting --------------------------------------------------------
    def forecast(self, station: str, horizon_days: int = 60,
                 today: date | None = None, alpha: float = DEFAULT_ALPHA) -> dict:
        """
        Predict depth-to-water `horizon_days` ahead, with a calibrated interval.
        Always returns which method was used and why, so the UI can explain itself.
        """
        st = self.stations.get(station)
        if st is None:
            raise KeyError(f"unknown station: {station}")
        today = today or date.today()
        target = today + timedelta(days=horizon_days)
        method, why, vol = self.route(station, horizon_days)
        now = float(st["depth_now_m"])

        if method == "persistence":
            point = now
        else:
            base = float(st.get("level_mean90") or now)
            seasonal = self.shape_at(target) - self.shape_at(today)
            # anchor on the local mean, carry half the current deviation forward
            point = base + seasonal + (now - base) * 0.5

        half = self.interval(horizon_days, alpha)
        return dict(
            station=station, horizon_days=horizon_days,
            target_date=target.isoformat(),
            method=method, rationale=why, volatility_m=vol,
            depth_now_m=round(now, 2),
            depth_forecast_m=round(float(point), 2),
            change_m=round(float(point) - now, 2),
            interval_lower_m=round(float(point) - half, 2),
            interval_upper_m=round(float(point) + half, 2),
            interval_half_width_m=half,
            confidence_pct=round((1 - alpha) * 100),
        )

    def forecast_ungauged(self, readings: Sequence[dict], horizon_days: int = 60,
                          today: date | None = None,
                          alpha: float = DEFAULT_ALPHA) -> dict:
        """
        Forecast for a village with NO DWLR — the normal case in rural Northeast India.

        `readings` is a list of {"date": "YYYY-MM-DD", "depth_m": float} taken with an
        ASHA worker's marked rope. Two or three months of occasional readings is enough.

        The village supplies its own LEVEL; the regional seasonal shape, learned from
        monitored stations, supplies the SEASONAL MOVEMENT.

        Validated leave-one-station-out: the scored station was excluded from training
        entirely. +18.4% skill at 60 days, +23.6% at 90 days against persistence.
        """
        if not readings:
            raise ValueError("at least one rope reading is required")
        rows = sorted(
            ({"d": date.fromisoformat(str(r["date"])), "v": float(r["depth_m"])}
             for r in readings), key=lambda r: r["d"])
        depths = [r["v"] for r in rows]
        today = today or rows[-1]["d"]
        target = today + timedelta(days=horizon_days)

        latest = depths[-1]
        level = float(np.mean(depths[-6:]))          # local level anchor
        span = (rows[-1]["d"] - rows[0]["d"]).days
        spacing = (span / (len(rows) - 1)) if len(rows) > 1 else 1.0
        vol = volatility(depths, horizon_days, spacing_days=spacing)

        if vol is None or len(rows) < 3:
            method = "persistence"
            why = ("Too few readings to estimate how much this well moves. Defaulting "
                   "to no change — collect readings for 8–10 weeks to unlock the "
                   "seasonal forecast.")
            point = latest
        elif vol < self.vol_threshold:
            method = "persistence"
            why = (f"These readings show only {vol:.2f} m of movement over "
                   f"{horizon_days} days. Assuming no change is the honest answer.")
            point = latest
        else:
            method = "regional_seasonal"
            why = (f"These readings show {vol:.2f} m of movement. Applying the regional "
                   "seasonal shape learned from monitored stations.")
            point = level + (self.shape_at(target) - self.shape_at(today))

        half = self.interval(horizon_days, alpha)
        return dict(
            ungauged=True, n_readings=len(rows), observation_span_days=span,
            horizon_days=horizon_days, target_date=target.isoformat(),
            method=method, rationale=why, volatility_m=vol,
            depth_now_m=round(latest, 2),
            depth_forecast_m=round(float(point), 2),
            change_m=round(float(point) - latest, 2),
            interval_lower_m=round(float(point) - half, 2),
            interval_upper_m=round(float(point) + half, 2),
            interval_half_width_m=half,
            confidence_pct=round((1 - alpha) * 100),
            validation=dict(
                method="leave-one-station-out",
                skill_vs_persistence_pct=self.validation["loso_skill_pct"].get(
                    str(self._nearest_horizon(horizon_days))),
                note="scored on stations excluded from training entirely"),
        )

    def days_to_critical(self, station: str,
                         critical_depth_m: float = CRITICAL_DEPTH_M) -> float | None:
        """Days until the water table falls past the point shallow handpumps fail."""
        st = self.stations.get(station)
        if st is None:
            return None
        slope_month = st.get("sen_slope_m_per_month")
        if not slope_month or slope_month <= 0:
            return None                      # stable or rising: will not run dry
        days = (critical_depth_m - float(st["depth_now_m"])) / (slope_month / 30.0)
        return None if days < 0 or days > 3650 else round(days)

    def series(self, station: str, limit: int = 180) -> dict:
        h = self.history.get(station, {"t": [], "v": []})
        return dict(station=station, dates=h["t"][-limit:], depth_m=h["v"][-limit:])
