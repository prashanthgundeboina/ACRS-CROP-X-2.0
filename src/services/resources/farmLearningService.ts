import { FarmLearningPattern } from '../../types/resources/farmResourceTypes';

const STORAGE_LEARNING_PATTERNS_KEY = 'croperx_farm_learning_patterns_v1';

const DEFAULT_LEARNING_PATTERNS: FarmLearningPattern[] = [
  {
    id: 'pat_001',
    patternType: 'zone_drying_rate',
    title: 'Zone A Soil Dry-Down Curve Calibration',
    observedFrequency: 14,
    confidence: 'High',
    insightDescription: 'Sandy loam topsoil in North Field A dries ~22% faster than regional clay loam models between 11:00 AM and 3:00 PM.',
    agronomicImplication: 'Morning irrigation cycles should deliver 15% more volume to prevent afternoon sub-threshold drying.',
    lastObservedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },
  {
    id: 'pat_002',
    patternType: 'typical_irrigation_response',
    title: '30-Minute Drip Infiltration Dynamics',
    observedFrequency: 18,
    confidence: 'High',
    insightDescription: 'A 30-minute 5 HP pump drip cycle consistently elevates root-zone moisture by +18% to +23% within 45 minutes.',
    agronomicImplication: 'No need for extended 60+ minute single continuous watering sessions.',
    lastObservedDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 'pat_003',
    patternType: 'crop_stage_duration',
    title: 'Local Tomato Vegetative-to-Flowering Transition',
    observedFrequency: 3,
    confidence: 'Medium',
    insightDescription: 'Active vegetative phase completed in 26 days (3 days earlier than standard 29-day literature baseline due to warmer nights).',
    agronomicImplication: 'Begin phosphorus/potassium bloom nutrition 3 days earlier in subsequent seasons.',
    lastObservedDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 'pat_004',
    patternType: 'fertilizer_response',
    title: 'Split Fertigation Efficiency Ratio',
    observedFrequency: 8,
    confidence: 'High',
    insightDescription: 'Applying fertilizer in 3 split doses via drip reduced total chemical volume by 20% while maintaining identical NDVI canopy vigor.',
    agronomicImplication: 'Saves approx ₹1,800/acre in chemical costs per crop cycle.',
    lastObservedDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  }
];

export class FarmLearningService {
  private getStoredPatterns(): FarmLearningPattern[] {
    try {
      const stored = localStorage.getItem(STORAGE_LEARNING_PATTERNS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load learning patterns:', e);
    }
    return DEFAULT_LEARNING_PATTERNS;
  }

  public getLearningPatterns(): FarmLearningPattern[] {
    return this.getStoredPatterns();
  }

  public addObservedPattern(pattern: Omit<FarmLearningPattern, 'id' | 'lastObservedDate'>): FarmLearningPattern {
    const newPattern: FarmLearningPattern = {
      ...pattern,
      id: `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lastObservedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newPattern, ...this.getStoredPatterns()];
    try {
      localStorage.setItem(STORAGE_LEARNING_PATTERNS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save learning pattern:', e);
    }
    return newPattern;
  }
}

export const farmLearningService = new FarmLearningService();
