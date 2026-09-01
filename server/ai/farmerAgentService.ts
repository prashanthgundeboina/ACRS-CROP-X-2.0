import fs from 'fs';
import path from 'path';
import {
  FarmerAIAgent,
  AIAutomationSettings,
  AIAutomationMode,
  AIAgentStatus,
  AIAuditEvent
} from './types';
import { MemoryService } from './memoryService';

const AGENTS_FILE_PATH = path.join(process.cwd(), 'data', 'farmer_ai_agents.json');
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'ai_automation_settings.json');
const AUDIT_FILE_PATH = path.join(process.cwd(), 'data', 'ai_audit_events.json');

// In-memory state
let agentsMap: Map<string, FarmerAIAgent> = new Map(); // keyed by farmerId
let auditEvents: AIAuditEvent[] = [];

let globalSettings: AIAutomationSettings = {
  id: 'GLOBAL_SETTINGS',
  automationEnabled: true,
  automationMode: 'HYBRID',
  emergencyStop: false,
  totalActiveAgents: 0,
  pausedAgents: 0,
  consultationsToday: 14,
  escalationsToday: 2,
  averageConfidence: 94.2,
  highRiskBlockedToday: 1,
  updatedBy: 'SYSTEM_INIT',
  updatedAt: new Date().toISOString()
};

function loadState() {
  try {
    if (fs.existsSync(AGENTS_FILE_PATH)) {
      const raw = fs.readFileSync(AGENTS_FILE_PATH, 'utf-8');
      const list: FarmerAIAgent[] = JSON.parse(raw);
      agentsMap.clear();
      for (const a of list) {
        agentsMap.set(a.farmerId, a);
      }
    }

    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      globalSettings = JSON.parse(raw);
    }

    if (fs.existsSync(AUDIT_FILE_PATH)) {
      const raw = fs.readFileSync(AUDIT_FILE_PATH, 'utf-8');
      auditEvents = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading AI agent state:', err);
  }
}

function saveState() {
  try {
    const list = Array.from(agentsMap.values());
    fs.writeFileSync(AGENTS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(globalSettings, null, 2), 'utf-8');
    fs.writeFileSync(AUDIT_FILE_PATH, JSON.stringify(auditEvents, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving AI agent state:', err);
  }
}

loadState();

export class FarmerAgentService {
  /**
   * Log an immutable AI audit event.
   */
  static logAuditEvent(
    eventType: AIAuditEvent['eventType'],
    actorId: string,
    actorRole: string,
    targetId: string | undefined,
    details: Record<string, any>
  ): AIAuditEvent {
    const event: AIAuditEvent = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      actorId,
      actorRole,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    auditEvents.unshift(event);
    if (auditEvents.length > 200) auditEvents = auditEvents.slice(0, 200);
    saveState();
    return event;
  }

  static getAuditEvents(): AIAuditEvent[] {
    return auditEvents;
  }

  /**
   * Retrieve global AI automation settings.
   */
  static getGlobalSettings(): AIAutomationSettings {
    const all = Array.from(agentsMap.values());
    globalSettings.totalActiveAgents = all.filter((a) => a.status === 'ACTIVE').length;
    globalSettings.pausedAgents = all.filter((a) => a.status === 'PAUSED').length;
    return { ...globalSettings };
  }

  /**
   * Update global automation mode or master switch.
   */
  static updateGlobalSettings(
    enabled: boolean,
    mode: AIAutomationMode,
    actorId: string = 'ADMIN'
  ): AIAutomationSettings {
    globalSettings.automationEnabled = enabled;
    globalSettings.automationMode = mode;
    globalSettings.updatedBy = actorId;
    globalSettings.updatedAt = new Date().toISOString();

    this.logAuditEvent(
      enabled ? 'AUTOMATION_ENABLED' : 'AUTOMATION_DISABLED',
      actorId,
      'admin',
      'GLOBAL',
      { mode, enabled }
    );

    saveState();
    return this.getGlobalSettings();
  }

  /**
   * Emergency Kill Switch.
   */
  static triggerEmergencyKillSwitch(actorId: string = 'ADMIN'): AIAutomationSettings {
    globalSettings.emergencyStop = true;
    globalSettings.automationEnabled = false;
    globalSettings.updatedBy = actorId;
    globalSettings.updatedAt = new Date().toISOString();

    // Pause all agents
    for (const [fId, agent] of agentsMap.entries()) {
      if (agent.status === 'ACTIVE') {
        agent.status = 'PAUSED';
        agent.updatedAt = new Date().toISOString();
        agentsMap.set(fId, agent);
      }
    }

    this.logAuditEvent('EMERGENCY_KILL_SWITCH_ACTIVATED', actorId, 'admin', 'GLOBAL', {
      action: 'Emergency Stop All AI Agents'
    });

    saveState();
    return this.getGlobalSettings();
  }

  /**
   * Resume from Emergency Kill Switch.
   */
  static resetEmergencyKillSwitch(actorId: string = 'ADMIN'): AIAutomationSettings {
    globalSettings.emergencyStop = false;
    globalSettings.automationEnabled = true;
    globalSettings.updatedBy = actorId;
    globalSettings.updatedAt = new Date().toISOString();

    // Restore paused agents to active
    for (const [fId, agent] of agentsMap.entries()) {
      if (agent.status === 'PAUSED') {
        agent.status = 'ACTIVE';
        agent.updatedAt = new Date().toISOString();
        agentsMap.set(fId, agent);
      }
    }

    this.logAuditEvent('AUTOMATION_ENABLED', actorId, 'admin', 'GLOBAL', {
      action: 'Emergency Stop Reset'
    });

    saveState();
    return this.getGlobalSettings();
  }

  /**
   * Idempotent provision or fetch of a farmer's personal AI adviser profile.
   */
  static provisionOrGetAgent(farmer: {
    id: string;
    name: string;
    phone?: string;
    location?: string;
    primaryCrop?: string;
    farmSizeAcres?: number;
    language?: string;
  }): FarmerAIAgent {
    if (!farmer || !farmer.id) throw new Error('Valid farmer data with ID required');

    let agent = agentsMap.get(farmer.id);
    const now = new Date().toISOString();

    if (!agent) {
      agent = {
        id: `AGT-FRM-${farmer.id.substring(0, 8)}`,
        farmerId: farmer.id,
        farmerName: farmer.name,
        phoneNumber: farmer.phone,
        location: farmer.location || 'Rural Farm Sector',
        primaryCrop: farmer.primaryCrop || 'Paddy (Rice)',
        farmSizeAcres: farmer.farmSizeAcres || 3.5,
        status: globalSettings.emergencyStop ? 'PAUSED' : 'ACTIVE',
        automationMode: globalSettings.automationMode,
        language: farmer.language || 'en',
        confidenceScore: 95.0,
        humanEscalationRequired: false,
        activeIssuesCount: 0,
        createdAt: now,
        updatedAt: now
      };
      agentsMap.set(farmer.id, agent);

      // Seed foundational memories for this farmer
      MemoryService.upsertMemory(
        farmer.id,
        agent.id,
        'identity',
        'farmer_name',
        farmer.name,
        'ONBOARDING'
      );
      if (farmer.primaryCrop) {
        MemoryService.upsertMemory(
          farmer.id,
          agent.id,
          'crops',
          'primary_crop',
          farmer.primaryCrop,
          'ONBOARDING'
        );
      }
      if (farmer.location) {
        MemoryService.upsertMemory(
          farmer.id,
          agent.id,
          'farm',
          'farm_location',
          farmer.location,
          'ONBOARDING'
        );
      }

      this.logAuditEvent('AGENT_PROVISIONED', 'SYSTEM', 'system', agent.id, {
        farmerId: farmer.id,
        farmerName: farmer.name
      });

      saveState();
    } else {
      // Update profile info if changed
      let changed = false;
      if (farmer.name && agent.farmerName !== farmer.name) {
        agent.farmerName = farmer.name;
        changed = true;
      }
      if (farmer.language && agent.language !== farmer.language) {
        agent.language = farmer.language;
        changed = true;
      }
      if (changed) {
        agent.updatedAt = now;
        agentsMap.set(farmer.id, agent);
        saveState();
      }
    }

    return agent;
  }

  /**
   * Get all registered farmer agents (for Admin view).
   */
  static getAllAgents(): FarmerAIAgent[] {
    return Array.from(agentsMap.values());
  }

  /**
   * Get a single agent by farmer ID.
   */
  static getAgentByFarmerId(farmerId: string): FarmerAIAgent | null {
    return agentsMap.get(farmerId) || null;
  }

  /**
   * Update agent status (e.g. Pause, Resume, Escalate).
   */
  static setAgentStatus(
    farmerId: string,
    status: AIAgentStatus,
    actorId: string = 'ADMIN'
  ): FarmerAIAgent {
    const agent = agentsMap.get(farmerId);
    if (!agent) throw new Error('Farmer agent not found');

    agent.status = status;
    agent.updatedAt = new Date().toISOString();
    agentsMap.set(farmerId, agent);

    this.logAuditEvent(
      status === 'PAUSED' ? 'AGENT_PAUSED' : 'AGENT_RESUMED',
      actorId,
      'admin',
      agent.id,
      { farmerId, newStatus: status }
    );

    saveState();
    return agent;
  }
}
