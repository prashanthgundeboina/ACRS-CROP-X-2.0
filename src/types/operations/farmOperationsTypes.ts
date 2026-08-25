import { SoilData, FarmZone, CropRecommendation } from '../../types';

export type CropGrowthStageId = 
  | 'planting'
  | 'germination'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'maturity'
  | 'harvest'
  | 'post_harvest'
  | 'selling';

export interface CropGrowthStageInfo {
  id: CropGrowthStageId;
  label: string;
  emoji: string;
  typicalDurationDays: number;
  description: string;
  keyWaterNeed: 'low' | 'moderate' | 'high' | 'critical';
  keyNutrientFocus: string;
  commonRisks: string[];
  recommendedAction: string;
  whatToAvoid: string;
}

export interface CropLifecycleState {
  cropName: string;
  plantingDate: string; // ISO date string (YYYY-MM-DD)
  daysSincePlanting: number;
  currentStageId: CropGrowthStageId;
  currentStageName: string;
  isManuallySetStage: boolean;
  estimatedNextStageDate?: string;
  estimatedNextStageName?: string;
  daysUntilNextStage?: number;
  estimatedHarvestStartDate: string;
  estimatedHarvestEndDate: string;
  daysUntilHarvest: number;
  stageProgressPercent: number; // 0 - 100
  totalLifecycleDays: number;
  healthHeadline: string;
  importantUpcomingTasks: string[];
}

export type FarmTaskCategory = 
  | 'irrigation'
  | 'fertilizer'
  | 'crop_inspection'
  | 'pest_monitoring'
  | 'harvest'
  | 'market'
  | 'soil_management'
  | 'general';

export type FarmTaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type FarmTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Skipped' | 'Snoozed';

export interface FarmTask {
  task_id: string;
  title: string;
  category: FarmTaskCategory;
  zone?: string;
  priority: FarmTaskPriority;
  due_date: string; // ISO date or 'YYYY-MM-DD'
  due_time?: string;
  reason: string;
  whatToAvoid?: string;
  status: FarmTaskStatus;
  created_from: 'automatic_ai' | 'weather_alert' | 'sensor_alert' | 'farmer_manual' | 'lifecycle_schedule';
  completed_at?: string;
  snoozed_until?: string;
  weatherWarning?: string; // e.g. "Rain expected in 4h: delay spraying"
  navTab?: string;
  navLabel?: string;
}

export interface FertilizerRecord {
  id: string;
  date: string;
  fertilizerType: string;
  amountKg: number;
  fieldZone: string;
  cropStage: string;
  notes?: string;
  weatherSuitability: 'optimal' | 'marginal' | 'unfavorable';
}

export interface CropHealthTimelineEvent {
  id: string;
  date: string;
  type: 'scan' | 'risk_alert' | 'ndvi_change' | 'sensor_spike' | 'weather_event' | 'observation' | 'fertilizer' | 'irrigation';
  title: string;
  description: string;
  severity?: 'normal' | 'warning' | 'critical';
  sensorSnapshot?: string;
}

export type HarvestWindowStatus = 'Not Ready' | 'Approaching' | 'Harvest Window' | 'Past Expected Window';

export interface HarvestPlan {
  cropName: string;
  targetHarvestDate: string;
  expectedYieldKg: number;
  harvestMethod: 'manual' | 'mechanized' | 'semi_mechanized';
  laborersNeeded: number;
  laborersSecured: number;
  transportBooked: boolean;
  transportType?: 'tractor_trolley' | 'small_truck' | 'commercial_logistics' | 'none';
  transportCapacityKg?: number;
  storageAvailable: boolean;
  storageType?: 'farm_shed' | 'cold_storage' | 'warehouse_mandi' | 'none';
  estimatedHarvestCostInr: number;
  notes?: string;
}

export interface PostHarvestRecord {
  harvestId: string;
  cropName: string;
  harvestDate: string;
  actualYieldKg: number;
  qualityGrade: 'Grade A (Premium)' | 'Grade B (Standard)' | 'Grade C (Fair)';
  moistureContentPercent?: number;
  decision: 'sell_immediately' | 'store_short_term' | 'store_long_term';
  selectedMandiOrBuyer?: string;
  estimatedSalePricePerKg: number;
  estimatedNetProfitInr: number;
  isSold: boolean;
}

export interface MarketDecisionScenario {
  id: 'sell_now' | 'wait' | 'store';
  label: 'SELL NOW' | 'WAIT' | 'STORE';
  headline: string;
  currentMandiPricePerKg: number;
  projectedPricePerKg: number;
  estimatedQuantityKg: number;
  estimatedGrossRevenue: number;
  estimatedStorageCost: number;
  estimatedTransportCost: number;
  estimatedNetReturn: number;
  riskFactor: 'low' | 'moderate' | 'high';
  reason: string;
  recommended: boolean;
}

export interface FarmWeeklySummary {
  weekLabel: string;
  overallHealthStatus: 'Optimal' | 'Caution' | 'Attention Required';
  headline: string;
  narrative: string;
  completedTasksCount: number;
  pendingTasksCount: number;
  skippedTasksCount: number;
  waterAppliedLiters: number;
  fertilizerApplicationsCount: number;
  pestRiskAlertsCount: number;
  weatherEventsCount: number;
  sensorAlertsResolved: number;
  marketPriceTrend: 'rising' | 'stable' | 'declining';
  keyTakeaway: string;
}
