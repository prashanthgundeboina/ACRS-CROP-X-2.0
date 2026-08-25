import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './irrigationAgent';
import { harvestIntelligenceService } from '../../operations/harvestIntelligenceService';
import { cropLifecycleService } from '../../operations/cropLifecycleService';

export const harvestAgent = {
  id: 'harvest' as const,
  name: 'Harvest Readiness & Logistics Agent',
  role: 'Coordinates maturity indices, harvest labor windows, transport crates, and post-harvest holding to minimize field losses.',
  icon: 'Calendar',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const lifecycle = cropLifecycleService.evaluateLifecycle(ctx.cropName || 'Tomato');
    const harvestInsight = harvestIntelligenceService.evaluateHarvestStatus(lifecycle);

    let severity: AgentRecommendation['severity'] = 'LOW';
    let headline = `Harvest Window: ~${harvestInsight.daysRemaining} Days (${harvestInsight.status})`;
    let what = harvestInsight.message;
    let why = `Crop lifecycle is in ${lifecycle.currentStageName} with ${harvestInsight.ripenessPercentage}% physiological maturity.`;
    let actionText = harvestInsight.action;
    let when = `Target picking window: ~${harvestInsight.daysRemaining} days`;
    let whatToAvoid = harvestInsight.avoid;
    let confidence = 91;

    if (harvestInsight.daysRemaining <= 5) {
      severity = 'HIGH';
      headline = `Harvest Window Active (~${harvestInsight.daysRemaining} Days Remaining) — Mobilize Crates & Labor`;
      what = `Confirm local picking crew, sanitize plastic harvesting crates, and pre-book mandi transport vehicle.`;
      why = `Ripeness index is at ${harvestInsight.ripenessPercentage}%. Recommended picking weather: ${harvestInsight.recommendedPickingWeather}.`;
      actionText = 'Confirm Harvest Logistics';
      when = 'Within 48 hours';
      whatToAvoid = 'Avoid harvesting during intense midday heat; schedule early morning picking (6 AM - 10 AM).';
      confidence = 94;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-harv-${Date.now()}`,
      agentId: 'harvest',
      agentName: 'Harvest Readiness & Logistics Agent',
      domain: 'Maturity & Post-Harvest Logistics',
      severity,
      headline,
      what,
      why,
      actionText,
      when,
      whatToAvoid,
      confidence,
      requiredPermission: severity === 'HIGH' ? 'supervised' : 'none',
      contributingTelemetry: {
        daysToHarvest: harvestInsight.daysRemaining,
        readinessStatus: harvestInsight.status,
        optimalHarvestWindow: harvestInsight.recommendedPickingWeather,
        ripenessPercentage: harvestInsight.ripenessPercentage
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'harvest',
      name: 'Harvest & Logistics Agent',
      role: 'Maturity & Supply Chain Coordinator',
      icon: 'Calendar',
      status: severity === 'HIGH' ? 'warning' : 'active',
      lastEvaluated: 'Just now',
      confidenceScore: confidence,
      activeAlertCount: severity === 'HIGH' ? 1 : 0,
      currentRecommendation: recommendation,
      contributingTelemetry: recommendation.contributingTelemetry,
      conflictsDetected: []
    };

    return { status, recommendation };
  }
};
