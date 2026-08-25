import { FarmDecisionRecord } from '../../types/resources/farmResourceTypes';

const STORAGE_DECISION_HISTORY_KEY = 'croperx_farm_decision_history_v1';

const DEFAULT_DECISION_RECORDS: FarmDecisionRecord[] = [
  {
    id: 'dec_001',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    timestamp: '06:30 AM',
    recommendationCategory: 'irrigation',
    recommendationTitle: 'Water North Field A (35 min)',
    recommendationReason: 'Soil moisture dropped to 24% during active flowering phase.',
    confidencePercent: 94,
    farmerAction: 'Accepted',
    farmerActionDetails: 'Ran 5 HP pump for 35 minutes via drip line 1.',
    observedTelemetryDelta: 'Soil moisture increased from 24% to 46%.',
    cropResponse: 'Canopy turgor fully restored; zero morning wilting.',
    financialOutcomeInr: -120, // electricity cost
    reviewStatus: 'verified_in_field'
  },
  {
    id: 'dec_002',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    timestamp: '04:15 PM',
    recommendationCategory: 'fertilizer',
    recommendationTitle: 'Apply Potassium Nitrate (15 kg)',
    recommendationReason: 'Fruit setting stage nutrient demand spike.',
    confidencePercent: 88,
    farmerAction: 'Modified',
    farmerActionDetails: 'Applied 12 kg via fertigation venturi injector.',
    observedTelemetryDelta: 'EC rose by 0.3 dS/m; leaf chlorophyll SPAD +4.',
    cropResponse: 'Uniform fruit sizing across rows 1–8.',
    financialOutcomeInr: -1800,
    reviewStatus: 'verified_in_field'
  },
  {
    id: 'dec_003',
    date: new Date(Date.now() - 9 * 86400000).toISOString().split('T')[0],
    timestamp: '09:00 AM',
    recommendationCategory: 'pest_control',
    recommendationTitle: 'Prophylactic Neem Spray against Whiteflies',
    recommendationReason: 'Warm humid microclimate favored early nymph emergence.',
    confidencePercent: 82,
    farmerAction: 'Accepted',
    farmerActionDetails: 'Sprayed organic cold-pressed neem oil (5 ml/L).',
    observedTelemetryDelta: 'Whitefly trap count dropped by 75%.',
    cropResponse: 'Clean foliage without sooty mold.',
    financialOutcomeInr: -450,
    reviewStatus: 'verified_in_field'
  }
];

export class FarmDecisionHistoryService {
  private getStoredDecisions(): FarmDecisionRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_DECISION_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load decision history:', e);
    }
    return DEFAULT_DECISION_RECORDS;
  }

  public getDecisions(): FarmDecisionRecord[] {
    return this.getStoredDecisions();
  }

  public recordDecision(record: Omit<FarmDecisionRecord, 'id' | 'date' | 'timestamp' | 'reviewStatus'>): FarmDecisionRecord {
    const newRecord: FarmDecisionRecord = {
      ...record,
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reviewStatus: 'logged'
    };

    const updated = [newRecord, ...this.getStoredDecisions()];
    try {
      localStorage.setItem(STORAGE_DECISION_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save decision:', e);
    }
    return newRecord;
  }

  public updateDecisionOutcome(id: string, outcome: {
    observedTelemetryDelta?: string;
    cropResponse?: string;
    financialOutcomeInr?: number;
  }): void {
    const records = this.getStoredDecisions();
    const updated = records.map(r => {
      if (r.id === id) {
        return {
          ...r,
          ...outcome,
          reviewStatus: 'verified_in_field' as const
        };
      }
      return r;
    });

    try {
      localStorage.setItem(STORAGE_DECISION_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update decision outcome:', e);
    }
  }
}

export const farmDecisionHistoryService = new FarmDecisionHistoryService();
