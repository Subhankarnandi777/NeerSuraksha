# 💧 NeerSurakhsha

> **Smart groundwater-aware community health monitoring and
> early-warning prototype for water-borne disease risk.**

![Status](https://img.shields.io/badge/status-prototype-orange)
![Model](https://img.shields.io/badge/model-v2.1-brightgreen)
![Platform](https://img.shields.io/badge/platform-Expo%20%2B%20FastAPI-blue)
![License](https://img.shields.io/badge/offline--first-yes-success)

NeerSurakhsha connects a working groundwater model layer with an Expo
mobile application and a lightweight FastAPI backend. The core idea is
to move from simply monitoring villages to understanding **which water
source is becoming unsafe, why it is becoming unsafe, and what action
should follow**.

The current project brief states that the **model layer is complete**:
the engines, artifacts, and groundwater router are merged, running, and
returning HTTP 200 responses. The remaining work is primarily
frontend/backend integration and the small set of API stubs required for
the end-to-end demonstration.

**Model notebook (public, reproducible):** https://www.kaggle.com/code/rishighosaltest/sih-model-v2

---

## 📑 Table of Contents

- [📊 Project Status](#-project-status)
- [💡 Core Idea](#-core-idea)
- [🏗️ System Architecture](#️-system-architecture)
- [🧰 Technology Stack](#-technology-stack)
- [🧠 Model Layer](#-model-layer)
- [🌊 Groundwater API](#-groundwater-api)
- [📱 Frontend Mobile App](#-frontend-mobile-app)
- [⚙️ Backend API](#️-backend-api)
- [🛠️ Backend Setup](#️-backend-setup)
- [📏 Depth Sign Convention](#-depth-sign-convention)
- [🎬 Demo-Day Workflow](#-demo-day-workflow)
- [📚 API Reference](#-api-reference)
- [📈 Model Reported Metrics](#-model-reported-metrics)
- [🚫 What NOT to Build](#-what-not-to-build)
- [🏁 Implementation Priority](#-implementation-priority)
- [🧭 Development Principles](#-development-principles)
- [✅ Project Status Summary](#-project-status-summary)
- [🎯 Final Demo Goal](#-final-demo-goal)

---

## 📊 Project Status

| Layer | Status | Current State |
|---|---|---|
| Model | ✅ Done | v2.1, five validated capabilities, public Kaggle notebook |
| Groundwater API | ✅ Done | 7 endpoints live under `/api/v1/groundwater` |
| Backend scaffold | 🟡 In progress | App boots, routers are wired; sources, sync and health are still stubs |
| Database | 🔴 Not connected | Nothing currently persists |
| Frontend | 🟡 In progress | Expo app boots; fonts and routing are set up; screens are still stubs |
| PPT | 🟡 In progress | 16 slide images are ready in `sih-model-slide-images.zip` |

The central integration gap is:

```text
Working Model
     +
Working Expo App Shell
     +
Working Groundwater API
     ↓
The missing middle: frontend ↔ backend integration
```

---

## 💡 Core Idea

NeerSurakhsha uses groundwater behaviour as a health-risk signal.

The system can:

1. Monitor groundwater stations.
2. Evaluate current depth-to-water.
3. Calculate the water-table/latrine buffer margin.
4. Assess groundwater vulnerability.
5. Forecast future groundwater depth.
6. Accept health and water-test observations from an ASHA worker.
7. Evaluate a water source using VWSI logic.
8. Generate an alert for unsafe sources.
9. Show the unsafe source on a map.
10. Support an offline-first field workflow.

The strongest product claim is the connection between:

```text
Health observation
      ↓
Water source
      ↓
Water test + groundwater reading
      ↓
Groundwater / VWSI evaluation
      ↓
Risk state
      ↓
Alert + action
```

---

## 🏗️ System Architecture

The project is organized around the following flow:

```text
ASHA Mobile App
      │
      ├── Health reports
      ├── Water-test result
      ├── Rope groundwater reading
      └── Test-vial photo
      │
      ▼
Offline Queue
      │
      ▼
FastAPI Backend
      │
      ├── Groundwater Router
      ├── VWSI Evaluation
      ├── Alerts
      └── Sync
      │
      ▼
Model / Engine Layer
      │
      ├── Groundwater forecasting
      ├── Vulnerability
      ├── Sensor health
      └── VWSI evaluation
      │
      ▼
Mobile UI
      │
      ├── Map
      ├── Source status
      ├── Alerts
      └── Forecast / advisory
```

---

## 🧰 Technology Stack

### 📱 Mobile

- Expo SDK 51
- Expo Router
- React Native
- `react-native-maps`
- `expo-camera`
- `expo-location`
- `expo-network`
- `@react-native-async-storage/async-storage`
- Supabase is already installed in the project

The project brief explicitly says the required libraries are already
installed and that additional libraries should not be added for this
prototype.

### ⚙️ Backend

- Python
- FastAPI
- Uvicorn

### 🧠 Model / Analytics Layer

The model layer is already complete and includes the groundwater
engines/artifacts used by the API. Reproducible end-to-end in the public
Kaggle notebook: https://www.kaggle.com/code/rishighosaltest/sih-model-v2

### 🗄️ Persistence

A database is **not connected in the current prototype**. The model
serves from precomputed artifacts in memory.

If time remains after the demo path is complete, the minimum suggested
tables are:

- `water_source`
- `health_report`
- `water_test`
- `response_task`

---

## 🧠 Model Layer

### 🟢 Current Status

The model layer is:

- Version **v2.1**
- Complete
- Merged
- Running
- Returning HTTP 200 responses
- Reproduced by a public Kaggle notebook: https://www.kaggle.com/code/rishighosaltest/sih-model-v2

The project brief describes the model as having **five validated
capabilities**.

The groundwater API exposes the model through seven endpoints.

---

## 🌊 Groundwater API

All API endpoints are prefixed with:

```text
/api/v1
```

The groundwater router is already complete.

### 1️⃣ List Groundwater Stations

```http
GET /api/v1/groundwater/stations
```

Returns 15 stations containing information such as:

- Station name
- Latitude
- Longitude
- Current depth
- Buffer margin
- Risk flag
- Vulnerability

Example response:

```json
{
  "station": "W.R.D., Shillong",
  "district": "East Khasi Hills",
  "lat": 25.5788,
  "lon": 91.8933,
  "depth_now_m": 1.65,
  "buffer_margin_m": -0.35,
  "flag": "AMBER_C (contamination risk)",
  "volatility_m": 0.16,
  "routed_method": "persistence",
  "vulnerability": "VERY HIGH"
}
```

### 2️⃣ Groundwater Forecast

```http
GET /api/v1/groundwater/{station}/forecast?horizon_days=60
```

Returns forecast, prediction interval, forecast method, and model rationale.

The UI must not display a bare forecast number. It should show the
forecast together with its uncertainty interval and explanation.

### 3️⃣ Groundwater Time Series

```http
GET /api/v1/groundwater/{station}/series?limit=180
```

Returns daily depth data suitable for charts.

### 4️⃣ Sensor Health

```http
GET /api/v1/groundwater/sensor-health
```

Returns information about which DWLR sensors should be distrusted.

### 5️⃣ Groundwater Vulnerability

```http
GET /api/v1/groundwater/vulnerability
```

Returns measured rainfall-response lag per aquifer.

### 6️⃣ Ungauged Village Forecast

```http
POST /api/v1/groundwater/ungauged/forecast
```

Forecasts groundwater behaviour for a village that has no sensor. This
is one of the strongest features of the project because many villages
will not have a dedicated groundwater sensor.

### 7️⃣ Model Card

```http
GET /api/v1/groundwater/model/card
```

Returns model capabilities and limitations as data.

---

## 📱 Frontend Mobile App

The mobile app is built with Expo.

The project brief identifies these key screens/workflows:

```text
app/
├── map.tsx
├── report.tsx
├── village.tsx
└── alerts.tsx
```

These screens represent the core demonstration path.

### 🔌 API Connection — `lib/api.ts`

The app should connect to the FastAPI backend using the laptop's LAN IP
when testing on a physical phone.

```ts
import Constants from 'expo-constants';

// Physical device on the same wifi: use your laptop's LAN IP, not localhost.
// Find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
const HOST =
  Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

export const API = `http://${HOST}:8000/api/v1`;

export async function get(path: string) {
  const r = await fetch(`${API}${path}`);

  if (!r.ok) {
    throw new Error(`${r.status} ${path}`);
  }

  return r.json();
}

export async function post(path: string, body: unknown) {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    throw new Error(`${r.status} ${path}`);
  }

  return r.json();
}
```

Test immediately with a throwaway button calling `get('/groundwater/stations')`. 15 stations back means the plumbing works. If not, it's almost always the LAN IP.

**Important:** on a physical phone, `localhost` means the phone itself. Use the computer's LAN IP instead — find it with:

```powershell
ipconfig
```

### 🗺️ Step 1 — Map (`app/map.tsx`)

The map is the first screen that should be completed. Uses `react-native-maps`, already installed.

```ts
const { stations } = await get('/groundwater/stations');
```

**Marker rules:**
- Marker colour is determined by the station flag.
- Marker size scales with shallowness so dangerous shallow wells are visibly bigger:

```text
radius = 8 + max(0, 12 - min(depth_now_m, 12)) * 1.2
```

**Marker interaction:** tap a marker → bottom sheet with current depth, `buffer_margin_m`, vulnerability band. If `buffer_margin_m < 0`, show a prominent red warning — this means the water table is above the pit-latrine floor.

**Risk colours:**

| State | Icon | Colour |
|---|---|---|
| RED | 🔴 | `#A32D2D` |
| AMBER_C | 🟠 | `#B5730E` |
| AMBER_A | 🔵 | `#2B4A7D` |
| WATCH | 🟡 | `#D98514` |
| GREEN | 🟢 | `#4E8B2C` |
| NO_DATA | ⚪ | `#8A9299` |

### 📝 Step 2 — ASHA Report (`app/report.tsx`)

The main field data-entry workflow.

**Fields:**
- Water source — populate the picker from `GET /api/v1/groundwater/stations`
- Symptoms — large tap targets for diarrhoea, vomiting, fever, jaundice
- Water test — three large choices: Positive / Negative / Unclear
- Rope reading — numeric input, "metres from ground to water"
- Photo — `expo-camera`, capture and store the URI for the prototype

**UX constraint:** the target user may have difficulty reading. Prefer icons over text, use large buttons and tap targets, keep the interaction simple, and ask one question per screen where practical.

### 📴 Offline-First Queue

Offline functionality is a core differentiator — do not remove it. Uses `AsyncStorage` + `expo-network`. Queue key: `pending_reports`.

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

const KEY = 'pending_reports';

export async function queue(report: any) {
  const raw = await AsyncStorage.getItem(KEY);
  const list = raw ? JSON.parse(raw) : [];

  list.push({
    ...report,
    id: `${Date.now()}-${Math.random()}`,
    queued_at: new Date().toISOString()
  });

  await AsyncStorage.setItem(KEY, JSON.stringify(list));

  return list.length;
}

export async function sync() {
  const { isInternetReachable } = await Network.getNetworkStateAsync();
  if (!isInternetReachable) return { synced: 0, offline: true };

  const raw = await AsyncStorage.getItem(KEY);
  const list = raw ? JSON.parse(raw) : [];
  const failed: any[] = [];
  let synced = 0;

  for (const item of list) {
    try { await post('/sources/vwsi/evaluate', item); synced++; }
    catch { failed.push(item); }
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(failed));
  return { synced, offline: false };
}
```

**Pending badge:** the header should display `N pending` (e.g. `3 pending`). This is intentionally visible because it demonstrates the offline capability during the presentation — submitting in airplane mode and watching the counter tick up is the demo moment.

**Sync flow (conceptual):**

```text
Check internet
      ↓
Read pending queue
      ↓
POST each queued report
      ↓
Successful → remove from queue
Failed → keep in queue
      ↓
Return synced count
```

The reference flow uses `POST /api/v1/sources/vwsi/evaluate` for evaluation and requires the backend `/sync` endpoint for batch upload.

### 🏘️ Step 3 — Ungauged Village Forecast (`app/village.tsx`)

This feature handles villages without a groundwater sensor — this is what separates the project from a monitoring dashboard. A health worker takes periodic marked-rope readings; six readings are considered sufficient for the prototype demonstration.

```http
POST /api/v1/groundwater/ungauged/forecast
```

```json
{
  "village": "Kartik Chapori",
  "horizon_days": 60,
  "readings": [
    { "date": "2025-06-01", "depth_m": 5.10 },
    { "date": "2025-07-01", "depth_m": 4.15 },
    { "date": "2025-08-01", "depth_m": 3.05 },
    { "date": "2025-09-01", "depth_m": 2.55 },
    { "date": "2025-10-01", "depth_m": 2.30 },
    { "date": "2025-10-15", "depth_m": 2.25 }
  ]
}
```

Returns:

```json
{
  "method": "regional_seasonal",
  "rationale": "These readings show 1.18 m of movement. Applying the regional seasonal shape...",
  "depth_forecast_m": 3.83,
  "interval_lower_m": 2.32,
  "interval_upper_m": 5.35,
  "confidence_pct": 90,
  "c_buffer_forecast": 39.0,
  "c_buffer_worst_case": 89.3,
  "advisory": "Forecast crosses the pit-latrine safety line. Schedule a water test and pre-position ORS."
}
```

**UI must display four things:**
1. Forecast + interval — never a bare number (forecast, lower/upper interval, confidence)
2. `rationale` — verbatim; the model explains its own reasoning
3. `advisory` — as the main headline
4. `c_buffer_forecast` next to `c_buffer_worst_case`

The worst-case value matters for public-health action: the point estimate (39) says "fine," the worst case (89) says "act." The advisory fires on the worst case because acting on the plausible worst case is the correct public-health posture.

### 🚨 Step 4 — Alerts (`app/alerts.tsx`)

`GET /api/v1/alerts` → state, station, margin, a plain-language explanation, and an `actions` array. Render actions as a checklist. No business logic needed client-side — the API already decided.

Severity order: `RED → AMBER_C → AMBER_A → WATCH → NO_DATA`.

---

## ⚙️ Backend API

The groundwater router is complete. Three stubs remain.

### 1️⃣ VWSI Evaluation

```http
POST /api/v1/sources/vwsi/evaluate
```

Called after every app sync. Port from the reference implementation into `app/api/v1/sources.py`:

```python
from app.engines.aquifer_engine import AquiferEngine
from app.engines import vwsi_engine as vwsi

engine = AquiferEngine()

@router.post("/vwsi/evaluate")
def evaluate(report: HealthReport):
    s = engine.get(report.source_id)
    if s is None:
        raise HTTPException(404, f"unknown source: {report.source_id}")

    result = vwsi.evaluate(
        s["depth_now_m"],
        faecal_presence=report.faecal_presence,
        days_since_test=report.days_since_test,
        observed_cases=report.observed_cases,
        baseline_mean=report.baseline_mean,
        baseline_sd=report.baseline_sd,
        days_to_critical=engine.days_to_critical(report.source_id),
        trend=s.get("trend"),
        vulnerability_measured=s.get("vulnerability_measured"),
        rainfall_72h_mm=report.rainfall_72h_mm,
        flood_flag=report.flood_flag,
        sensor_ok=(s.get("sensor") != "UNUSABLE"),
    )
    result["station"] = report.source_id
    return result
```

The reference implementation evaluates: current depth, faecal presence, days since test, observed cases, baseline mean, baseline standard deviation, days to critical depth, trend, measured vulnerability, rainfall over 72 hours, flood flag, and sensor usability.

`vwsi.evaluate()` returns `state`, `C`, `H`, `A`, `buffer_margin_m`, a plain-language `explanation`, and an `actions` list. The frontend renders it directly — the client should not duplicate the business logic.

### 2️⃣ Alerts

```http
GET /api/v1/alerts
```

Evaluate stations, filter everything that is not GREEN, sort by severity, and return the operations queue.

Severity order: `{RED:0, AMBER_C:1, AMBER_A:2, WATCH:3, NO_DATA:4}`.

### 3️⃣ Sync

```http
POST /api/v1/sync
```

Accepts a batch of queued reports from the app.

- Deduplicate on a client-generated UUID — the phone will retry, duplicates will happen. Not optional.
- Return the updated state for every affected source so the app can refresh in one round trip.
- Accept a partial batch: if 3 of 10 fail, commit the 7 and return which failed.

Example behaviour:

```text
10 records uploaded
7 successful
3 failed

→ Commit the 7
→ Return the 3 failed records
```

### 4️⃣ Database — only if time allows

Skip this for the prototype. The model serves from precomputed artifacts in memory and doesn't need a database. A working demo without persistence beats a half-finished migration.

If there's spare time, the minimum tables are: `water_source`, `health_report`, `water_test`, `response_task`.

---

## 🛠️ Backend Setup

```bash
cd neersurakhsha-backend
```

Copy the environment template:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Start FastAPI:

```bash
uvicorn app.main:app --port 8000
```

Open `http://localhost:8000/docs` — the Swagger UI should contain a groundwater section. If it does not, fix the backend before continuing. Nothing else matters until the API runs.

---

## 📏 Depth Sign Convention

**Read this before writing any code involving depth.**

```text
depth_m = positive metres below ground
```

Larger depth → deeper water table → generally safer from faecal contamination.

Example:

```text
2 m below ground → shallower → greater contamination concern
8 m below ground → deeper → safer from this mechanism
```

The raw CGWB feed uses a negative sign for below-ground depth and is flipped during ingestion. Getting this convention backwards will invert the risk logic of the entire system.

---

## 🎬 Demo-Day Workflow

This is the most important end-to-end sequence. If other features fail, this workflow must still work.

1. Open the app in airplane mode.
2. Log three diarrhoea cases against one water source.
3. Photograph a water-test vial.
4. Enter a rope groundwater reading.
5. Show `3 pending` in the app header.
6. Turn the network back on → the queue drains → an alert appears.
7. Open the map → the affected source is shown as RED.
8. Tap the source → show `buffer_margin_m: -0.35` and explain: the water table is above the latrine floor.

This is the core story of the project. Rehearse it end to end at least three times before the day — every demo failure in history was something that worked on someone else's machine.

Keep the standalone console HTML on a USB stick as backup — no server, no internet, double-click and it works.

### 🏛️ Demo Architecture

```text
                 AIRPLANE MODE
                      │
                      ▼
              ASHA enters cases
                      │
                      ▼
              Test vial photo
                      │
                      ▼
             Rope water reading
                      │
                      ▼
             AsyncStorage Queue
                      │
                "3 pending"
                      │
                      ▼
                NETWORK ON
                      │
                      ▼
                 POST /sync
                      │
                      ▼
             VWSI Evaluation
                      │
                      ▼
                Risk = RED
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
       ALERT                    MAP
                                  │
                                  ▼
                          Unsafe source
                                  │
                                  ▼
                         Negative buffer
                                  │
                                  ▼
                     Water table above
                       latrine floor
```

---

## 📚 API Reference

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Purpose | Status |
|---|---|---|---|
| 🟢 GET | `/groundwater/stations` | 15 stations with location, depth, margin, flag, vulnerability | ✅ |
| 🟢 GET | `/groundwater/{station}/forecast?horizon_days=60` | Forecast + 90% interval + method + rationale | ✅ |
| 🟢 GET | `/groundwater/{station}/series?limit=180` | Daily depth series for charts | ✅ |
| 🟢 GET | `/groundwater/sensor-health` | Which DWLR sensors to distrust | ✅ |
| 🟢 GET | `/groundwater/vulnerability` | Measured rainfall-response lag per aquifer | ✅ |
| 🟠 POST | `/groundwater/ungauged/forecast` | Forecast for a village with no sensor | ✅ |
| 🟢 GET | `/groundwater/model/card` | Model capabilities and limitations, as data | ✅ |
| 🟠 POST | `/sources/vwsi/evaluate` | Full health/VWSI evaluation | 🔴 to build |
| 🟢 GET | `/alerts` | Operations alert queue | 🔴 to build |
| 🟠 POST | `/sync` | Batch upload from the app | 🔴 to build |

---

## 📈 Model Reported Metrics

| Metric | Reported Result |
|---|---|
| Feed rejected by QC | 12.5% |
| LOSO skill — 60 days | +18.4% |
| LOSO skill — 90 days | +23.6% |
| Prediction interval coverage | 89.0% against a 90% target |
| Aquifers with significant rainfall response | 7 of 14 tested |

All reproduced by the public Kaggle notebook: https://www.kaggle.com/code/rishighosaltest/sih-model-v2

---

## 🚫 What NOT to Build

Do not spend hackathon time on features explicitly cut from the prototype scope.

- Authentication beyond a hardcoded role toggle
- Real-time WebSockets
- Push notifications
- Blockchain, in any form, for any reason
- A chatbot
- Offline map tiles — `react-native-maps` uses the OS map layer already
- Full database migrations, unless the demo path is already complete
- Any screen not in the demo sequence above

Build one screen that works completely rather than five that half-work.

---

## 🏁 Implementation Priority

If time becomes limited, implement in exactly this order:

1. `.env` → backend boots → `/docs` shows groundwater
2. `lib/api.ts` → Expo app reaches the API
3. Map screen with real groundwater markers
4. Offline queue with the pending badge
5. `POST /sources/vwsi/evaluate` on the backend
6. ASHA report screen
7. Ungauged village forecast
8. Alerts list
9. Everything else

Priorities 1–4 alone constitute a credible demo if time runs out.

---

## 🧭 Development Principles

1. **Do not duplicate model logic in the frontend.** The API decides the risk state; the frontend renders it.
2. **Preserve uncertainty.** Never display only a forecast point estimate — always show forecast, prediction interval, confidence, rationale, and advisory together.
3. **Preserve offline operation.** A field worker must be able to record data without connectivity.
4. **Keep the demo path stable.** Do not spend time on features outside the demonstration sequence.
5. **Prefer one complete screen over five incomplete screens.**

---

## ✅ Project Status Summary

**Already working:**
- Groundwater model layer, artifacts, engine, router
- Seven groundwater API endpoints
- Expo app shell, routing, fonts, existing mobile dependencies

**Still required:**
- API connection from Expo
- Map integration
- Offline queue and pending badge
- ASHA report screen
- VWSI evaluation endpoint
- Alerts endpoint
- Sync endpoint
- Ungauged village screen
- End-to-end demo rehearsal

**Optional if time remains:**
- Database persistence
- Additional non-critical screens
- Further backend completeness

---

## 🎯 Final Demo Goal

```text
OFFLINE FIELD DATA
        ↓
ASHA REPORT
        ↓
WATER SOURCE
        ↓
WATER TEST
        ↓
GROUNDWATER READING
        ↓
OFFLINE QUEUE
        ↓
NETWORK RESTORED
        ↓
SYNC
        ↓
VWSI EVALUATION
        ↓
ALERT
        ↓
RED WATER SOURCE
        ↓
MAP
        ↓
BUFFER MARGIN
        ↓
PUBLIC-HEALTH ACTION
```

**NeerSurakhsha is successful when the model, API, and mobile app form one demonstrable chain rather than three disconnected pieces.**
