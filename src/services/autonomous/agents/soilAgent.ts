import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './irrigationAgent';

export const soilAgent = {
  id: 'soil' as const,
  name: 'Soil Chemistry & Nutrition Agent',
  role: 'Interprets N-P-K nutrient reserves, pH buffering, electrical conductivity (EC), and organic matter fertility.',
  icon: 'TestTube',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const n = ctx.soilData.nitrogen ?? 85;
    const p = ctx.soilData.phosphorus ?? 45;
    const k = ctx.soilData.potassium ?? 48;
    const ph = ctx.soilData.ph ?? 6.5;

    let severity: AgentRecommendation['severity'] = 'LOW';
    let headline = 'Soil Nutrition & pH in Desired Range';
    let what = `Soil fertility profile is balanced (N: ${n} ppm, P: ${p} ppm, K: ${k} ppm, pH: ${ph}).`;
    let why = `Nutrient availability index is optimal for root ion exchange without lockup or salinity accumulation.`;
    let actionText = 'View Soil Profile';
    let when = 'Next scheduled fertigation in 4 days';
    let whatToAvoid = 'Avoid excess nitrogen broadcasting to prevent vegetative lodging.';
    let confidence = 95;

    if (ph < 5.8 || ph > 7.8) {
      severity = 'HIGH';
      headline = `Soil pH Alert (${ph.toFixed(1)}) — Nutrient Availability Restricted`;
      what = ph < 5.8 
        ? `Apply agricultural lime / dolomite at 200 kg/acre to neutralize subsoil acidity.`
        : `Apply gypsum / elemental sulfur at 150 kg/acre to reduce alkalinity lockup.`;
      why = `Extreme pH restricts phosphorus and micronutrient uptake at the root zone membrane.`;
      actionText = 'Schedule Soil Amendment';
      when = 'Before next fertigation cycle';
      whatToAvoid = 'Avoid immediate heavy chemical fertilizers until pH buffer is stabilized.';
      confidence = 92;
    } else if (n < 60) {
      severity = 'MEDIUM';
      headline = `Nitrogen Depletion Detected (${n} ppm)`;
      what = `Plan split application of urea or water-soluble 19-19-19 via drip fertigation.`;
      why = `Nitrogen level is falling below the vegetative threshold required for chlorophyll synthesis.`;
      actionText = 'Prepare Fertigation Mix';
      when = 'Within 48 hours';
      whatToAvoid = 'Do not apply urea right before heavy rainfall to prevent runoff leaching.';
      confidence = 94;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-soil-${Date.now()}`,
      agentId: 'soil',
      agentName: 'Soil Chemistry & Nutrition Agent',
      domain: 'Soil Chemistry & Fertility',
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
        nitrogenPpm: n,
        phosphorusPpm: p,
        potassiumPpm: k,
        soilPh: ph,
        organicMatterPercent: ctx.soilData.organic_matter ?? 2.8
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'soil',
      name: 'Soil Chemistry Agent',
      role: 'NPK & pH Nutrient Profiler',
      icon: 'TestTube',
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
