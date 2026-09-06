import fs from 'fs';
import path from 'path';
import { AIRecommendation, AIActionOutcome } from './types';
import { MemoryService } from './memoryService';
import { FarmerAgentService } from './farmerAgentService';

const RECOMMENDATIONS_FILE = path.join(process.cwd(), 'data', 'ai_recommendations.json');
const OUTCOMES_FILE = path.join(process.cwd(), 'data', 'ai_recommendation_outcomes.json');

let recommendationsStore: AIRecommendation[] = [];
let outcomesStore: Array<{
  id: string;
  recommendationId: string;
  farmerId: string;
  action: AIActionOutcome;
  outcomeText?: string;
  yieldImpact?: string;
  validated: boolean;
  timestamp: string;
}> = [];

function loadData() {
  try {
    if (fs.existsSync(RECOMMENDATIONS_FILE)) {
      recommendationsStore = JSON.parse(fs.readFileSync(RECOMMENDATIONS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading recommendations store:', e);
  }

  try {
    if (fs.existsSync(OUTCOMES_FILE)) {
      outcomesStore = JSON.parse(fs.readFileSync(OUTCOMES_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading outcomes store:', e);
  }
}

function saveData() {
  try {
    fs.writeFileSync(RECOMMENDATIONS_FILE, JSON.stringify(recommendationsStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving recommendations store:', e);
  }

  try {
    fs.writeFileSync(OUTCOMES_FILE, JSON.stringify(outcomesStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving outcomes store:', e);
  }
}

loadData();

export class RecommendationService {
  static saveRecommendation(rec: AIRecommendation): AIRecommendation {
    recommendationsStore.unshift(rec);
    if (recommendationsStore.length > 500) {
      recommendationsStore = recommendationsStore.slice(0, 500);
    }
    saveData();
    return rec;
  }

  static getRecommendations(farmerId?: string): AIRecommendation[] {
    if (farmerId) {
      return recommendationsStore.filter((r) => r.farmerId === farmerId);
    }
    return recommendationsStore;
  }

  static getRecommendationById(id: string): AIRecommendation | undefined {
    return recommendationsStore.find((r) => r.id === id || r.recommendation_id === id);
  }

  /**
   * Farmer confirms or acknowledges an AI recommendation
   */
  static confirmRecommendation(id: string, action: AIActionOutcome = 'ACCEPTED'): AIRecommendation | null {
    const rec = recommendationsStore.find((r) => r.id === id || r.recommendation_id === id);
    if (!rec) return null;

    rec.farmerAction = action;
    rec.status = action === 'ACCEPTED' ? 'CONFIRMED' : 'REJECTED';
    saveData();

    FarmerAgentService.logAuditEvent(
      'AI_RECOMMENDATION_CREATED',
      'FARMER',
      rec.farmerId,
      rec.id,
      { action, recommendation: rec.recommendation }
    );

    return rec;
  }

  /**
   * Continuous Learning Pipeline:
   * Records observed farm outcome. Only VALIDATED outcomes become permanent knowledge in long-term memory!
   * Unverified AI assumptions are NEVER permanently memorized.
   */
  static recordOutcome(
    recommendationId: string,
    farmerId: string,
    action: AIActionOutcome,
    outcomeText: string,
    validated: boolean = true
  ) {
    const rec = recommendationsStore.find((r) => r.id === recommendationId || r.recommendation_id === recommendationId);
    if (rec) {
      rec.outcomeObserved = outcomeText;
      rec.outcomeValidated = validated;
      rec.farmerAction = action;
    }

    const outcomeRecord = {
      id: `OUT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      recommendationId,
      farmerId,
      action,
      outcomeText,
      validated,
      timestamp: new Date().toISOString()
    };

    outcomesStore.unshift(outcomeRecord);
    saveData();

    // Strict Memory Rule: If validated, store as 'verified_outcome_memory' in isolated farmer memory
    if (validated) {
      const agent = FarmerAgentService.getAgentByFarmerId(farmerId);
      const agentId = agent ? agent.id : `AGT-${farmerId}`;
      MemoryService.upsertMemory(
        farmerId,
        agentId,
        'verified_outcome_memory' as any,
        `outcome_${recommendationId}`,
        {
          recommendation: rec?.recommendation || 'Recommendation',
          farmerAction: action,
          outcomeObserved: outcomeText,
          validationSource: 'FIELD_AUDIT_CONFIRMATION',
          recordedAt: new Date().toISOString()
        },
        'VERIFIED_OUTCOME_AUDIT',
        1.0
      );
    }

    return outcomeRecord;
  }

  static getOutcomes(farmerId?: string) {
    if (farmerId) {
      return outcomesStore.filter((o) => o.farmerId === farmerId);
    }
    return outcomesStore;
  }
}
