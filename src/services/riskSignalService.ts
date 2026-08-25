import { RiskHistoryEntry, PlantObservationHistory, MutedRiskPreferences, CropRiskCategory, CropRiskLevel } from '../types/cropRisk';

const RISK_HISTORY_KEY = 'croperx_crop_risk_history_v1';
const PLANT_OBSERVATION_KEY = 'croperx_plant_observations_v1';
const RISK_PREFERENCES_KEY = 'croperx_risk_preferences_v1';

export const riskSignalService = {
  // 1. Risk History Snapshots
  getRiskHistory(): RiskHistoryEntry[] {
    try {
      const data = localStorage.getItem(RISK_HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse risk history from localStorage', e);
    }
    return [];
  },

  recordRiskSnapshot(entry: Omit<RiskHistoryEntry, 'id' | 'timestamp'>): void {
    try {
      const history = this.getRiskHistory();
      const now = Date.now();
      
      // Throttle snapshots: only record if last snapshot is > 30 minutes old OR score shifted significantly (> 10 points)
      const lastEntry = history[0];
      if (lastEntry) {
        const timeDiff = now - lastEntry.timestamp;
        const scoreDiff = Math.abs(lastEntry.overallScore - entry.overallScore);
        if (timeDiff < 30 * 60 * 1000 && scoreDiff < 10 && lastEntry.dominantRisk === entry.dominantRisk) {
          return; // No need to record duplicate unchanged state
        }
      }

      const newEntry: RiskHistoryEntry = {
        id: `rh_${now}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: now,
        date: entry.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        overallScore: entry.overallScore,
        overallLevel: entry.overallLevel,
        dominantRisk: entry.dominantRisk,
        topFactor: entry.topFactor,
        actionTaken: entry.actionTaken
      };

      const updated = [newEntry, ...history].slice(0, 30); // keep up to 30 snapshots
      localStorage.setItem(RISK_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save risk snapshot', e);
    }
  },

  // 2. Plant Diagnostic Observations (Vision Scanner Integration)
  getPlantObservations(): PlantObservationHistory[] {
    try {
      const data = localStorage.getItem(PLANT_OBSERVATION_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse plant observations', e);
    }
    return [];
  },

  recordPlantObservation(obs: Omit<PlantObservationHistory, 'id' | 'timestamp'>): PlantObservationHistory {
    const history = this.getPlantObservations();
    const now = Date.now();
    const newObs: PlantObservationHistory = {
      id: `po_${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      date: obs.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cropName: obs.cropName,
      zoneName: obs.zoneName,
      source: obs.source,
      finding: obs.finding,
      diagnosisText: obs.diagnosisText,
      severity: obs.severity,
      actionTaken: obs.actionTaken
    };

    const updated = [newObs, ...history].slice(0, 50);
    try {
      localStorage.setItem(PLANT_OBSERVATION_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save plant observation', e);
    }
    return newObs;
  },

  deletePlantObservation(id: string): void {
    const history = this.getPlantObservations().filter(item => item.id !== id);
    try {
      localStorage.setItem(PLANT_OBSERVATION_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to update plant observations', e);
    }
  },

  // 3. Farmer Preferences (Muting, Alert Thresholds, Dismissals)
  getPreferences(): MutedRiskPreferences {
    try {
      const data = localStorage.getItem(RISK_PREFERENCES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse risk preferences', e);
    }
    return {
      mutedCategories: [],
      alertThreshold: 'all',
      dismissedAlertIds: []
    };
  },

  savePreferences(prefs: MutedRiskPreferences): void {
    try {
      localStorage.setItem(RISK_PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save risk preferences', e);
    }
  },

  toggleCategoryMute(category: CropRiskCategory): MutedRiskPreferences {
    const current = this.getPreferences();
    const isMuted = current.mutedCategories.includes(category);
    const updated: MutedRiskPreferences = {
      ...current,
      mutedCategories: isMuted 
        ? current.mutedCategories.filter(c => c !== category)
        : [...current.mutedCategories, category]
    };
    this.savePreferences(updated);
    return updated;
  },

  dismissAlert(alertId: string): void {
    const current = this.getPreferences();
    if (!current.dismissedAlertIds.includes(alertId)) {
      const updated: MutedRiskPreferences = {
        ...current,
        dismissedAlertIds: [...current.dismissedAlertIds, alertId].slice(-20)
      };
      this.savePreferences(updated);
    }
  }
};
