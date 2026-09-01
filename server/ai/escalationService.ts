import fs from 'fs';
import path from 'path';
import { AIEscalation } from './types';
import { FarmerAgentService } from './farmerAgentService';

const ESCALATIONS_FILE_PATH = path.join(process.cwd(), 'data', 'ai_escalations.json');

let escalationsStore: AIEscalation[] = [];

function loadEscalations() {
  try {
    if (fs.existsSync(ESCALATIONS_FILE_PATH)) {
      const raw = fs.readFileSync(ESCALATIONS_FILE_PATH, 'utf-8');
      escalationsStore = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading AI escalations:', err);
  }
}

function saveEscalations() {
  try {
    fs.writeFileSync(ESCALATIONS_FILE_PATH, JSON.stringify(escalationsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving AI escalations:', err);
  }
}

loadEscalations();

export class EscalationService {
  /**
   * Create an escalation ticket for a human adviser.
   */
  static createEscalation(
    farmerId: string,
    farmerName: string,
    agentId: string,
    reason: string,
    contextSummary: string,
    farmerPhone?: string
  ): AIEscalation {
    const escalation: AIEscalation = {
      id: `ESC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      farmerId,
      farmerName,
      farmerPhone,
      agentId,
      reason,
      status: 'PENDING',
      contextSummary,
      createdAt: new Date().toISOString()
    };

    escalationsStore.unshift(escalation);
    saveEscalations();

    // Log audit event
    FarmerAgentService.logAuditEvent(
      'HUMAN_ESCALATION_CREATED',
      'AI_ORCHESTRATOR',
      'system',
      escalation.id,
      { farmerId, reason }
    );

    return escalation;
  }

  /**
   * Retrieve all pending escalations for human advisers / admin.
   */
  static getEscalations(status?: AIEscalation['status']): AIEscalation[] {
    if (!status) return escalationsStore;
    return escalationsStore.filter((e) => e.status === status);
  }

  /**
   * Resolve an escalation ticket.
   */
  static resolveEscalation(
    escalationId: string,
    adviserId: string,
    adviserName: string
  ): AIEscalation | null {
    const esc = escalationsStore.find((e) => e.id === escalationId);
    if (!esc) return null;

    esc.status = 'RESOLVED';
    esc.assignedAdviserId = adviserId;
    esc.assignedAdviserName = adviserName;
    esc.resolvedAt = new Date().toISOString();

    saveEscalations();
    return esc;
  }
}
