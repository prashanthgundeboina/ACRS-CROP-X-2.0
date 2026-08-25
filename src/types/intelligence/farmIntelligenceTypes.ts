import { SoilData, FarmZone, CropRecommendation } from '../../types';
import { SensorType, ValidatedTelemetry } from '../iot/iotTypes';

export type PredictiveRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type PredictiveConfidenceLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface PredictionConfidence {
  score: number; // 0 - 100
  level: PredictiveConfidenceLevel;
  dataAvailability: 'HIGH' | 'MODERATE' | 'LOW' | 'MINIMAL';
  predictionHorizon: string; // e.g. "72 Hours"
  supportingSignals: string[];
  lastCalculated: string;
}

export interface Farmer5PartExplanation {
  what: string;       // WHAT MAY HAPPEN?
  why: string;        // WHY?
  action: string;     // WHAT SHOULD I DO?
  when: string;       // WHEN?
  avoid: string;      // WHAT SHOULD I AVOID?
  navTab?: string;
  navLabel?: string;
  expertDetail?: string;
}

export interface PredictiveWaterRiskOutput {
  status: PredictiveRiskLevel;
  title: string;
  currentMoisture: number;
  depletionRatePerHour: number; // e.g. 0.45%/hr
  hoursToWiltingDeficit: number | null; // e.g. 14 hours
  wiltingPoint: number;
  fieldCapacity: number;
  explanation: Farmer5PartExplanation;
  historicalTrend: 'dropping_fast' | 'dropping_steady' | 'stable' | 'increasing';
  rainForecastImpact: string;
  confidence: PredictionConfidence;
}

export interface HeatStressForecastOutput {
  status: PredictiveRiskLevel;
  title: string;
  currentTemp: number;
  forecastMaxTemp: number;
  forecastHumidity: number;
  peakRiskTime: string; // e.g. "Tomorrow 13:00 - 16:00"
  explanation: Farmer5PartExplanation;
  confidence: PredictionConfidence;
}

export interface RainfallDecisionOutput {
  status: PredictiveRiskLevel;
  title: string;
  soilMoisture: number;
  rainProbability: number;
  expectedRainMm: number;
  decisionCategory: 'dry_no_rain' | 'dry_heavy_rain' | 'wet_heavy_rain' | 'wet_no_rain' | 'normal';
  recommendation: string;
  explanation: Farmer5PartExplanation;
  confidence: PredictionConfidence;
}

export interface CropStressDetectionOutput {
  status: PredictiveRiskLevel;
  title: string;
  stressScore: number; // 0 - 100
  dominantCause: string;
  possibleCauses: string[];
  explanation: Farmer5PartExplanation;
  signalsDetected: {
    lowMoisture: boolean;
    highHeat: boolean;
    nutrientImbalance: boolean;
    diseaseRisk: boolean;
    sensorAnomaly: boolean;
  };
  confidence: PredictionConfidence;
}

export interface DiseaseRiskEarlyWarningOutput {
  status: PredictiveRiskLevel;
  title: string;
  riskScore: number; // 0 - 100
  microclimateConditions: string;
  favoredPathogens: string[];
  explanation: Farmer5PartExplanation;
  confidence: PredictionConfidence;
}

export type SensorAnomalyType = 
  | 'none'
  | 'sudden_spike'
  | 'frozen_value'
  | 'repeated_value'
  | 'missing_telemetry'
  | 'sensor_disconnected'
  | 'communication_instability';

export interface SensorAnomalyReport {
  hasAnomaly: boolean;
  type: SensorAnomalyType;
  severity: PredictiveRiskLevel;
  title: string;
  message: string;
  affectedSensor: SensorType | 'all' | 'none';
  detectedValue?: number;
  expectedRange?: string;
  details: string;
  isVerifiedSafeForRecommendations: boolean;
  explanation: Farmer5PartExplanation;
  confidence: PredictionConfidence;
}

export interface IrrigationVerificationResult {
  hasRecord: boolean;
  status: 'effective' | 'low_change' | 'no_change_or_drop' | 'insufficient_data';
  title: string;
  beforeMoisture: number | null;
  afterMoisture: number | null;
  deltaMoisture: number | null;
  timestamp: string | null;
  observationMessage: string;
  suggestedAction: string;
  isConfirmedDiagnosis: false; // Explicit non-diagnosis disclaimer
}

export interface DigitalTwinZone {
  id: string;
  name: string;
  areaHa: number;
  assignedCrop: string;
  growthStage: string;
  growthStageProgress: number; // 0 - 100%
  soilType: string;
  soilCondition: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    ec: number;
    organicMatter: number;
  };
  moisture: number;
  moistureStatus: 'optimal' | 'dry' | 'critical_dry' | 'saturated';
  weatherContext: {
    temp: number;
    humidity: number;
    rainProb: number;
  };
  vegetationHealth: 'Vibrant Canopy' | 'Moderate Vigor' | 'Emerging Stress' | 'Unknown';
  vegetationNdvi: number; // e.g. 0.72
  irrigationStatus: 'Optimal' | 'Irrigation Recommended' | 'Check Flow' | 'Sufficient Water';
  sensorStatus: 'Live Connected' | 'Cached Telemetry' | 'Virtual Model' | 'Offline';
  riskStatus: PredictiveRiskLevel;
  riskSummary: string;
}

export interface PredictiveTimelinePoint {
  timeLabel: 'NOW' | '6 HOURS' | '12 HOURS' | '24 HOURS' | '3 DAYS';
  timestampStr: string;
  estimatedMoisture: number;
  estimatedTemp: number;
  rainExpectedMm: number;
  riskStatus: PredictiveRiskLevel;
  riskCategory: 'Water' | 'Heat' | 'Disease' | 'Rain' | 'Optimal';
  headline: string;
  recommendedFocus: string;
}

export interface FarmWhatIfScenario {
  rainfall: 'none' | 'light' | 'heavy';
  temperature: 'normal' | 'hot' | 'extreme';
  moisture: 'current' | 'lower' | 'higher';
  irrigation: 'none' | 'normal' | 'extra';
}

export interface WhatIfSimulationResult {
  scenario: FarmWhatIfScenario;
  expectedRisk: PredictiveRiskLevel;
  expectedMoisture: number;
  expectedFieldCondition: string;
  suggestedAction: string;
  whyExplanation: string;
  isSimulated: true;
}

export interface OverallFarmIntelligence {
  timestamp: string;
  digitalTwinZones: DigitalTwinZone[];
  waterRisk: PredictiveWaterRiskOutput;
  heatRisk: HeatStressForecastOutput;
  rainfallDecision: RainfallDecisionOutput;
  cropStress: CropStressDetectionOutput;
  diseaseRisk: DiseaseRiskEarlyWarningOutput;
  sensorAnomaly: SensorAnomalyReport;
  irrigationVerification: IrrigationVerificationResult;
  timeline: PredictiveTimelinePoint[];
  overallPredictionConfidence: PredictionConfidence;
  dataSufficiencyNotice: string | null;
}
