import { 
  HarvestWindowStatus, 
  HarvestPlan, 
  PostHarvestRecord 
} from '../../types/operations/farmOperationsTypes';
import { CropLifecycleState } from '../../types/operations/farmOperationsTypes';

const STORAGE_KEY_HARVEST_PLAN = 'croperx_harvest_plan_v1';
const STORAGE_KEY_POST_HARVEST_RECORDS = 'croperx_post_harvest_records_v1';

export const harvestIntelligenceService = {
  evaluateHarvestStatus(lifecycle: CropLifecycleState, ndviValue: number = 0.72): {
    status: HarvestWindowStatus;
    title: string;
    message: string;
    action: string;
    avoid: string;
    daysRemaining: number;
    ripenessPercentage: number;
    recommendedPickingWeather: string;
  } {
    const days = lifecycle.daysUntilHarvest;
    const progress = lifecycle.stageProgressPercent;

    if (days <= 0 || lifecycle.currentStageId === 'maturity' || lifecycle.currentStageId === 'harvest') {
      return {
        status: 'Harvest Window',
        title: '🌾 Harvest Window Active',
        message: `Your ${lifecycle.cropName} crop has reached physiological maturity. Field moisture and grain/fruit firmness are suitable for harvesting.`,
        action: 'Begin harvest picking during clear, dry weather. Prepare storage crates and transport logistics.',
        avoid: 'Do not harvest immediately after rain showers or while morning dew is heavy on the produce.',
        daysRemaining: 0,
        ripenessPercentage: 95,
        recommendedPickingWeather: 'Sunny morning / late afternoon (18-28°C)'
      };
    }

    if (days <= 14 || lifecycle.currentStageId === 'fruiting') {
      return {
        status: 'Approaching',
        title: '🌾 Harvest Window Approaching',
        message: `Your ${lifecycle.cropName} is in final maturation (~${days} days remaining). Terminal grain filling or fruit coloring is underway.`,
        action: 'Pre-book farm labor, line up transport trolleys, and stop heavy chemical pesticide sprays.',
        avoid: 'Avoid applying persistent synthetic chemicals close to the pre-harvest interval (PHI).',
        daysRemaining: days,
        ripenessPercentage: Math.min(88, Math.max(65, progress)),
        recommendedPickingWeather: 'Prepare equipment ahead of optimal forecast window'
      };
    }

    return {
      status: 'Not Ready',
      title: '🌱 Crop In Active Growth Stage',
      message: `Your ${lifecycle.cropName} is in ${lifecycle.currentStageName}. Harvest is estimated in ~${days} days.`,
      action: 'Focus on routine moisture balance, canopy disease scouting, and nutrient top-dressing.',
      avoid: 'Do not rush harvest before optimal seed or fruit maturity is reached.',
      daysRemaining: days,
      ripenessPercentage: Math.min(50, progress),
      recommendedPickingWeather: 'Growth phase active — regular management'
    };
  },

  getSavedHarvestPlan(cropName: string): HarvestPlan {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_HARVEST_PLAN}_${cropName}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    // Default plan
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 18);

    return {
      cropName,
      targetHarvestDate: targetDate.toISOString().split('T')[0],
      expectedYieldKg: 3500,
      harvestMethod: 'manual',
      laborersNeeded: 6,
      laborersSecured: 4,
      transportBooked: true,
      transportType: 'tractor_trolley',
      transportCapacityKg: 4000,
      storageAvailable: true,
      storageType: 'farm_shed',
      estimatedHarvestCostInr: 6500,
      notes: 'Planning 2 rounds of picking to harvest Grade A fruit at pink breaker stage.'
    };
  },

  saveHarvestPlan(plan: HarvestPlan) {
    try {
      localStorage.setItem(`${STORAGE_KEY_HARVEST_PLAN}_${plan.cropName}`, JSON.stringify(plan));
    } catch {
      // ignore
    }
  },

  getPostHarvestRecords(): PostHarvestRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_POST_HARVEST_RECORDS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    const d1 = new Date();
    d1.setDate(d1.getDate() - 30);

    return [
      {
        harvestId: 'ph_1',
        cropName: 'Tomato',
        harvestDate: d1.toISOString().split('T')[0],
        actualYieldKg: 3200,
        qualityGrade: 'Grade A (Premium)',
        moistureContentPercent: 12.5,
        decision: 'sell_immediately',
        selectedMandiOrBuyer: 'APMC Regional Wholesale Market',
        estimatedSalePricePerKg: 32,
        estimatedNetProfitInr: 78400,
        isSold: true
      }
    ];
  },

  addPostHarvestRecord(record: Omit<PostHarvestRecord, 'harvestId'>): PostHarvestRecord {
    const list = this.getPostHarvestRecords();
    const newRecord: PostHarvestRecord = {
      ...record,
      harvestId: `ph_${Date.now()}`
    };
    const updated = [newRecord, ...list];
    try {
      localStorage.setItem(STORAGE_KEY_POST_HARVEST_RECORDS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newRecord;
  }
};
