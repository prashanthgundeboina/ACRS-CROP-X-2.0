import { UserRole } from '../types';

// ============================================================
// PHASE 40 & 41: EXTENDED DATA TYPES & CONTRACTS
// ============================================================

export type ConsultationState =
  | 'REQUESTED'
  | 'MATCHING'
  | 'WAITING'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'CONNECTING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'ESCALATED';

export interface ConsultationCase {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerAvatar?: string;
  adviserId?: string;
  adviserName?: string;
  adviserAvatar?: string;
  farmName: string;
  farmZone: string;
  crop: string;
  cropStage?: string;
  problem: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: ConsultationState;
  
  // Real-time Context Snapshot
  telemetrySnapshot?: {
    soilMoisture?: string | number;
    soilPh?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    temperature?: string | number;
    humidity?: number;
    weatherCondition?: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    timestamp: string;
  };

  // Field Vision Snapshots & Annotations
  photos?: string[];
  snapshots?: Array<{
    id: string;
    imageUrl: string;
    timestamp: number;
    notes?: string;
    annotations?: any[];
  }>;

  // AI & Agronomist Deliberation
  aiSummary?: string;
  aiObservations?: string[];
  aiDifferentialDiagnosis?: Array<{
    diagnosis: string;
    confidence: number;
    reasoning: string;
  }>;
  adviserNotes?: string;
  finalRecommendation?: string;
  followUpDate?: string;

  createdAt: number;
  updatedAt: number;
  acceptedAt?: number;
  startedAt?: number;
  completedAt?: number;
}

export interface AdviserMatchScore {
  adviserId: string;
  adviserName: string;
  avatar?: string;
  specialization: string;
  distanceKm: number;
  rating: number;
  totalScore: number; // 0 - 100
  scoreBreakdown: {
    specialization: number; // max 30
    availability: number; // max 20
    emergencyCapability: number; // max 15
    distance: number; // max 15
    language: number; // max 10
    workload: number; // max 5
    historicalRelevance: number; // max 5
  };
  isOnline: boolean;
  activeConsultationsCount: number;
  matchReason: string;
}

// ------------------------------------------------------------
// 500+ CROP CATALOG DEFINITION
// ------------------------------------------------------------

export type CropCategory =
  | 'cereals'
  | 'pulses'
  | 'oilseeds'
  | 'vegetables'
  | 'fruits'
  | 'spices'
  | 'plantation'
  | 'medicinal'
  | 'flowers'
  | 'commercial';

export interface CropCatalogEntry {
  crop_id: string;
  common_name: string;
  scientific_name: string;
  crop_category: CropCategory;
  growing_season: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial' | 'Year-round';
  soil_preferences: string[];
  ph_range: { min: number; max: number; optimal: number };
  temperature_range: { min: number; max: number; optimal: number }; // Celsius
  water_requirement: 'Low' | 'Moderate' | 'High' | 'Very High';
  water_requirement_mm: { min: number; max: number };
  FAO_KC: { initial: number; mid: number; end: number };
  growth_stages: Array<{
    stage: string;
    durationDays: number;
    waterDemand: string;
    keyActivity: string;
  }>;
  fertilizer_guidance: {
    recommendedNPK: { n: number; p: number; k: number }; // kg/ha
    micronutrients?: string[];
    applicationSchedule: string;
  };
  known_diseases: string[];
  known_pests: string[];
  harvest_window: string;
  regional_suitability: string[];
  estimated_yield_per_hectare: string;
  expected_roi_range: string;
  source: string;
  last_verified: string;
}

// ------------------------------------------------------------
// 50+ SPECIALIST AGENTS DEFINITIONS
// ------------------------------------------------------------

export type AgentCategory =
  | 'crop'
  | 'soil'
  | 'water'
  | 'weather'
  | 'vision'
  | 'economics'
  | 'operations'
  | 'intelligence';

export interface SpecialistAgentMetadata {
  id: string;
  name: string;
  category: AgentCategory;
  description: string;
  role?: string;
  version: string;
  preferredModel: 'gemini-3.7-flash' | 'groq-fast' | 'deepseek-reasoner' | 'deterministic-engine';
  executionTimeMs?: number;
  status: 'idle' | 'executing' | 'completed' | 'failed';
}

export interface AgentExecutionResult {
  agentId: string;
  agentName: string;
  category: AgentCategory;
  timestamp: number;
  latencyMs: number;
  modelUsed: string;
  confidence: number;
  findings: string;
  dataPoints: Record<string, any>;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// ------------------------------------------------------------
// MULTI-MODEL AI PREDICTION & CONSENSUS CONTRACT
// ------------------------------------------------------------

export interface AiCropPredictionOutput {
  missionId: string;
  timestamp: number;
  totalLatencyMs: number;
  
  // Primary Recommendation & Alternatives
  topRecommendedCrop: CropCatalogEntry;
  alternativeCrops: Array<{
    crop: CropCatalogEntry;
    suitabilityScore: number; // 0 - 100
    confidence: number; // 0 - 100
    primaryAdvantage: string;
  }>;

  suitabilityScore: number;
  confidence: number;
  waterRequirement: string;
  expectedGrowthDuration: string;
  expectedHarvestWindow: string;
  soilCompatibility: {
    rating: 'Optimal' | 'Compatible' | 'Sub-optimal' | 'Incompatible';
    notes: string;
  };
  weatherCompatibility: {
    rating: 'Favorable' | 'Acceptable' | 'Marginal' | 'Adverse';
    notes: string;
  };
  diseaseRisk: {
    level: 'Low' | 'Medium' | 'High';
    keyRisks: string[];
    preventativeMeasures: string[];
  };
  marketConsideration: {
    demandIndex: string;
    expectedRoiRange: string;
    priceOutlook: string;
  };
  whyRecommended: string[];
  whatCouldGoWrong: string[];

  // Consensus & Model Transparency
  consensusSummary: {
    agreementScore: number; // 0 - 100
    isUnanimous: boolean;
    needsExpertReview: boolean;
    modelsParticipated: string[];
    groqFastResponse?: string;
    geminiAgronomicValidation?: string;
    deepseekScientificReasoning?: string;
  };

  // Invoked Agents
  agentsExecuted: AgentExecutionResult[];
}
