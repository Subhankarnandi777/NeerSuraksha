export interface GroundwaterForecast {
  depth_now_m: number;
  depth_forecast_m: number;
  interval_lower_m: number;
  interval_upper_m: number;
  confidence_pct: number;
  target_date: string;
  method: string;
  rationale: string;
  advisory?: string;
}

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

async function requestForecast(path: string, init?: RequestInit): Promise<GroundwaterForecast> {
  if (!apiBaseUrl) throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured.');
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Prediction request failed (${response.status}).`);
  }
  return response.json() as Promise<GroundwaterForecast>;
}

/** Uses a trained station model when the source ID is a known station. */
export async function getStationForecast(sourceId: string): Promise<GroundwaterForecast> {
  return requestForecast(`/groundwater/${encodeURIComponent(sourceId)}/forecast?horizon_days=60`);
}

/** Uses the trained regional seasonal model for a source without a station. */
export async function getUngaugedForecast(depthMeters: number, village: string): Promise<GroundwaterForecast> {
  return requestForecast('/groundwater/ungauged/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      village,
      horizon_days: 60,
      readings: [{ date: new Date().toISOString().slice(0, 10), depth_m: depthMeters }],
    }),
  });
}
