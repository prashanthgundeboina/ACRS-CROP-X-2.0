import { SoilData, FarmZone, CropRecommendation } from '../../types';

export type FarmAgentId = 
  | 'irrigation'
  | 'crop_health'
  | 'soil'
  | 'weather'
  | 'pest_disease'
  | 'market'
  | 'finance'
  | 'harvest'
  | 'iot_health';

export type FarmGoalId = 
  | 'Maximum Profit'
  | 'Save Water'
  | 'Reduce Farm Cost'
  | 'Improve Crop Yield'
  | 'Reduce Crop Risk'
  | 'Prepare for Harvest'
  | 'Balanced Farming';

export type AgentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIMAL';

export type ActionPermissionMode = 'advisory' | 'supervised' | 'safe_automation';

export interface AgentRecommendation {
  id: string;
  agentId: FarmAgentId;
  agentName: string;
  domain: string;
  severity: AgentSeverity;
  headline: string;
  what: string;           // Plain language action description
  why: string;            // Telemetry & agronomic rationale
  actionText: string;     // Button action
  when: string;           // Execution window
  whatToAvoid: string;    // Crucial farmer-first guidance
  confidence: number;     // 0-100%
  requiredPermission: 'none' | 'supervised' | 'safe_automation';
  contributingTelemetry: Record<string, string | number | boolean>;
  conflictWith?: FarmAgentId[];
  timestamp: string;
}

export interface FarmAgentStatus {
  agentId: FarmAgentId;
  name: string;
  role: string;
  icon: string;
  status: 'active' | 'evaluating' | 'idle' | 'warning' | 'alert';
  lastEvaluated: string;
  confidenceScore: number; // 0 - 100
  activeAlertCount: number;
  currentRecommendation: AgentRecommendation | null;
  contributingTelemetry: Record<string, string | number | boolean>;
  conflictsDetected: string[];
}

export interface ConflictResolution {
  id: string;
  timestamp: string;
  conflictDetected: boolean;
  competingAgents: {
    agentId: FarmAgentId;
    agentName: string;
    advice: string;
    priorityRank: number;
  }[];
  winningAgent: FarmAgentId;
  losingAgent: FarmAgentId;
  deterministicReason: string;
  finalSupervisedRecommendation: AgentRecommendation;
  priorityHierarchyApplied: string;
}

export interface FarmEventType {
  id: string;
  type: 
    | 'soil_moisture_changed'
    | 'weather_warning'
    | 'heavy_rain_forecast'
    | 'heat_risk_detected'
    | 'crop_stage_changed'
    | 'disease_risk_increased'
    | 'sensor_disconnected'
    | 'sensor_reconnected'
    | 'water_reserve_low'
    | 'pump_anomaly'
    | 'market_price_changed'
    | 'harvest_window_approaching'
    | 'farm_expense_added'
    | 'irrigation_completed'
    | 'irrigation_verification_completed';
  timestamp: string;
  affectedZoneOrDomain: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  payload: Record<string, any>;
  description: string;
}

export interface DailyFarmBriefing {
  id: string;
  generatedAt: string;
  greeting: string;
  headline: string;
  overallFarmHealth: 'Excellent' | 'Good' | 'Attention Needed' | 'Critical Alert';
  overallHealthScore: number; // 0-100
  top3Priorities: {
    id: string;
    rank: number;
    title: string;
    summary: string;
    actionLabel: string;
    targetTab: string;
    agentSource: FarmAgentId;
    urgency: 'Immediate' | 'Today' | 'This Week';
  }[];
  weatherSummary: string;
  waterSummary: string;
  cropSummary: string;
  riskSummary: string;
  moneySummary: string;
  upcomingTask: string;
  voiceScript: string;
}

export interface FarmEmergencyAlert {
  id: string;
  title: string;
  severity: 'high' | 'critical';
  triggerType: string;
  whatHappened: string;
  affectedField: string;
  seriousnessLevel: 'High Risk' | 'Critical Emergency';
  whatToDoNow: string;
  whatToAvoid: string;
  whenToCheckAgain: string;
  isActive: boolean;
  timestamp: string;
}

export interface WhatIfScenario {
  id: string;
  title: string;
  decisionA: {
    label: string;
    description: string;
    waterRequirementLiters: number;
    expectedCropStress: number; // 0-100
    estimatedCostInr: number;
    expectedYieldImpactQuintals: number;
    riskScore: number; // 0-100
    potentialRevenueInr: number;
  };
  decisionB: {
    label: string;
    description: string;
    waterRequirementLiters: number;
    expectedCropStress: number; // 0-100
    estimatedCostInr: number;
    expectedYieldImpactQuintals: number;
    riskScore: number; // 0-100
    potentialRevenueInr: number;
  };
  recommendedChoice: 'A' | 'B';
  agronomicRationale: string;
  confidencePercent: number;
}

export interface ActionPermissionRequest {
  id: string;
  actionType: 'start_pump' | 'stop_pump' | 'adjust_duration' | 'schedule_spray' | 'postpone_irrigation' | 'log_expense';
  title: string;
  description: string;
  targetZoneOrEquipment: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  permissionMode: ActionPermissionMode;
  approvedByFarmer: boolean | null;
  executionStatus: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'verification_pending' | 'verified';
  initiatedByAgent: FarmAgentId;
  timestamp: string;
  executionTime?: string;
  verificationDetails?: string;
}

export interface ClosedLoopVerificationRecord {
  id: string;
  actionId: string;
  actionName: string;
  targetZone: string;
  preActionTelemetry: {
    moisturePercent?: number;
    temperatureC?: number;
    pumpStatus?: string;
    timestamp: string;
  };
  postActionTelemetry: {
    moisturePercent?: number;
    temperatureC?: number;
    pumpStatus?: string;
    timestamp: string;
  };
  expectedResponse: string;
  observedResponse: string;
  isVerified: boolean;
  status: 'Verified Effective' | 'Partially Effective' | 'Awaiting Sensor' | 'Requires Manual Check';
  notes: string;
}

export interface FarmAuditLogRecord {
  id: string;
  timestamp: string;
  triggeredEvent: string;
  agentsActivated: FarmAgentId[];
  telemetrySnapshot: Record<string, any>;
  supervisorRecommendation: string;
  riskLevel: string;
  permissionRequested: string;
  farmerDecision: 'Approved' | 'Modified' | 'Rejected' | 'Automated';
  actionPerformed: string;
  verificationResult: string;
}
