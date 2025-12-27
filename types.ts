
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type AppState = 'INITIAL' | 'CONSENT_PENDING' | 'LOCATION_GRANTED' | 'LOCATION_DENIED' | 'PROCESSING';

export interface AIInsight {
  summary: string;
  funFact: string;
}
