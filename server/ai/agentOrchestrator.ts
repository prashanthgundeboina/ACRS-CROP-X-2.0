import fs from 'fs';
import path from 'path';
import {
  AgentContext,
  AgentResponse,
  AIAgentInteraction,
  AIIntentCategory
} from './types';
import { FarmerAgentService } from './farmerAgentService';
import { MemoryService } from './memoryService';
import { RetrievalService } from './retrievalService';
import { PolicySafetyService } from './policySafetyService';
import { EscalationService } from './escalationService';
import { CropIntelligenceAgent } from './agents/cropIntelligenceAgent';
import { SoilAgent } from './agents/soilAgent';
import { IrrigationAgent } from './agents/irrigationAgent';
import { WeatherAgent } from './agents/weatherAgent';
import { FarmEconomicsAgent } from './agents/farmEconomicsAgent';
import { CommerceAgent } from './agents/commerceAgent';

const INTERACTIONS_FILE_PATH = path.join(process.cwd(), 'data', 'ai_interactions.json');

let interactionsStore: AIAgentInteraction[] = [];

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

export class AgentOrchestrator {
  /**
   * Main entry point for farmer AI messages.
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
    requestedEscalation: boolean = false
  ): Promise<AgentResponse> {
    if (!farmer || !farmer.id) {
      throw new Error('Authenticated farmer context is required.');
    }

    // 1. Provision or fetch agent
    const agent = FarmerAgentService.provisionOrGetAgent(farmer);
    const globalSettings = FarmerAgentService.getGlobalSettings();

    // 2. Check emergency kill switch
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

    // 3. Check for manual automation mode
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

    // 4. Retrieve context & memory
    const recentInteractions = interactionsStore.filter((i) => i.farmerId === farmer.id);
    const context: AgentContext = RetrievalService.buildContext(farmer, agent, recentInteractions);

    // 5. Intent Classification
    const intent: AIIntentCategory = RetrievalService.classifyIntent(message);

    // 6. Policy & Safety Engine Checks
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
        intent,
        response: `Policy Violation: ${policyResult.reason}. CropX AI cannot execute sensitive administrative, credential, or direct financial modifications.`,
        confidence: 100,
        riskLevel: 'HIGH',
        recommendedActions: [
          'Contact the CropX System Administrator for account credential assistance',
          'Use the official Settings tab to manage your own profile securely'
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
        policyResult.reason || 'High risk agricultural emergency',
        `Farmer: ${farmer.name} | Query: "${message}" | Risk: HIGH | Crop: ${farmer.primaryCrop}`,
        farmer.phone
      );

      return {
        intent,
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

    // 7. Route to specialized agent
    let rawResponse: AgentResponse;
    switch (intent) {
      case 'PEST':
      case 'CROP_HEALTH':
        rawResponse = CropIntelligenceAgent.handle(message, context);
        break;
      case 'SOIL':
        rawResponse = SoilAgent.handle(message, context);
        break;
      case 'IRRIGATION':
        rawResponse = IrrigationAgent.handle(message, context);
        break;
      case 'WEATHER':
        rawResponse = WeatherAgent.handle(message, context);
        break;
      case 'FARM_ECONOMICS':
        rawResponse = FarmEconomicsAgent.handle(message, context);
        break;
      case 'AGRI_STORE':
        rawResponse = CommerceAgent.handle(message, context);
        break;
      default:
        rawResponse = CropIntelligenceAgent.handle(message, context);
        break;
    }

    // 8. Confidence & Final Safety Check
    const safetyCheck = PolicySafetyService.validateConfidenceAndSafety(
      rawResponse.confidence,
      rawResponse.riskLevel
    );

    if (!safetyCheck.allowed) {
      const escalation = EscalationService.createEscalation(
        farmer.id,
        farmer.name,
        agent.id,
        safetyCheck.reason || 'Low AI model confidence',
        `Query: "${message}" | Model confidence below acceptable threshold`,
        farmer.phone
      );
      rawResponse.escalated = true;
      rawResponse.escalationReason = safetyCheck.reason;
      rawResponse.response += `\n\n[Note: This response has been flagged for human verification. Ticket: ${escalation.id}]`;
    }

    // 9. Persist memory updates
    if (rawResponse.memoryUpdates && rawResponse.memoryUpdates.length > 0) {
      MemoryService.recordExtractedFacts(farmer.id, agent.id, rawResponse.memoryUpdates);
    }

    // Record conversation summary memory
    MemoryService.upsertMemory(
      farmer.id,
      agent.id,
      'conversation',
      `last_query_${Date.now()}`,
      { query: message, summary: rawResponse.response.substring(0, 100) + '...' },
      'CONVERSATION_HISTORY',
      0.99
    );

    // 10. Persist interaction log
    const interactionRecord: AIAgentInteraction = {
      id: `INT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      farmerId: farmer.id,
      agentId: agent.id,
      intent: rawResponse.intent,
      riskLevel: rawResponse.riskLevel,
      confidence: rawResponse.confidence,
      inputSummary: message,
      outputSummary: rawResponse.response,
      recommendedActions: rawResponse.recommendedActions,
      recommendedProducts: rawResponse.recommendedProducts,
      escalated: rawResponse.escalated,
      escalationReason: rawResponse.escalationReason,
      createdAt: new Date().toISOString()
    };

    interactionsStore.unshift(interactionRecord);
    if (interactionsStore.length > 500) interactionsStore = interactionsStore.slice(0, 500);
    saveInteractions();

    // 11. Update agent metadata
    agent.lastInteractionAt = new Date().toISOString();
    agent.lastAnalysisAt = new Date().toISOString();

    // 12. Log audit event
    FarmerAgentService.logAuditEvent(
      'AI_RECOMMENDATION_CREATED',
      'AI_AGENT',
      'system',
      agent.id,
      {
        intent: rawResponse.intent,
        risk: rawResponse.riskLevel,
        confidence: rawResponse.confidence,
        escalated: rawResponse.escalated
      }
    );

    return rawResponse;
  }

  /**
   * Retrieves farmer AI insights summary.
   */
  static getFarmerInsights(farmer: {
    id: string;
    name: string;
    primaryCrop?: string;
    location?: string;
  }): any {
    const recent = interactionsStore.filter((i) => i.farmerId === farmer.id).slice(0, 5);
    const memories = MemoryService.getMemoriesByFarmer(farmer.id);

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
      recentInteractions: recent
    };
  }
}
