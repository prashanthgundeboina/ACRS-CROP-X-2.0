export type CropRiskLevel = 'LOW' | 'WATCH' | 'MODERATE' | 'HIGH' | 'UNKNOWN';

export type CropRiskCategory = 
  | 'disease' 
  | 'pest' 
  | 'heat' 
  | 'water' 
  | 'heavy_rain' 
  | 'wind' 
  | 'soil' 
  | 'crop_health';

export interface RiskSignal {
  id: string;
  name: string;
  category: CropRiskCategory;
  currentValue: string | number;
  threshold: string | number;
  unit: string;
  isTriggered: boolean;
  severity: CropRiskLevel;
  description: string;
}

export interface RiskFactorEvaluation {
  category: CropRiskCategory;
  name: string;
  icon: string;
  score: number; // 0 - 100
  level: CropRiskLevel;
  levelLabel: string;
  what: string;
  why: string[];
  action: string;
  when: string;
  avoid: string;
  targetTab: string;
  targetTabLabel: string;
  signals: RiskSignal[];
  expertMetrics?: Record<string, string | number>;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEED_MORE_DATA';
}

export interface DailyRiskForecast {
  dayOffset: number; // 0..6
  dayName: string; // e.g. "Today", "Tomorrow", "Day 3 (Wed)"
  dateStr: string;
  overallScore: number;
  overallLevel: CropRiskLevel;
  dominantCategory: CropRiskCategory;
  categoryLevels: Record<CropRiskCategory, CropRiskLevel>;
  tempHigh: number;
  tempLow: number;
  rainProb: number;
  rainMm: number;
  humidity: number;
  windKmH: number;
  summary: string;
  topAction: string;
  explanation: {
    what: string;
    why: string[];
    action: string;
    when: string;
    avoid: string;
  };
}

export interface ZoneRiskEvaluation {
  zoneId: string;
  zoneName: string;
  cropName: string;
  areaHa: number;
  overallScore: number;
  overallLevel: CropRiskLevel;
  dominantCategory: CropRiskCategory;
  dominantRiskLabel: string;
  soilMoisture: number;
  topWhy: string;
  primaryAction: string;
  lastUpdated: string;
  targetTab: string;
}

export interface OverallCropRiskReport {
  farmName: string;
  cropName: string;
  overallScore: number;
  overallLevel: CropRiskLevel;
  overallStatusLabel: string;
  dominantCategory: CropRiskCategory;
  dominantRiskLabel: string;
  headline: string;
  summary: string;
  factors: Record<CropRiskCategory, RiskFactorEvaluation>;
  rankedFactors: RiskFactorEvaluation[];
  sevenDayForecast: DailyRiskForecast[];
  zoneRisks: ZoneRiskEvaluation[];
  lastUpdated: string;
  dataFreshness: {
    isFresh: boolean;
    lastSensorSync?: string;
    isOffline?: boolean;
    dataAgeHours: number;
  };
  missingDataWarnings: string[];
}

export interface PlantObservationHistory {
  id: string;
  date: string;
  timestamp: number;
  cropName: string;
  zoneName?: string;
  source: 'vision_scan' | 'field_scout' | 'farmer_log';
  finding: string;
  diagnosisText?: string;
  severity: 'LOW' | 'WATCH' | 'MODERATE' | 'HIGH';
  actionTaken?: string;
}

export interface RiskHistoryEntry {
  id: string;
  date: string;
  timestamp: number;
  overallScore: number;
  overallLevel: CropRiskLevel;
  dominantRisk: string;
  topFactor: string;
  actionTaken?: string;
}

export interface MutedRiskPreferences {
  mutedCategories: CropRiskCategory[];
  alertThreshold: 'all' | 'moderate_high' | 'high_only';
  dismissedAlertIds: string[];
}
