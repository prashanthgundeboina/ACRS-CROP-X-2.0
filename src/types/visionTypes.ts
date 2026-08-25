import { ImageQualityReport } from './cameraTypes';

export type LeafSymptomType = 
  | 'healthy' 
  | 'discoloration' 
  | 'spots' 
  | 'wilting' 
  | 'curling' 
  | 'insect_damage' 
  | 'necrosis' 
  | 'mildew'
  | 'yellow_veins';

export interface LeafSymptom {
  symptom: LeafSymptomType;
  label: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  confidence: number;
  locationDescription: string;
}

export type VisualStressType = 
  | 'none' 
  | 'water_stress' 
  | 'heat_stress' 
  | 'nitrogen_deficiency' 
  | 'potassium_deficiency' 
  | 'phosphorus_deficiency' 
  | 'salinity_stress';

export interface VisualStressItem {
  type: VisualStressType;
  label: string;
  probability: number; // 0 - 100
  rationale: string;
}

export interface VisionDetectionResult {
  cropType: string;
  cropConfidence: number; // 0 - 100
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity';
  canopyCoveragePercent: number; // 0 - 100
  plantDensity: 'sparse' | 'optimal' | 'dense';
  leafSymptoms: LeafSymptom[];
  detectedStresses: VisualStressItem[];
  weedPresence: {
    detected: boolean;
    coveragePercent: number;
    riskLevel: 'low' | 'moderate' | 'high';
  };
  pestPresence: {
    detected: boolean;
    pestType?: string;
    confidence: number;
    visualEvidence?: string;
  };
  rawAnalysisTimestamp: string;
}

export interface FarmerVisionAdvice {
  whatISee: string;            // 🌱 What I see
  whyItMayBeHappening: string; // ❓ Why it may be happening
  whatYouShouldDo: string;     // 👨‍🌾 What you should do
  when: string;                // ⏰ When
  whatToAvoid: string;         // ⚠️ What to avoid
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceScore: number;     // 0 - 100
}

export interface FusedSensorContext {
  soilMoisturePercent?: number;
  ambientTempC?: number;
  iotSensorTempC?: number;
  humidityPercent?: number;
  rainForecastMm?: number;
  ndviIndex?: number;
  cropRiskLevel?: string;
}

export interface CropVisionObservation {
  id: string;
  timestamp: string;
  dateFormatted: string;
  zoneId: string;
  zoneName: string;
  cropName: string;
  deviceLabel: string;
  deviceKind: string;
  frameThumbnailUrl: string;
  quality: ImageQualityReport;
  detection: VisionDetectionResult;
  advice: FarmerVisionAdvice;
  fusedSensorContext?: FusedSensorContext;
  thermalData?: {
    avgTempC?: number;
    maxTempC?: number;
    hasThermalHotspot?: boolean;
  };
  userNotes?: string;
  isSimulated?: boolean;
}
