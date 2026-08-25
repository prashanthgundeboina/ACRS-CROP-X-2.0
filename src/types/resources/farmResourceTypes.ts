/**
 * CroperX 2.0 - Phase 9 Farm Resource, Cost & Risk Intelligence Types
 */

export type ExpenseCategory =
  | 'Seeds'
  | 'Fertilizer'
  | 'Pesticides'
  | 'Labour'
  | 'Irrigation'
  | 'Electricity'
  | 'Fuel'
  | 'Machinery'
  | 'Transport'
  | 'Storage'
  | 'Other';

export interface FarmExpenseItem {
  id: string;
  date: string;
  category: ExpenseCategory;
  amountInr: number;
  fieldZone?: string;
  cropSeason?: string;
  notes?: string;
  type: 'actual' | 'planned';
}

export interface BudgetVarianceCategory {
  category: ExpenseCategory;
  plannedInr: number;
  actualInr: number;
  variancePercent: number; // positive = over budget
  status: 'within_budget' | 'near_limit' | 'exceeded';
}

export interface FarmEconomicsSummary {
  totalActualCost: number;
  totalPlannedCost: number;
  expectedYieldKg: number;
  expectedPricePerKg: number;
  expectedRevenue: number;
  expectedProfit: number;
  roiPercentage: number;
  costPerAcre: number;
  profitPerAcre: number;
  costPerHectare: number;
  profitPerHectare: number;
  currency: string;
  budgetVariances: BudgetVarianceCategory[];
  costBreakdown: Array<{ category: ExpenseCategory; amount: number; percentage: number }>;
}

export interface WaterBudgetSummary {
  dailyRequirementLiters: number;
  weeklyRequirementLiters: number;
  waterUsedTodayLiters: number;
  waterRemainingSourceLiters: number;
  totalSourceCapacityLiters: number;
  waterDeficitLiters: number;
  daysOfAvailableWater: number;
  isDeficitCritical: boolean;
  cropStageEtcMm: number;
  rainOffsetLiters: number;
  evapotranspirationEt0Mm: number;
  cropKcFactor: number;
  farmerFriendlyMessage: string;
}

export interface PumpAnomalyAlert {
  id: string;
  type: 'long_runtime' | 'frequent_cycles' | 'unexpected_increase' | 'possible_inefficiency';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestedCheck: string;
}

export interface PumpIntelligenceSummary {
  pumpHorsePower: number;
  activePumps: number;
  todayRuntimeMinutes: number;
  weeklyRuntimeMinutes: number;
  todayWaterDeliveredLiters: number;
  todayElectricityKwh: number;
  weeklyElectricityKwh: number;
  todayElectricityCostInr: number;
  electricityRatePerKwh: number;
  anomalyAlerts: PumpAnomalyAlert[];
  efficiencyRating: 'optimal' | 'moderate' | 'review_required';
}

export type IrrigationVerificationStatus =
  | 'Effective'
  | 'Partially effective'
  | 'No significant response'
  | 'Insufficient data';

export interface IrrigationVerificationEvent {
  id: string;
  zoneId: string;
  zoneName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  estimatedWaterLiters: number;
  preMoisturePercent: number;
  postMoisturePercent: number;
  moistureDeltaPercent: number;
  status: IrrigationVerificationStatus;
  responseHeadline: string;
  recommendation: string;
  telemetryEvidence: string;
}

export interface YieldForecastRange {
  cropName: string;
  farmAreaAcres: number;
  unit: 'quintals/acre' | 'tons/ha' | 'kg/acre';
  lowerRange: number;
  upperRange: number;
  expectedMedian: number;
  totalProductionMin: number;
  totalProductionMax: number;
  totalProductionAvg: number;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceReason: string;
  influencingFactors: Array<{
    factor: 'Soil NPK & pH' | 'Weather & Heat Stress' | 'Precision Irrigation' | 'Pest & Disease Pressure' | 'Historical Farm Benchmark';
    impact: 'positive' | 'neutral' | 'negative';
    weight: number; // 0-100
    description: string;
  }>;
  farmerFriendlyHeadline: string;
}

export type RiskRadarPillar =
  | 'water'
  | 'weather'
  | 'crop'
  | 'soil'
  | 'market'
  | 'operations';

export interface FarmRiskRadarItem {
  pillar: RiskRadarPillar;
  name: string;
  score100: number; // 0 = safe, 100 = extreme risk
  severity: 'low' | 'moderate' | 'high' | 'critical';
  primaryHazard: string;
  affectedZoneOrCrop: string;
  timeToImpact: string;
  mitigationAction: string;
  probabilityPercent: number;
}

export interface FarmRiskRadarMatrix {
  overallRiskScore: number;
  highestRiskPillar: RiskRadarPillar;
  items: FarmRiskRadarItem[];
  prioritizedActionPlan: string[];
}

export interface FarmDecisionRecord {
  id: string;
  date: string;
  timestamp: string;
  recommendationCategory: 'irrigation' | 'fertilizer' | 'pest_control' | 'harvest' | 'market_sale';
  recommendationTitle: string;
  recommendationReason: string;
  confidencePercent: number;
  farmerAction: 'Accepted' | 'Rejected' | 'Modified' | 'Ignored';
  farmerActionDetails?: string;
  observedTelemetryDelta?: string;
  cropResponse?: string;
  financialOutcomeInr?: number;
  reviewStatus: 'logged' | 'verified_in_field';
}

export interface FarmLearningPattern {
  id: string;
  patternType: 
    | 'zone_drying_rate'
    | 'typical_irrigation_response'
    | 'crop_stage_duration'
    | 'actual_harvest_yield'
    | 'fertilizer_response'
    | 'historical_weather_impact';
  title: string;
  observedFrequency: number;
  confidence: 'High' | 'Medium' | 'Emerging';
  insightDescription: string;
  agronomicImplication: string;
  lastObservedDate: string;
}

export interface ResourceEfficiencyScores {
  waterEfficiencyScore: number;       // 0-100
  costEfficiencyScore: number;        // 0-100
  irrigationResponseScore: number;    // 0-100
  operationalTaskScore: number;       // 0-100
  overallEfficiencyScore: number;     // 0-100
  ratingGrade: 'A+' | 'A' | 'B' | 'C' | 'Needs Attention';
  waterEfficiencySummary: string;
  costEfficiencySummary: string;
  overallFarmerMessage: string;
}
