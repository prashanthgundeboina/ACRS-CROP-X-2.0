import {
  AIAutomationMode,
  AIAgentStatus,
  AISafetyState,
  AIRiskLevel,
  AIIntentCategory,
  AIMemoryType,
  FarmerAIAgent,
  FarmerAIMemory,
  AIAgentInteraction,
  AIEscalation,
  AIAutomationSettings,
  AIAuditEvent,
  AIInsightSummary,
  AITaskType,
  AITaskStatus,
  AITask,
  AIFeedbackType,
  AIFeedback,
  AIAnomalyType,
  AIAnomaly,
  AIEventType,
  AIUrgencyLevel,
  AIActionOutcome,
  AIExplainability,
  AIRecommendation,
  AIEvent,
  AINetworkMetrics,
  FarmerAgentMetrics,
  DailyFarmPlan,
  ProviderTelemetryData,
  TelemetryDataStatus,
  TelemetryProviderId,
  TelemetryMode,
  FactVerificationLevel
} from '../../src/types';

export type {
  AIAutomationMode,
  AIAgentStatus,
  AISafetyState,
  AIRiskLevel,
  AIIntentCategory,
  AIMemoryType,
  FarmerAIAgent,
  FarmerAIMemory,
  AIAgentInteraction,
  AIEscalation,
  AIAutomationSettings,
  AIAuditEvent,
  AIInsightSummary,
  AITaskType,
  AITaskStatus,
  AITask,
  AIFeedbackType,
  AIFeedback,
  AIAnomalyType,
  AIAnomaly,
  AIEventType,
  AIUrgencyLevel,
  AIActionOutcome,
  AIExplainability,
  AIRecommendation,
  AIEvent,
  AINetworkMetrics,
  FarmerAgentMetrics,
  DailyFarmPlan,
  ProviderTelemetryData,
  TelemetryDataStatus,
  TelemetryProviderId,
  TelemetryMode,
  FactVerificationLevel
};

export interface AgentContext {
  farmer: {
    id: string;
    name: string;
    phone?: string;
    location?: string;
    primaryCrop?: string;
    farmSizeAcres?: number;
    language?: string;
  };
  agent: FarmerAIAgent;
  memories: FarmerAIMemory[];
  recentInteractions: AIAgentInteraction[];
  weatherRisk?: string;
  soilHealth?: {
    ph?: number;
    nitrogen?: string;
    phosphorus?: string;
    potassium?: string;
  };
}

export interface AgentResponse {
  intent: AIIntentCategory;
  response: string;
  confidence: number;
  riskLevel: AIRiskLevel;
  recommendedActions: string[];
  recommendedProducts?: Array<{ id: string; name: string; price: number; reason: string }>;
  escalated: boolean;
  escalationReason?: string;
  memoryUpdates?: Array<{
    type: AIMemoryType;
    key: string;
    value: any;
    confidence: number;
  }>;
}
