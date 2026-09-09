export interface HealthCase {
  id: string;
  householdId: string;
  patientName: string;
  age: number;
  gender: string;
  village: string;
  date: string;
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  sourceId: string;
  notes: string;
  synced: boolean;
}
