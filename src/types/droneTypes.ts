export type DroneMissionType = 'orthomosaic' | 'multispectral' | 'spot_inspection' | 'spray_prescription';

export type DroneFlightStatus = 'idle' | 'preflight' | 'takeoff' | 'surveying' | 'returning' | 'completed' | 'paused';

export type SpectralBandMode = 'rgb' | 'ndvi' | 'ndre' | 'thermal' | 'anomalies';

export interface DroneWaypoint {
  id: string;
  lat: number;
  lng: number;
  x: number; // grid percentage 0-100
  y: number; // grid percentage 0-100
  altitudeM: number;
  action: 'capture_rgb' | 'capture_multispectral' | 'thermal_scan' | 'spot_hover';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DroneTelemetry {
  altitudeM: number;
  speedMps: number;
  batteryPct: number;
  satelliteCount: number;
  rtkStatus: 'FIXED' | 'FLOAT' | 'STANDALONE';
  windSpeedKmh: number;
  gimbalPitchDeg: number;
  headingDeg: number;
  distanceCoveredM: number;
  flightTimeSec: number;
  photosCaptured: number;
}

export interface DroneAnomalyPin {
  id: string;
  x: number; // percentage in field 0-100
  y: number; // percentage in field 0-100
  zoneId: string;
  zoneName: string;
  type: 'nitrogen_deficiency' | 'water_stress' | 'weed_infestation' | 'foliar_disease' | 'lodging';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  title: string;
  description: string;
  ndviScore: number;
  thermalDeltaC: number;
  recommendedAction: string;
  estimatedAreaSqm: number;
  potentialYieldImpactPct: number;
}

export interface DroneScoutingReport {
  id: string;
  timestamp: string;
  flightDurationMinutes: number;
  areaSurveyedHa: number;
  averageNdvi: number;
  canopyUniformityPct: number;
  anomaliesFound: DroneAnomalyPin[];
  executiveSummary: string;
  prescriptionRecommendations: {
    zone: string;
    action: string;
    product: string;
    ratePerHa: string;
    urgency: 'Immediate' | 'Within 48h' | 'Routine';
  }[];
}
