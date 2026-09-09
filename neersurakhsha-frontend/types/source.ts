export type SourceStatus = 'SAFE' | 'CONTAMINATION_RISK' | 'AVAILABILITY_RISK' | 'HIGH_RISK';
export type SourceType = 'Handpump' | 'Tubewell' | 'Dug well' | 'Spring' | 'Piped source' | 'Community water point';

export interface WaterSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  distance: number;
  lat: number;
  lng: number;
  householdsUsing: number;
  lastTestResult?: 'Positive' | 'Negative' | 'Pending';
  groundwaterTrend?: 'Rising' | 'Stable' | 'Declining';
  healthCasesCount: number;
  riskExplanation?: string[];
  recommendedAlternativeId?: string;
}
