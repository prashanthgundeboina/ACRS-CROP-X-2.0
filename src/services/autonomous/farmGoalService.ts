import { FarmGoalId } from '../../types/autonomous/farmAutonomousTypes';

const GOAL_STORAGE_KEY = 'croperx_active_farm_goal';

export interface FarmGoalDefinition {
  id: FarmGoalId;
  label: string;
  description: string;
  icon: string;
  color: string;
  focusDomains: string[];
}

export const FARM_GOALS: FarmGoalDefinition[] = [
  {
    id: 'Balanced Farming',
    label: 'Balanced Farming (Default)',
    description: 'Equally balances water conservation, crop health, yield optimization, and input costs.',
    icon: 'Scale',
    color: 'emerald',
    focusDomains: ['Hydrology', 'Crop Health', 'Soil', 'Economics']
  },
  {
    id: 'Save Water',
    label: 'Save Water & Hydrology Buffer',
    description: 'Prioritizes postponing irrigation when rainfall is forecast and maximizing soil water retention.',
    icon: 'Droplets',
    color: 'sky',
    focusDomains: ['Water Conservation', 'Rain Harvesting', 'Soil Moisture']
  },
  {
    id: 'Maximum Profit',
    label: 'Maximum Market Profit',
    description: 'Prioritizes Mandi spot price timing, high-grade sorting, and cost-efficient input allocations.',
    icon: 'TrendingUp',
    color: 'amber',
    focusDomains: ['Mandi Pricing', 'Harvest Timing', 'Arbitrage']
  },
  {
    id: 'Reduce Farm Cost',
    label: 'Reduce Farm Cost & Waste',
    description: 'Minimizes unnecessary chemical, fertilizer, and pump electricity expenditure without starving crops.',
    icon: 'PiggyBank',
    color: 'indigo',
    focusDomains: ['Input Optimization', 'Energy Conservation', 'Working Capital']
  },
  {
    id: 'Improve Crop Yield',
    label: 'Improve Crop Yield & Biomass',
    description: 'Maintains optimal NPK, micronutrient fertigation, and canopy turgidity for maximum quintals per acre.',
    icon: 'Sparkles',
    color: 'lime',
    focusDomains: ['Nutrient Uptake', 'Canopy Photosynthesis', 'Fruit Development']
  },
  {
    id: 'Reduce Crop Risk',
    label: 'Reduce Crop Risk & Stress',
    description: 'Aggressively monitors microclimates for early pest fungal cues, heat spikes, and root hypoxia.',
    icon: 'ShieldAlert',
    color: 'rose',
    focusDomains: ['Pathogen Scouting', 'Heat Buffer', 'Soil Balance']
  },
  {
    id: 'Prepare for Harvest',
    label: 'Prepare for Harvest Logistics',
    description: 'Focuses on picking crew scheduling, mandi crates, pre-harvest intervals, and rapid transport.',
    icon: 'Calendar',
    color: 'purple',
    focusDomains: ['Labor Mobilization', 'Crate Sanitization', 'Post-Harvest Logistics']
  }
];

class FarmGoalService {
  private activeGoal: FarmGoalId = 'Balanced Farming';

  constructor() {
    this.loadGoal();
  }

  private loadGoal() {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved && FARM_GOALS.some(g => g.id === saved)) {
        this.activeGoal = saved as FarmGoalId;
      }
    } catch {
      this.activeGoal = 'Balanced Farming';
    }
  }

  public getActiveGoal(): FarmGoalId {
    return this.activeGoal;
  }

  public getGoalDefinition(goalId?: FarmGoalId): FarmGoalDefinition {
    const id = goalId || this.activeGoal;
    return FARM_GOALS.find(g => g.id === id) || FARM_GOALS[0];
  }

  public setGoal(goalId: FarmGoalId): void {
    this.activeGoal = goalId;
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, goalId);
    } catch (e) {
      console.warn('Could not save active farm goal:', e);
    }
  }
}

export const farmGoalService = new FarmGoalService();
