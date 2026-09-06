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
   * - If confidence < 60%: Must flag for human agronomist review.
   * - If riskLevel == 'CRITICAL' or 'HIGH': Must NOT be auto-presented as authoritative; require agronomist confirmation.
   */
  static validateConfidenceAndSafety(confidence: number, riskLevel: AIRiskLevel): {
    allowed: boolean;
    escalate: boolean;
    reason?: string;
  } {
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      return {
        allowed: false,
        escalate: true,
        reason: `${riskLevel} risk agro-management decision requires certified agronomist review and signoff.`
      };
    }

    if (confidence < 60) {
      return {
        allowed: false,
        escalate: true,
        reason: `AI model confidence score (${confidence.toFixed(1)}%) is below minimum threshold (60%). Flagged for human agronomist verification.`
      };
    }

    return {
      allowed: true,
      escalate: false
    };
  }

  /**
   * Audits recommendation text and automatically injects mandatory safety precautions
   * and financial disclaimers adhering to strict agronomic and financial governance.
   */
  static auditRecommendationContent(text: string, intent: string): string {
    let audited = text;
    const lower = text.toLowerCase();

    // 1. Chemical treatment governance
    const isChemicalSuggested =
      lower.includes('spray') ||
      lower.includes('chemical') ||
      lower.includes('pesticide') ||
      lower.includes('fungicide') ||
      lower.includes('herbicide') ||
      lower.includes('insecticide') ||
      lower.includes('chlorpyrifos') ||
      lower.includes('carbendazim') ||
      lower.includes('mancozeb') ||
      lower.includes('imidacloprid') ||
      lower.includes('ml/l') ||
      lower.includes('g/l');

    if (isChemicalSuggested && !lower.includes('mandatory agrochemical safety advisory')) {
      audited +=
        `\n\n[MANDATORY AGROCHEMICAL SAFETY ADVISORY]:\n` +
        `• Protective Equipment: Always wear gloves, eye protection, and protective mask during mixing and spraying.\n` +
        `• Dosage Constraints: Strictly adhere to calibrated dosage per acre. Do not overdose to prevent phytotoxicity.\n` +
        `• Pre-Harvest Interval (PHI): Observe mandatory withholding period (7–14 days) prior to crop harvesting.\n` +
        `• Environmental Caution: Do not spray near water sources or during peak honeybee / pollinator foraging hours.`;
    }

    // 2. Financial recommendation governance
    const isFinancialSuggested =
      intent === 'FARM_ECONOMICS' ||
      intent === 'MARKET' ||
      lower.includes('mandi price') ||
      lower.includes('per quintal') ||
      lower.includes('revenue') ||
      lower.includes('cost of cultivation') ||
      lower.includes('profit realization');

    if (isFinancialSuggested && !lower.includes('financial disclaimer')) {
      audited +=
        `\n\n[FINANCIAL DISCLAIMER]:\n` +
        `• Financial figures and price realizations are indicative market estimates. Always verify prevailing spot rates directly with your licensed local APMC mandi or buyer before executing sales.`;
    }

    return audited;
  }
}

