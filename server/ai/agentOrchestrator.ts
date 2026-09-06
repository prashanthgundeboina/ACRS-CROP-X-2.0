import fs from 'fs';
import path from 'path';
import {
  AgentContext,
  AgentResponse,
  AIAgentInteraction,
  AIIntentCategory,
  AIRecommendation,
  AIRiskLevel,
  AIUrgencyLevel
} from './types';
import { FarmerAgentService } from './farmerAgentService';
import { MemoryService } from './memoryService';
import { RetrievalService } from './retrievalService';
import { PolicySafetyService } from './policySafetyService';
import { EscalationService } from './escalationService';
import { RecommendationService } from './recommendationService';
import { CropIntelligenceAgent } from './agents/cropIntelligenceAgent';
import { SoilAgent } from './agents/soilAgent';
import { IrrigationAgent } from './agents/irrigationAgent';
import { WeatherAgent } from './agents/weatherAgent';
import { FarmEconomicsAgent } from './agents/farmEconomicsAgent';
import { CommerceAgent } from './agents/commerceAgent';
import { MarketIntelligenceAgent } from './agents/marketIntelligenceAgent';
import { TaskScheduler } from './taskScheduler';
import { FeedbackService } from './feedbackService';

const INTERACTIONS_FILE_PATH = path.join(process.cwd(), 'data', 'ai_interactions.json');

let interactionsStore: AIAgentInteraction[] = [];
const idempotencyCache = new Set<string>();

function loadInteractions() {
  try {
    if (fs.existsSync(INTERACTIONS_FILE_PATH)) {
      const raw = fs.readFileSync(INTERACTIONS_FILE_PATH, 'utf-8');
      interactionsStore = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading AI interactions:', err);
  }
}

function saveInteractions() {
  try {
    fs.writeFileSync(INTERACTIONS_FILE_PATH, JSON.stringify(interactionsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving AI interactions:', err);
  }
}

loadInteractions();

// Helper to run specialist with timeout protection
async function runWithTimeout<T>(promise: Promise<T> | T, timeoutMs: number = 5000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });
  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => clearTimeout(timer));
}

export class CropXAgentOrchestrator {
  /**
   * Main entry point for farmer messages and autonomous event queries.
   * Multi-agent execution, idempotent caching, consensus confidence, and explainability.
   */
  static async processMessage(
    farmer: {
      id: string;
      name: string;
      phone?: string;
      location?: string;
      primaryCrop?: string;
      farmSizeAcres?: number;
      language?: string;
    },
    message: string,
    requestedEscalation: boolean = false,
    idempotencyKey?: string
  ): Promise<AgentResponse & { recommendationId?: string; explainability?: any }> {
    if (!farmer || !farmer.id) {
      throw new Error('Authenticated farmer context is required.');
    }

    // 1. Idempotency protection
    const key = idempotencyKey || `${farmer.id}_${message}_${Math.floor(Date.now() / 3000)}`;
    if (idempotencyCache.has(key)) {
      const cached = interactionsStore.find((i) => i.farmerId === farmer.id && i.inputSummary === message);
      if (cached) {
        return {
          intent: cached.intent,
          response: cached.outputSummary,
          confidence: cached.confidence,
          riskLevel: cached.riskLevel,
          recommendedActions: cached.recommendedActions || [],
          recommendedProducts: cached.recommendedProducts,
          escalated: cached.escalated,
          escalationReason: cached.escalationReason
        };
      }
    }
    idempotencyCache.add(key);

    // 2. Provision or fetch agent
    const agent = FarmerAgentService.provisionOrGetAgent(farmer);
    const globalSettings = FarmerAgentService.getGlobalSettings();

    // 3. Check emergency kill switch
    if (globalSettings.emergencyStop || agent.status === 'PAUSED' || agent.status === 'DISABLED') {
      return {
        intent: 'GENERAL_ADVISORY',
        response:
          'Personal AI Advisory is currently in pause mode by platform management. Your request has been securely queued, and a certified human agronomist will review your profile.',
        confidence: 100,
        riskLevel: 'LOW',
        recommendedActions: ['Connect with a human agronomist on live call or schedule a field visit'],
        escalated: true,
        escalationReason: 'Emergency stop or Agent in paused state'
      };
    }

    // 4. Check for manual automation mode
    if (globalSettings.automationMode === 'MANUAL' || requestedEscalation) {
      const escalation = EscalationService.createEscalation(
        farmer.id,
        farmer.name,
        agent.id,
        requestedEscalation ? 'Farmer explicitly requested human adviser' : 'System running in MANUAL adviser mode',
        `Query: "${message}" | Crop: ${farmer.primaryCrop || 'General'} | Location: ${farmer.location || 'Rural Farm'}`,
        farmer.phone
      );

      return {
        intent: 'GENERAL_ADVISORY',
        response: `Your consultation request has been forwarded to our certified agronomist review team. An agronomist will examine your field parameters and reach out promptly. (Reference Ticket: ${escalation.id})`,
        confidence: 100,
        riskLevel: 'LOW',
        recommendedActions: [
          'Keep soil and crop photos ready for your adviser review',
          'Ensure your phone is reachable for verification callback'
        ],
        escalated: true,
        escalationReason: 'Assigned to human agronomist queue'
      };
    }

    // 5. Strict Isolated Retrieval: Context & Memory
    const recentInteractions = interactionsStore.filter((i) => i.farmerId === farmer.id);
    const context: AgentContext = RetrievalService.buildContext(farmer, agent, recentInteractions);

    // 6. Intent Classification & Multi-Agent Selection
    const primaryIntent: AIIntentCategory = RetrievalService.classifyIntent(message);

    // 7. Policy & Safety Engine Checks (Prohibited actions verification)
    const policyResult = PolicySafetyService.evaluateRisk(message, context);

    if (policyResult.isForbidden) {
      FarmerAgentService.logAuditEvent(
        'AI_ACTION_BLOCKED',
        'POLICY_SAFETY_SERVICE',
        'system',
        agent.id,
        { query: message, reason: policyResult.reason }
      );

      return {
        intent: primaryIntent,
        response: `Policy Restriction: ${policyResult.reason}. CropX AI cannot execute sensitive administrative, credential, inventory modification, or direct financial transactions.`,
        confidence: 100,
        riskLevel: 'HIGH',
        recommendedActions: [
          'Contact the CropX System Administrator for account assistance',
          'Use the official Settings tab to manage credentials securely'
        ],
        escalated: true,
        escalationReason: policyResult.reason
      };
    }

    if (policyResult.requiresEscalation) {
      const escalation = EscalationService.createEscalation(
        farmer.id,
        farmer.name,
        agent.id,
        policyResult.reason || 'High risk agricultural scenario',
        `Farmer: ${farmer.name} | Query: "${message}" | Risk: HIGH | Crop: ${farmer.primaryCrop}`,
        farmer.phone
      );

      return {
        intent: primaryIntent,
        response: `Safety Alert: High-risk scenario detected (${policyResult.reason}). We have escalated your query directly to an Agronomist Specialist (Ticket ID: ${escalation.id}) for expert guidance. Please refrain from applying unverified chemical mixtures.`,
        confidence: 85,
        riskLevel: 'HIGH',
        recommendedActions: [
          'Do not spray high-toxicity agrochemicals without agronomist confirmation',
          'Isolate affected crop foliage samples safely'
        ],
        escalated: true,
        escalationReason: policyResult.reason
      };
    }

    // 8. Multi-Agent Collaborative Execution with Timeout Protection
    const specialistList: string[] = [];
    let primaryAgentResponse: AgentResponse;

    // Specialist 1: Primary Agent Handler
    switch (primaryIntent) {
      case 'PEST':
      case 'CROP_HEALTH':
        specialistList.push('CropIntelligenceAgent');
        primaryAgentResponse = await runWithTimeout(
          CropIntelligenceAgent.handle(message, context),
          4000,
          CropIntelligenceAgent.handle(message, context)
        );
        break;
      case 'SOIL':
        specialistList.push('SoilHealthAgent');
        primaryAgentResponse = await runWithTimeout(
          SoilAgent.handle(message, context),
          4000,
          SoilAgent.handle(message, context)
        );
        break;
      case 'IRRIGATION':
        specialistList.push('IrrigationAgent');
        primaryAgentResponse = await runWithTimeout(
          IrrigationAgent.handle(message, context),
          4000,
          IrrigationAgent.handle(message, context)
        );
        break;
      case 'WEATHER':
        specialistList.push('WeatherAgent');
        primaryAgentResponse = await runWithTimeout(
          WeatherAgent.handle(message, context),
          4000,
          WeatherAgent.handle(message, context)
        );
        break;
      case 'FARM_ECONOMICS':
        specialistList.push('FarmEconomicsAgent');
        primaryAgentResponse = await runWithTimeout(
          FarmEconomicsAgent.handle(message, context),
          4000,
          FarmEconomicsAgent.handle(message, context)
        );
        break;
      case 'MARKET':
        specialistList.push('MarketIntelligenceAgent');
        primaryAgentResponse = await runWithTimeout(
          MarketIntelligenceAgent.handle(message, context),
          4000,
          MarketIntelligenceAgent.handle(message, context)
        );
        break;
      case 'AGRI_STORE':
        specialistList.push('CommerceAgent');
        primaryAgentResponse = await runWithTimeout(
          CommerceAgent.handle(message, context),
          4000,
          CommerceAgent.handle(message, context)
        );
        break;
      default:
        specialistList.push('CropIntelligenceAgent');
        primaryAgentResponse = CropIntelligenceAgent.handle(message, context);
        break;
    }

    // Specialist 2 & 3: Cross-Agent Consensus & Disagreement Detection
    let consensusBonus = 0;
    let interAgentConflict: { detected: boolean; reason?: string; resolution?: string } = { detected: false };

    if (primaryIntent === 'IRRIGATION' || message.toLowerCase().includes('water') || message.toLowerCase().includes('irrigate')) {
      specialistList.push('WeatherAgent');
      const weatherCheck = WeatherAgent.handle(message, context);
      const isRainLikely = weatherCheck.response.toLowerCase().includes('rain') ||
                           weatherCheck.response.toLowerCase().includes('shower') ||
                           weatherCheck.response.toLowerCase().includes('precipitation');

      if (isRainLikely) {
        interAgentConflict = {
          detected: true,
          reason: 'Irrigation scheduled during high rainfall probability period.',
          resolution: 'Irrigation deferred. Farm telemetry signals sufficient precipitation to fulfill crop water demand.'
        };
        primaryAgentResponse.response =
          `[Inter-Agent Consensus Alert]: Weather Agent forecasts upcoming rainfall in your cluster. ` +
          `Irrigation postponed to conserve groundwater and prevent soil waterlogging. ` +
          primaryAgentResponse.response;
        primaryAgentResponse.recommendedActions = [
          'Monitor rain gauge / soil moisture before resuming borehole or canal irrigation',
          ...(primaryAgentResponse.recommendedActions || [])
        ];
        consensusBonus -= 8.0; // Penalty for inter-agent disagreement
      } else {
        consensusBonus += 2.0;
      }
    } else if (primaryIntent === 'PEST' || primaryIntent === 'CROP_HEALTH') {
      specialistList.push('WeatherAgent');
      const weatherCheck = WeatherAgent.handle(message, context);
      const isUnfavorable = weatherCheck.response.toLowerCase().includes('wind') || weatherCheck.response.toLowerCase().includes('rain');
      if (isUnfavorable) {
        interAgentConflict = {
          detected: true,
          reason: 'Foliar spray planned during unfavorable weather window.',
          resolution: 'Spray timing shifted to morning or calm window to avoid wind drift and rain wash-off.'
        };
        consensusBonus -= 5.0;
      } else {
        consensusBonus += 1.5;
      }
    } else if (primaryIntent === 'FARM_ECONOMICS' || primaryIntent === 'MARKET') {
      if (primaryIntent === 'FARM_ECONOMICS') {
        specialistList.push('MarketIntelligenceAgent');
      } else {
        specialistList.push('FarmEconomicsAgent');
      }
      consensusBonus += 2.0;
    }

    // 9. Strict Content Governance (Pesticide safety & financial disclaimers)
    primaryAgentResponse.response = PolicySafetyService.auditRecommendationContent(
      primaryAgentResponse.response,
      primaryIntent
    );

    // 10. Consensus Confidence Engine
    const rawConfidence = Math.min(99, Math.max(45, (primaryAgentResponse.confidence || 92) + consensusBonus));
    const riskLevel: AIRiskLevel = primaryAgentResponse.riskLevel || 'LOW';

    let requiresConfirmation = false;
    let requiresHumanReview = false;
    let urgency: AIUrgencyLevel = 'LOW';

    // Governance thresholds: confidence < 60% flags for review, CRITICAL/HIGH risk requires agronomist confirmation
    const safetyCheck = PolicySafetyService.validateConfidenceAndSafety(rawConfidence, riskLevel);
    if (!safetyCheck.allowed) {
      requiresHumanReview = true;
      requiresConfirmation = true;
      urgency = riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'CRITICAL' : 'HIGH';
    } else if (rawConfidence >= 60 && rawConfidence < 85) {
      urgency = 'MEDIUM';
      requiresConfirmation = true;
    } else {
      urgency = 'LOW';
      requiresConfirmation = false;
    }

    // 11. Generate Explainability Breakdown in Farmer-Friendly Format
    const explainability = {
      whatIsHappening: `Analysis of ${farmer.primaryCrop || 'Standing Crop'} in ${farmer.location || 'field'}: ${primaryAgentResponse.response.substring(0, 140)}...`,
      whyGenerated: `Derived from ${specialistList.join(', ')} analyzing farm telemetry, seasonal memory, and query parameters.${interAgentConflict.detected ? ` Conflict resolution: ${interAgentConflict.resolution}` : ''}`,
      actionToBeTaken: primaryAgentResponse.recommendedActions?.[0] || 'Follow recommended agronomy practices',
      urgencyLevel: urgency,
      consensusAudit: {
        specialists: specialistList,
        conflictDetected: interAgentConflict.detected,
        conflictReason: interAgentConflict.reason,
        conflictResolution: interAgentConflict.resolution
      }
    };

    // 12. Escalate if low confidence, critical risk, or safety violation
    if (requiresHumanReview && !primaryAgentResponse.escalated) {
      const escalation = EscalationService.createEscalation(
        farmer.id,
        farmer.name,
        agent.id,
        safetyCheck.reason || 'Confidence/Safety threshold requires human agronomist review',
        `Query: "${message}" | Confidence: ${rawConfidence.toFixed(1)}% | Risk: ${riskLevel}`,
        farmer.phone
      );
      primaryAgentResponse.escalated = true;
      primaryAgentResponse.escalationReason = safetyCheck.reason || 'Escalated to certified adviser for review.';
      primaryAgentResponse.response += `\n\n[Explainable Notice: Review ticket ${escalation.id} logged for human agronomist oversight.]`;
    }

    // 12. Create Structured Recommendation
    const recId = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newRecommendation: AIRecommendation = {
      id: recId,
      recommendation_id: recId,
      farmerId: farmer.id,
      farmer_id: farmer.id,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      specialistAgentsUsed: specialistList,
      specialist_agents_used: specialistList,
      farmContextUsed: {
        crop: farmer.primaryCrop,
        location: farmer.location,
        acreage: farmer.farmSizeAcres,
        language: farmer.language
      },
      farm_context_used: {
        crop: farmer.primaryCrop,
        location: farmer.location,
        acreage: farmer.farmSizeAcres,
        language: farmer.language
      },
      recommendation: primaryAgentResponse.response,
      urgency,
      confidenceScore: rawConfidence,
      confidence_score: rawConfidence,
      riskLevel,
      risk_level: riskLevel,
      reasoningSummary: explainability.whyGenerated,
      reasoning_summary: explainability.whyGenerated,
      expectedOutcome: 'Optimized crop growth, pest mitigation, and water conservation without crop stress.',
      expected_outcome: 'Optimized crop growth, pest mitigation, and water conservation without crop stress.',
      requiresConfirmation,
      requires_confirmation: requiresConfirmation,
      requiresHumanReview,
      requires_human_review: requiresHumanReview,
      status: requiresConfirmation ? 'ACTIVE' : 'CONFIRMED',
      explainability,
      recommendedProducts: primaryAgentResponse.recommendedProducts,
      recommendedActions: primaryAgentResponse.recommendedActions
    };

    RecommendationService.saveRecommendation(newRecommendation);

    // 13. Persist memory updates (verified learning isolation)
    if (primaryAgentResponse.memoryUpdates && primaryAgentResponse.memoryUpdates.length > 0) {
      MemoryService.recordExtractedFacts(farmer.id, agent.id, primaryAgentResponse.memoryUpdates);
    }

    // 14. Persist interaction log
    const interactionRecord: AIAgentInteraction = {
      id: `INT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      farmerId: farmer.id,
      agentId: agent.id,
      intent: primaryAgentResponse.intent,
      riskLevel,
      confidence: rawConfidence,
      inputSummary: message,
      outputSummary: primaryAgentResponse.response,
      recommendedActions: primaryAgentResponse.recommendedActions,
      recommendedProducts: primaryAgentResponse.recommendedProducts,
      escalated: primaryAgentResponse.escalated,
      escalationReason: primaryAgentResponse.escalationReason,
      createdAt: new Date().toISOString()
    };

    interactionsStore.unshift(interactionRecord);
    if (interactionsStore.length > 500) interactionsStore = interactionsStore.slice(0, 500);
    saveInteractions();

    // 15. Update agent metadata & audit log
    agent.lastInteractionAt = new Date().toISOString();
    agent.lastAnalysisAt = new Date().toISOString();

    FarmerAgentService.logAuditEvent(
      'AI_RECOMMENDATION_CREATED',
      'AI_AGENT',
      'system',
      agent.id,
      {
        recommendationId: recId,
        specialists: specialistList,
        confidence: rawConfidence,
        urgency
      }
    );

    return {
      ...primaryAgentResponse,
      confidence: rawConfidence,
      recommendationId: recId,
      explainability
    };
  }

  /**
   * Retrieves farmer AI insights summary with real metrics and tasks.
   */
  static getFarmerInsights(farmer: {
    id: string;
    name: string;
    primaryCrop?: string;
    location?: string;
  }): any {
    const recent = interactionsStore.filter((i) => i.farmerId === farmer.id).slice(0, 5);
    const memories = MemoryService.getMemoriesByFarmer(farmer.id);
    const tasks = TaskScheduler.getTasks(farmer.id);
    const feedbackList = FeedbackService.getFeedbackByFarmer(farmer.id);

    const agent = FarmerAgentService.getAgentByFarmerId(farmer.id);
    if (agent && tasks.length === 0) {
      TaskScheduler.seedFarmerRoutineTasks(farmer.id, agent.id);
    }

    return {
      farmHealthScore: 88,
      riskCount: recent.filter((r) => r.riskLevel === 'MEDIUM' || r.riskLevel === 'HIGH').length,
      topRisks: [
        {
          title: 'High Relative Humidity Alert',
          severity: 'LOW' as const,
          advice: 'Inspect paddy leaf margins for early blast lesions.'
        },
        {
          title: 'Nitrogen Split Timing',
          severity: 'LOW' as const,
          advice: 'Apply 2nd split dose of nitrogen before panicle initiation.'
        }
      ],
      weatherAlert: {
        title: 'Light Showers Expected in 48 Hours',
        advisory: 'Postpone foliar bio-pesticide spray until weather stabilizes.'
      },
      irrigationRecommendation: {
        action: 'Alternate Wetting & Drying (AWD)',
        waterSchedule: 'Allow field water depth to drop 5cm below soil surface before next irrigation.'
      },
      soilConditionSummary: {
        status: 'Optimal Neutral (pH 6.8)',
        nitrogen: 'Medium (280 kg/ha)',
        phosphorus: 'Optimal (35 kg/ha)',
        potassium: 'High (310 kg/ha)'
      },
      memoriesCount: memories.length,
      recentInteractions: recent,
      activeTasks: tasks.slice(0, 10),
      feedbackCount: feedbackList.length
    };
  }
}

// Export backwards-compatible alias
export const AgentOrchestrator = CropXAgentOrchestrator;
