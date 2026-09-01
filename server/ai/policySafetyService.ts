import { AIRiskLevel, AgentContext } from './types';

export class PolicySafetyService {
  /**
   * Forbidden keyword patterns that AI must never attempt or simulate.
   */
  private static FORBIDDEN_INTENTS = [
    'change password',
    'reset password',
    'modify role',
    'make admin',
    'delete farmer',
    'delete account',
    'transfer money',
    'purchase order directly',
    'modify ledger',
    'fake transaction',
    'override inventory'
  ];

  /**
   * Evaluates the risk level of the query and context.
   */
  static evaluateRisk(query: string, context: AgentContext): {
    riskLevel: AIRiskLevel;
    requiresEscalation: boolean;
    reason?: string;
    isForbidden: boolean;
  } {
    const q = query.toLowerCase();

    // 1. Check for forbidden actions
    for (const forbidden of this.FORBIDDEN_INTENTS) {
      if (q.includes(forbidden)) {
        return {
          riskLevel: 'HIGH',
          requiresEscalation: true,
          reason: `Forbidden administrative or financial operation detected: "${forbidden}"`,
          isForbidden: true
        };
      }
    }

    // 2. Check for high-toxicity or extreme agricultural pesticide emergencies
    if (
      q.includes('poison') ||
      q.includes('toxic') ||
      q.includes('severe chemical burn') ||
      q.includes('catastrophic crop collapse') ||
      q.includes('illegal chemical')
    ) {
      return {
        riskLevel: 'HIGH',
        requiresEscalation: true,
        reason: 'High-risk agrochemical or emergency condition requiring agronomist verification.',
        isForbidden: false
      };
    }

    // 3. Medium risk: disease outbreaks or unfamiliar aggressive fungal symptoms
    if (
      q.includes('epidemic') ||
      q.includes('entire field wilting') ||
      q.includes('unexplained leaf drop') ||
      q.includes('heavy pest infestation')
    ) {
      return {
        riskLevel: 'MEDIUM',
        requiresEscalation: false,
        reason: 'Significant pest/disease alert requiring close farmer monitoring.',
        isForbidden: false
      };
    }

    // 4. Low risk: general agronomy, weather, fertilizer scheduling, water guidelines
    return {
      riskLevel: 'LOW',
      requiresEscalation: false,
      isForbidden: false
    };
  }

  /**
   * Validates if recommendation violates safety thresholds.
   */
  static validateConfidenceAndSafety(confidence: number, riskLevel: AIRiskLevel): {
    allowed: boolean;
    escalate: boolean;
    reason?: string;
  } {
    if (riskLevel === 'HIGH') {
      return {
        allowed: false,
        escalate: true,
        reason: 'High risk agro-management decision requires certified agronomist signoff.'
      };
    }

    if (confidence < 70) {
      return {
        allowed: false,
        escalate: true,
        reason: `AI model confidence score (${confidence}%) is below minimum threshold (70%).`
      };
    }

    return {
      allowed: true,
      escalate: false
    };
  }
}
