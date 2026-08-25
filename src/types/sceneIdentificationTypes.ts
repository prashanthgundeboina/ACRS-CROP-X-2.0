import { ImageQualityReport } from './cameraTypes';
import { FusedSensorContext } from './visionTypes';

export type DetectedSceneClass = 'human' | 'crop' | 'soil' | 'unrelated';

export interface SceneBoundingBox {
  id: string;
  label: 'Farmer detected' | 'Crop detected' | 'Soil detected';
  classType: 'human' | 'crop' | 'soil';
  confidence: number; // 0 - 100
  box: {
    x: number; // percentage 0 - 100
    y: number; // percentage 0 - 100
    width: number; // percentage 0 - 100
    height: number; // percentage 0 - 100
  };
}

export type CameraAiWorkflowState =
  | 'CONNECTED'
  | 'SEARCHING_FOR_SCENE'
  | 'HUMAN_DETECTED'
  | 'WAITING_FOR_CROP'
  | 'CROP_DETECTED'
  | 'SOIL_DETECTED'
  | 'ANALYZING'
  | 'ENVIRONMENT_ANALYSIS'
  | 'COMPLETE';

export interface VisualCropAnalysis {
  detected: boolean;
  cropType?: string;
  confidence: number; // 0 - 100
  growthStage?: 'Early growth' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity';
  visualHealth: 'Healthy-looking' | 'Mild Stress' | 'Moderate Concern' | 'Severe Symptoms';
  canopyDensity?: 'Sparse' | 'Adequate' | 'Dense';
  foliageCondition: string[];
  possibleStress: string[];
  possibleDiseaseSymptoms: string[];
  possiblePestDamage: string[];
  summaryNote: string;
}

export interface VisualSoilAnalysis {
  detected: boolean;
  visualState: 'Looks dry' | 'Looks moist' | 'Standing water visible' | 'Cracking' | 'Unable to determine';
  confidence: number; // 0 - 100
  surfaceTextureIndicators: string[];
  waterloggingIndication: boolean;
  crackingIndication: boolean;
  visualSummary: string;
}

export interface FieldEnvironmentScore {
  status: 'Good' | 'Watch' | 'Needs Attention' | 'Insufficient Data';
  reason: string;
  factorsEvaluated: {
    weatherComfort: string;
    moistureStatus: string;
    cropStressStatus: string;
    temperatureStatus: string;
    thermalHotspotStatus: string;
  };
  hasEnoughRealInputs: boolean;
}

export interface CroperXSupervisorUnderstanding {
  whatIsHappening: string;
  why: string;
  whatShouldIDo: string;
  when: string;
  whatShouldIAvoid: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
}

export interface SceneIdentificationResult {
  id: string;
  timestamp: string;
  state: CameraAiWorkflowState;
  guidanceMessage: string;
  voiceMessage?: string;
  detectedClasses: {
    human: boolean;
    crop: boolean;
    soil: boolean;
  };
  humanGreeted: boolean;
  farmerName: string;
  boundingBoxes: SceneBoundingBox[];
  cropAnalysis?: VisualCropAnalysis;
  soilAnalysis?: VisualSoilAnalysis;
  quality: ImageQualityReport;
  environmentScore: FieldEnvironmentScore;
  supervisorUnderstanding: CroperXSupervisorUnderstanding;
  sensorContext: FusedSensorContext;
  isSimulated?: boolean;
  simulationScenario?: string;
}

export type SceneSimulatorScenario =
  | 'human_only'
  | 'human_and_crop'
  | 'crop_only'
  | 'soil_only'
  | 'human_crop_soil'
  | 'healthy_crop'
  | 'stressed_crop'
  | 'disease_symptoms'
  | 'wet_soil'
  | 'dry_soil'
  | 'poor_lighting'
  | 'blurry_camera';
